import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MiCuentaService } from './service/mi-cuenta.service';
import { MiCuentaData } from './model/cuenta.model';
import { NotificationService } from '../../services/notification.service';
import { LoadingComponent } from '../shared/loading.component/loading.component';

@Component({
  selector: 'app-mi-cuenta',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  templateUrl: './mi-cuenta.component.html',
  styleUrls: ['./mi-cuenta.component.scss']
})
export class MiCuentaComponent implements OnInit {
  cuentaData: MiCuentaData | null = null;
  loading = false;

  constructor(
    private miCuentaService: MiCuentaService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cargarDatosCuenta();
  }

  cargarDatosCuenta() {
    this.loading = true;
    this.miCuentaService.obtenerDatosCuenta().subscribe({
      next: (data) => {
        this.cuentaData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos de la cuenta:', error);
        this.notificationService.error('Error al cargar la información de la cuenta');
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(monto);
  }

  getCertificadoStatus(): string {
    if (!this.cuentaData?.certificado) return 'badge-danger';

    const fechaExpira = new Date(this.cuentaData.certificado.fechaExpira);
    const hoy = new Date();
    const diasRestantes = Math.ceil((fechaExpira.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) return 'badge-danger';
    if (diasRestantes < 30) return 'badge-warning';
    return 'badge-success';
  }

  getCertificadoStatusText(): string {
    if (!this.cuentaData?.certificado) return 'Sin certificado';

    const fechaExpira = new Date(this.cuentaData.certificado.fechaExpira);
    const hoy = new Date();
    const diasRestantes = Math.ceil((fechaExpira.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) return 'Expirado';
    if (diasRestantes < 30) return `Expira en ${diasRestantes} días`;
    return 'Activo';
  }
}
