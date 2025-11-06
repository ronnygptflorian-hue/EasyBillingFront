import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DashboardStats, Factura } from '../../models/interfaces';
import {CommonService} from '../../services/common-data.service'
import {DashboardModel} from '../dashboard/model/dashboard.model'
import { LoadingComponent } from '../shared/loading.component/loading.component'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule,LoadingComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalFacturas: 0,
    facturasPendientes: 0,
    facturasPagadas: 0,
    facturasVencidas: 0,
    ingresosMes: 0,
    ingresosAnio: 0,
    clientesActivos: 0,
    productosRegistrados: 0
  };

  dashboardInformation: DashboardModel = {
    totalFacturas: 0,
    facturasPendientes: 0,
    facturasRecibidasTercero: [],
    clientesActivos: 0,
    ingresosMes: 0
  }

  ingresosMensuales: { mes: string; ingresos: number }[] = [];
  facturasRecientes: Factura[] = [];
  loading = true;
  user: any = null;

  constructor(
    private commonService: CommonService,
    private router: Router
  ) {}

  ngOnInit() {
    const mockUser = localStorage.getItem('mockUser');
    this.getDashboardData();
    if (mockUser) {
      this.user = JSON.parse(mockUser);
    }
  }

  async logout() {
    localStorage.removeItem('mockUser');
    this.router.navigate(['/login']);
  }

  getDashboardData(){
    this.loading = true;
    this.commonService.getDashboardInformation().subscribe({
      next: (res) => {
        this.dashboardInformation = res
        this.loading = false;
      }
    })

  }

  getEstadoBadgeClass(estado: string): string {
    const classes: { [key: string]: string } = {
      'pagada': 'badge-success',
      'pendiente': 'badge-warning',
      'vencida': 'badge-danger',
      'cancelada': 'badge-secondary'
    };
    return classes[estado] || 'badge-secondary';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  get maxIngreso(): number {
    return Math.max(...this.ingresosMensuales.map(m => m.ingresos), 1);
  }

  getBarHeight(ingresos: number): number {
    return (ingresos / this.maxIngreso) * 100;
  }
}
