import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigutionService } from '../../service/configuracion.service';
import { SecuenciaEcf } from '../../model/secuencia-ecf.model';
import { TipoEcf } from '../../../../models/common-data.model'
import { NotificationService } from '../../../../services/notification.service';
import { CustomDatepickerComponent } from '../../../shared/custom-datepicker/custom-datepicker.component';


@Component({
  selector: 'app-invoices-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDatepickerComponent],
  templateUrl: './invoices-tab.component.html',
  styleUrls: ['./invoices-tab.component.scss']
})
export class InvoicesTabComponent implements OnInit {
  loading = false;
  secuencias: SecuenciaEcf[] = [];
  showModal = false;
  isEditing = false;

  pageIndex = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;

  currentSecuencia: Partial<SecuenciaEcf> = {
    idTipoEcf: 1,
    descripcionTipoEcf: '',
    inicioSecuencia: 0,
    finSecuencia: 0,
    fechaExpiracion: '',
    bloqueado: false,
    idEmpresa: this.configutionService.EMPRESA?.userCompanies[0]?.id || 0
  };

  tiposEcf: TipoEcf[] = [];

  validarDisponibilidadNCF = true;
  alertaProximaAgotar = true;
  umbralAlerta = 100;

  Math = Math;

  constructor(
    private configutionService: ConfigutionService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.loadSecuencias();
    this.loadTiposEcf();
  }

  loadSecuencias() {
    try {
      this.loading = true;
      this.configutionService.getSecuencia({ pageIndex: this.pageIndex, pageSize: this.pageSize }).subscribe({
        next: (result) => {
          this.secuencias = result.data;
          this.totalRecords = result.pagination?.totalCount ?? 0;
          this.totalPages = result.pagination?.totalPages ?? 0;
          this.hasNextPage = result.pagination?.hasNextPage ?? false;
          this.hasPreviousPage = result.pagination?.hasPreviousPage ?? false;
          this.loading = false;

        }
      });

    } catch (error) {
      console.error('Error cargando secuencias:', error);
    } finally {
      this.loading = false;
    }
  }

  loadTiposEcf() {
    this.loading = true;
    this.configutionService.getTipoECF().subscribe({
      next: (resp) => {
        this.tiposEcf = resp.data.filter(t => t.descripcion !== "Todos...");
        this.loading = false;
      }
    })
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pageIndex = page;
    this.loadSecuencias();
  }

  nextPage() {
    if (this.hasNextPage) {
      this.pageIndex++;
      this.loadSecuencias();
    }
  }

  previousPage() {
    if (this.hasPreviousPage) {
      this.pageIndex--;
      this.loadSecuencias();
    }
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadSecuencias();
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.pageIndex - 2);
      const end = Math.min(this.totalPages, start + maxVisible - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  openModal() {
    this.isEditing = false;
    this.currentSecuencia = {
      idTipoEcf: 1,
      descripcionTipoEcf: '',
      inicioSecuencia:  null,
      finSecuencia:  null,
      fechaExpiracion: new Date().toLocaleDateString('es-DO'),
      bloqueado: false,
      idEmpresa: this.configutionService.EMPRESA?.userCompanies[0]?.id || 0
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  editSecuencia(secuencia: SecuenciaEcf) {
    this.isEditing = true;
    this.currentSecuencia = { ...secuencia };
    this.showModal = true;
  }

  saveSecuencia() {
    const request$ = this.isEditing
      ? this.configutionService.update('common/UpdateSecuenciaEcf', this.currentSecuencia)
      : this.configutionService.post('common/AddSecuenciaEcf', this.currentSecuencia);

    request$.subscribe({
      next: () => {
        this.showModal = false;
        this.loadSecuencias();

        const msg = this.isEditing
          ? 'Secuencia actualizada exitosamente'
          : 'Secuencia creada exitosamente';
        this.notificationService.success(msg);
      },
      error: (err) => {
        this.notificationService.error(
          err?.message || 'Ocurrió un error al guardar el cliente'
        );
      }
    });
  }

  async toggleBloqueo(secuencia: SecuenciaEcf) {
    try {
      // await this.secuenciasService.updateSecuencia(secuencia.id, {
      //   bloqueado: !secuencia.bloqueado
      // });
      await this.loadSecuencias();
    } catch (error) {
      console.error('Error actualizando secuencia:', error);
    }
  }

  getTipoCodigo(idTipo: number): string {
    return this.tiposEcf.find(t => t.id === idTipo)?.codigo || '';
  }

  formatSecuencia(sec: SecuenciaEcf): string {
    const codigo = this.getTipoCodigo(sec.idTipoEcf);
    const secuenciaActual = sec.inicioSecuencia;
    return `${codigo}${String(secuenciaActual).padStart(8, '0')}`;
  }

  getPorcentajeUsado(sec: SecuenciaEcf): number {
    if (!sec.finSecuencia || !sec.inicioSecuencia) return 0;
    const total = sec.finSecuencia - sec.inicioSecuencia + 1;
    const usados = sec.inicioSecuencia - sec.inicioSecuencia;
    return Math.round((usados / total) * 100);
  }

  getDisponibles(sec: SecuenciaEcf): number {
    if (!sec.finSecuencia || !sec.inicioSecuencia) return 0;
    return sec.finSecuencia - sec.inicioSecuencia + 1;
  }

  isExpired(sec: SecuenciaEcf): boolean {
    return new Date(sec.fechaExpiracion) < new Date();
  }

  isNearExpiry(sec: SecuenciaEcf): boolean {
    const diff = new Date(sec.fechaExpiracion).getTime() - new Date().getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 30;
  }

  isNearDepletion(sec: SecuenciaEcf): boolean {
    return this.getDisponibles(sec) <= this.umbralAlerta;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getEstado(sec: SecuenciaEcf): string {
    if (sec.bloqueado) return 'Bloqueada';
    if (this.isExpired(sec)) return 'Expirada';
    return 'Activa';
  }

  saveSettings() {
    console.log('Guardando configuración general...');
  }
}
