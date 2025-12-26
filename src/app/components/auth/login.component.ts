import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './service/auth.service';
import { UserLogin } from './model/auth.model'
import { LocalStorageService } from '../../services/storage.service'
import { NotificationService } from '../../services/notification.service';
import { ToastNotificationsComponent } from '../shared/toast-notifications.component/toast-notifications.component';
import { ModalChangePasswordComponent } from './modal-change-password.component';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ToastNotificationsComponent, ModalChangePasswordComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';
  showChangePasswordModal = false;
  currentLoginName = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private localService: LocalStorageService,
    private notificationService: NotificationService
  ) { }


  async login() {
    this.loading = true;
    const currentLogin: UserLogin = {
      LoginName: this.email ?? '',
      Password: this.password ?? ''
    };
    (await this.authService.login('user/Login', currentLogin)).subscribe({
      next: (resp) => {
        localStorage.setItem('User', JSON.stringify(resp));
        this.loading = false;

        if (resp.contrasenaCambiada === false) {
          this.currentLoginName = resp.loginName;
          this.showChangePasswordModal = true;
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (resp) => {
        if (resp.status = 422) {
          this.notificationService.warning(resp.error.messages[0].msg)
          this.loading = false;

        }
        else {
          this.notificationService.error(resp.message)
          this.logout()
          this.loading = false;
        }
      }
    })
  }

  onPasswordChanged() {
    this.showChangePasswordModal = false;
    this.notificationService.success('Contraseña cambiada exitosamente. Redirigiendo...');
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1000);
  }

  onCloseModal() {
    this.showChangePasswordModal = false;
    this.logout();
  }
  async onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Por favor, completa todos los campos';
      return;
    }

    this.loading = true;
    this.error = '';

    localStorage.setItem('mockUser', JSON.stringify({ email: this.email }));

    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/dashboard']);
    }, 500);
  }

  logout() {
    localStorage.removeItem('User');
  }
}
