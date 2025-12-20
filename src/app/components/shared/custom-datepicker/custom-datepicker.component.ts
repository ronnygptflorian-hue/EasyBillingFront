import { Component, Input, Output, EventEmitter, forwardRef, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import flatpickr from 'flatpickr';
import type { Instance } from 'flatpickr/dist/types/instance';

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
  private flatpickrInstance?: Instance;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initFlatpickr();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.flatpickrInstance) {
      this.flatpickrInstance.destroy();
    }
  }

  private initFlatpickr(): void {
    if (!this.dateInput?.nativeElement) return;

    const spanishLocale = {
      weekdays: {
        shorthand: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as [string, string, string, string, string, string, string],
        longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as [string, string, string, string, string, string, string]
      },
      months: {
        shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] as [string, string, string, string, string, string, string, string, string, string, string, string],
        longhand: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'] as [string, string, string, string, string, string, string, string, string, string, string, string]
      },
      firstDayOfWeek: 1,
      rangeSeparator: ' a ',
      weekAbbreviation: 'Sem',
      scrollTitle: 'Desplazar para aumentar',
      toggleTitle: 'Hacer clic para cambiar'
    };

    this.flatpickrInstance = flatpickr(this.dateInput.nativeElement, {
      dateFormat: 'Y-m-d',
      locale: spanishLocale,
      allowInput: false,
      clickOpens: !this.disabled,
      onChange: (selectedDates: Date[], dateStr: string) => {
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
  }

  writeValue(value: string): void {
    this.value = value || '';
    if (this.flatpickrInstance && value) {
      this.flatpickrInstance.setDate(value, false);
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
      if (isDisabled) {
        this.flatpickrInstance.set('clickOpens', false);
      } else {
        this.flatpickrInstance.set('clickOpens', true);
      }
    }
  }
}
