import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './service/auth.service';
import { UserLogin } from './model/auth.model'
import {LocalStorageService} from '../../services/storage.service'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private localService: LocalStorageService
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
        this.router.navigate(['/dashboard']);
      },
      error: (resp) => {
        if (resp.status === 422) {
          this.localService.set('User', JSON.stringify(resp));
          this.loading = true;


        }
      }
    })
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
}
