import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { ToastNotificationsComponent } from '../shared/toast-notifications.component/toast-notifications.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet,ToastNotificationsComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  user: any = null;

  constructor(private router: Router) {}

  ngOnInit() {
    const mockUser = localStorage.getItem('mockUser');
    if (mockUser) {
      this.user = JSON.parse(mockUser);
    }
  }

  logout() {
    localStorage.removeItem('mockUser');
    this.router.navigate(['/login']);
  }
}
