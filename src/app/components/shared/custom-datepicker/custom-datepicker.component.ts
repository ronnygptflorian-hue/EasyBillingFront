import { Component, Input, Output, EventEmitter, forwardRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-custom-datepicker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-datepicker.component.html',
  styleUrls: ['./custom-datepicker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDatepickerComponent),
      multi: true
    }
  ]
})
export class CustomDatepickerComponent implements ControlValueAccessor, OnInit {
  @Input() placeholder: string = 'mm / dd / yyyy';
  @Input() disabled: boolean = false;
  @Output() dateChange = new EventEmitter<string>();

  isOpen = false;
  selectedDate: Date | null = null;
  displayValue: string = '';
  currentMonth: Date = new Date();
  calendarDays: CalendarDay[] = [];
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit() {
    this.generateCalendar();
  }

  writeValue(value: string): void {
    if (value) {
      this.selectedDate = new Date(value);
      this.displayValue = this.formatDate(this.selectedDate);
      this.currentMonth = new Date(this.selectedDate);
      this.generateCalendar();
    } else {
      this.selectedDate = null;
      this.displayValue = '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggleCalendar() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.onTouched();
    }
  }

  closeCalendar() {
    setTimeout(() => {
      this.isOpen = false;
    }, 200);
  }

  selectDate(day: CalendarDay) {
    if (!day.isCurrentMonth) {
      return;
    }

    this.selectedDate = day.date;
    this.displayValue = this.formatDate(day.date);
    const isoString = this.toISOString(day.date);
    this.onChange(isoString);
    this.dateChange.emit(isoString);
    this.generateCalendar();
    this.isOpen = false;
  }

  previousMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1);
    this.generateCalendar();
  }

  goToToday() {
    const today = new Date();
    this.currentMonth = new Date(today);
    this.selectDate({
      date: today,
      day: today.getDate(),
      isCurrentMonth: true,
      isToday: true,
      isSelected: false
    });
  }

  clearDate() {
    this.selectedDate = null;
    this.displayValue = '';
    this.onChange('');
    this.dateChange.emit('');
    this.currentMonth = new Date();
    this.generateCalendar();
    this.isOpen = false;
  }

  private generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);

    const firstDayOfWeek = firstDay.getDay();
    const lastDateOfMonth = lastDay.getDate();
    const prevLastDate = prevLastDay.getDate();

    this.calendarDays = [];

    for (let i = firstDayOfWeek; i > 0; i--) {
      const date = new Date(year, month - 1, prevLastDate - i + 1);
      this.calendarDays.push({
        date,
        day: prevLastDate - i + 1,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    for (let day = 1; day <= lastDateOfMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = this.isToday(date);
      const isSelected = this.isSelectedDate(date);

      this.calendarDays.push({
        date,
        day,
        isCurrentMonth: true,
        isToday,
        isSelected
      });
    }

    const remainingDays = 42 - this.calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      this.calendarDays.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  private isSelectedDate(date: Date): boolean {
    if (!this.selectedDate) return false;
    return date.getDate() === this.selectedDate.getDate() &&
           date.getMonth() === this.selectedDate.getMonth() &&
           date.getFullYear() === this.selectedDate.getFullYear();
  }

  private formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month} / ${day} / ${year}`;
  }

  private toISOString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get currentMonthYear(): string {
    return `${this.monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;
  }
}
