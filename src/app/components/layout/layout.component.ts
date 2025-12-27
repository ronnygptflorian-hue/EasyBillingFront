import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { ToastNotificationsComponent } from '../shared/toast-notifications.component/toast-notifications.component';
import { ModalChangePasswordComponent } from '../auth/modal-change-password.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, ToastNotificationsComponent, ModalChangePasswordComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  user: any = null;
  showProfileMenu = false;
  showChangePasswordModal = false;
  userData: any = null;

  constructor(private router: Router) { }

  ngOnInit() {
    const mockUser = localStorage.getItem('mockUser');
    if (mockUser) {
      this.user = JSON.parse(mockUser);
    }

    const userStr = localStorage.getItem('User');
    if (userStr) {
      this.userData = JSON.parse(userStr);
    }
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  closeProfileMenu() {
    this.showProfileMenu = false;
  }

  goToMiCuenta() {
    this.showProfileMenu = false;
    this.router.navigate(['/mi-cuenta']);
  }

  openChangePasswordModal() {
    this.showProfileMenu = false;
    this.showChangePasswordModal = true;
  }

  closeChangePasswordModal() {
    this.showChangePasswordModal = false;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
