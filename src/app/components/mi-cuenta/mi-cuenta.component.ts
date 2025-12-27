import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth/service/auth.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingComponent } from '../shared/loading.component/loading.component';

@Component({
  selector: 'app-mi-cuenta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './mi-cuenta.component.html',
  styleUrls: ['./mi-cuenta.component.scss']
})
export class MiCuentaComponent implements OnInit {
  changePasswordForm!: FormGroup;
  loading = false;
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  userData: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    const userStr = localStorage.getItem('User');
    if (userStr) {
      this.userData = JSON.parse(userStr);
    }
  }

  async onSubmitChangePassword() {
    if (this.changePasswordForm.invalid) {
      this.notificationService.error('Por favor completa todos los campos');
      return;
    }

    const { oldPassword, newPassword, confirmPassword } = this.changePasswordForm.value;

    if (newPassword !== confirmPassword) {
      this.notificationService.error('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      this.notificationService.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.loading = true;

    (await this.authService.changePassword(this.userData.loginName, oldPassword, newPassword)).subscribe({
      next: (response) => {
        if (response && response.messages) {
          const successMsg = response.messages.find((m: any) => m.type.toLowerCase() === 'success');
          if (successMsg) {
            this.notificationService.success('Contraseña cambiada exitosamente');
            this.changePasswordForm.reset();
          } else {
            const errorMsg = response.messages.find((m: any) => m.type.toLowerCase() === 'error');
            this.notificationService.error(errorMsg?.msg || 'Error al cambiar la contraseña');
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cambiar contraseña:', error);
        this.notificationService.error('Error al procesar la solicitud');
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility(field: 'old' | 'new' | 'confirm') {
    if (field === 'old') {
      this.showOldPassword = !this.showOldPassword;
    } else if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
}
