import { Component, Input, Output, EventEmitter, forwardRef, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import flatpickr from 'flatpickr';
import { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import { Spanish } from 'flatpickr/dist/l10n/es.js';

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
export class CustomDatepickerComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @ViewChild('dateInput') dateInput!: ElementRef<HTMLInputElement>;
  @Input() placeholder: string = 'Seleccionar fecha';
  @Input() disabled: boolean = false;
  @Output() dateChange = new EventEmitter<string>();

  value: string = '';
  private flatpickrInstance?: FlatpickrInstance;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterViewInit(): void {
    this.initFlatpickr();
  }

  ngOnDestroy(): void {
    if (this.flatpickrInstance) {
      this.flatpickrInstance.destroy();
    }
  }

  private initFlatpickr(): void {
    if (!this.dateInput) return;

    this.flatpickrInstance = flatpickr(this.dateInput.nativeElement, {
      dateFormat: 'Y-m-d',
      locale: Spanish,
      allowInput: true,
      onChange: (selectedDates, dateStr) => {
        this.value = dateStr;
        this.onChange(dateStr);
        this.dateChange.emit(dateStr);
      },
      onClose: () => {
        this.onTouched();
      }
    });

    if (this.value) {
      this.flatpickrInstance.setDate(this.value, false);
    }

    if (this.disabled) {
      this.flatpickrInstance.set('clickOpens', false);
    }
  }

  writeValue(value: string): void {
    this.value = value || '';
    if (this.flatpickrInstance) {
      this.flatpickrInstance.setDate(value || '', false);
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
    if (this.flatpickrInstance) {
      this.flatpickrInstance.set('clickOpens', !isDisabled);
    }
  }
}
