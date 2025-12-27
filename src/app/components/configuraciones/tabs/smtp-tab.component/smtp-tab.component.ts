import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SmtpService } from '../../service/smtp.service';
import { SmtpConfig, SmtpProvider } from '../../model/smtp.model';
import { NotificationService } from '../../../../services/notification.service';
import { LoadingComponent } from '../../../shared/loading.component/loading.component';

@Component({
  selector: 'app-smtp-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './smtp-tab.component.html',
  styleUrls: ['./smtp-tab.component.scss']
})
export class SmtpTabComponent implements OnInit {
  loading = false;
  smtpConfigs: SmtpConfig[] = [];
  smtpForm!: FormGroup;
  showForm = false;
  idEmpresa: number = 0;
  showPassword = false;
  creadoPor: string = '';

  smtpProviders: SmtpProvider[] = [
    { name: 'Gmail', host: 'smtp.gmail.com', port: 587, ssl: true },
    { name: 'Outlook', host: 'smtp-mail.outlook.com', port: 587, ssl: true },
    { name: 'Yahoo', host: 'smtp.mail.yahoo.com', port: 587, ssl: true },
    { name: 'Office 365', host: 'smtp.office365.com', port: 587, ssl: true },
    { name: 'Personalizado', host: '', port: 587, ssl: true }
  ];

  constructor(
    private fb: FormBuilder,
    private smtpService: SmtpService,
    private notificationService: NotificationService
  ) {
    this.initForm();
  }

  ngOnInit() {
    const userStr = localStorage.getItem('User');
    if (userStr) {
      const userData = JSON.parse(userStr);
      this.idEmpresa = userData.idEmpresa;
      this.creadoPor = userData.nombre || 'Usuario';
      this.loadSmtpConfigs();
    }
  }

  initForm() {
    this.smtpForm = this.fb.group({
      proveedor: ['', Validators.required],
      nombrePerfil: ['', Validators.required],
      host: ['', Validators.required],
      puerto: [587, [Validators.required, Validators.min(1)]],
      usuario: ['', [Validators.required, Validators.email]],
      passwordEnc: ['', Validators.required],
      usarSSL: [true],
      fromName: ['', Validators.required],
      fromEmail: ['', [Validators.required, Validators.email]],
      replyToEmail: ['', [Validators.required, Validators.email]],
      predeterminado: [true],
      activo: [true]
    });

    this.smtpForm.get('proveedor')?.valueChanges.subscribe(providerName => {
      this.onProviderChange(providerName);
    });
  }

  onProviderChange(providerName: string) {
    const provider = this.smtpProviders.find(p => p.name === providerName);
    if (provider && provider.name !== 'Personalizado') {
      this.smtpForm.patchValue({
        host: provider.host,
        puerto: provider.port,
        usarSSL: provider.ssl
      });
    }
  }

  loadSmtpConfigs() {
    this.loading = true;
    this.smtpService.getSmtpByEmpresa(this.idEmpresa).subscribe({
      next: (response) => {
        if (response.data) {
          this.smtpConfigs = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar configuraciones SMTP:', error);
        this.notificationService.error('Error al cargar las configuraciones');
        this.loading = false;
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.smtpForm.reset({
        usarSSL: true,
        predeterminado: true,
        activo: true,
        puerto: 587
      });
    }
  }

  onSubmit() {
    if (this.smtpForm.invalid) {
      this.notificationService.error('Por favor completa todos los campos requeridos');
      return;
    }

    this.loading = true;
    const formValue = this.smtpForm.value;
    const request = {
      idEmpresa: this.idEmpresa,
      nombrePerfil: formValue.nombrePerfil,
      host: formValue.host,
      puerto: formValue.puerto,
      usuario: formValue.usuario,
      passwordEnc: formValue.passwordEnc,
      usarSSL: formValue.usarSSL,
      fromName: formValue.fromName,
      fromEmail: formValue.fromEmail,
      replyToEmail: formValue.replyToEmail,
      predeterminado: formValue.predeterminado,
      activo: formValue.activo
    };

    this.smtpService.createSmtp(request).subscribe({
      next: (response) => {
        const successMsg = response.messages?.find((m: any) => m.type === 'success');
        if (successMsg) {
          this.notificationService.success('Configuración SMTP creada exitosamente');
          this.toggleForm();
          this.loadSmtpConfigs();
        }
      },
      error: (error) => {
        console.error('Error al crear configuración SMTP:', error);
        this.notificationService.error('Error al guardar la configuración');
        this.loading = false;
      }
    });
  }

  deleteConfig(id: number) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta configuración SMTP?')) {
      return;
    }

    this.loading = true;
    this.smtpService.deleteSmtp(id).subscribe({
      next: (response) => {
        this.notificationService.success('Configuración eliminada');
        this.loadSmtpConfigs();
      },
      error: (error) => {
        console.error('Error al eliminar configuración:', error);
        this.notificationService.error('Error al eliminar la configuración');
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
