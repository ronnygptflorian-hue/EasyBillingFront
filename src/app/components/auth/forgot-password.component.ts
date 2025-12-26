import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './service/auth.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingComponent } from '../shared/loading.component/loading.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotForm!: FormGroup;
  loading = false;
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      loginName: ['', [Validators.required]]
    });
  }

  async onSubmit() {
    if (this.forgotForm.invalid) {
      this.notificationService.error('Por favor ingrese su nombre de usuario');
      return;
    }

    this.loading = true;
    const loginName = this.forgotForm.value.loginName;

    (await this.authService.forgetPassword(loginName)).subscribe({
      next: (response) => {
        if (response && response.messages) {
          const successMsg = response.messages.find((m: any) => m.type.toLowerCase() === 'success');
          if (successMsg) {
            this.emailSent = true;
            this.notificationService.success(successMsg.msg);
          } else {
            const errorMsg = response.messages.find((m: any) => m.type.toLowerCase() === 'error');
            this.notificationService.error(errorMsg?.msg || 'Error al enviar el correo');
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error en forgot password:', error);
        this.notificationService.error('Error al procesar la solicitud');
        this.loading = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
