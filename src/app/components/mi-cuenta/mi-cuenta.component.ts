import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalChangePasswordComponent } from '../auth/modal-change-password.component';

@Component({
  selector: 'app-mi-cuenta',
  standalone: true,
  imports: [CommonModule, ModalChangePasswordComponent],
  templateUrl: './mi-cuenta.component.html',
  styleUrls: ['./mi-cuenta.component.scss']
})
export class MiCuentaComponent implements OnInit {
  userData: any;
  showChangePasswordModal = false;

  constructor() {}

  ngOnInit() {
    const userStr = localStorage.getItem('User');
    if (userStr) {
      this.userData = JSON.parse(userStr);
    }
  }

  openChangePasswordModal() {
    this.showChangePasswordModal = true;
  }

  closeChangePasswordModal() {
    this.showChangePasswordModal = false;
  }
}
