import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacturasRecibidasService } from './service/facturas-recibidas.service';
import { ChangeStatusFactura, FacturaRecibida, FacturaRecibidaDetalle } from './model/factura-recibida.model';
import { Pagination } from '../../models/api-response.model';
import { LoadingComponent } from '../shared/loading.component/loading.component';
import { CustomDatepickerComponent } from '../shared/custom-datepicker/custom-datepicker.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-facturas-recibidas',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, CustomDatepickerComponent],
  templateUrl: './facturas-recibidas.component.html',
  styleUrl: './facturas-recibidas.component.scss',
})
export class FacturasRecibidasComponent implements OnInit {
  facturas: FacturaRecibida[] = [];
  filteredFacturas: FacturaRecibida[] = [];
  loading = true;
  loadingDetail = false;
  showAdvancedFilters = false;
  showDetailModal = false;
  showRechazarModal = false;
  selectedFactura: FacturaRecibidaDetalle | null = null;
  motivoRechazo = '';
  Math = Math;

  filtroRazonSocialEmisor = '';
  filtroRncEmisor = '';
  filtroEcf = '';
  filtroFechaDesde = '';
  filtroFechaHasta = '';
  filtroEstatusAprobacion = '';
  filtroTipoEcf = '';

  pagination: Pagination = {
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  };

  estatusAprobacionOptions = [
    { value: '', label: 'Todos' },
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Aprobado', label: 'Aprobado' },
    { value: 'Rechazado', label: 'Rechazado' }
  ];

  constructor(
    private facturasRecibidasService: FacturasRecibidasService,
    private notificationService: NotificationService
  ) { }

  async ngOnInit() {
    await this.loadFacturas();
  }

  async loadFacturas() {
    try {
      this.loading = true;
      const filters: any = {
        pageIndex: this.pagination.pageNumber,
        pageSize: this.pagination.pageSize
      };

      if (this.filtroRazonSocialEmisor) {
        filters.razonSocialEmisor = this.filtroRazonSocialEmisor;
      }
      if (this.filtroRncEmisor) {
        filters.rncEmisor = this.filtroRncEmisor;
      }
      if (this.filtroEcf) {
        filters.ecf = this.filtroEcf;
      }
      if (this.filtroFechaDesde) {
        filters.fechaDesde = this.convertYYYYMMDDtoDDMMYYYY(this.filtroFechaDesde);
      }
      if (this.filtroFechaHasta) {
        filters.fechaHasta = this.convertYYYYMMDDtoDDMMYYYY(this.filtroFechaHasta);
      }

      this.facturasRecibidasService.getFacturasRecibidas(filters).subscribe({
        next: (resp) => {
          this.facturas = resp.data;
          if (resp.pagination) {
            this.pagination = resp.pagination;
          }
          this.filteredFacturas = this.filterLocal([...this.facturas]);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Error:', error);
      this.loading = false;
    }
  }

  filterLocal(data: FacturaRecibida[]): FacturaRecibida[] {
    let filtered = [...data];

    if (this.filtroEstatusAprobacion) {
      filtered = filtered.filter(f =>
        f.estatusAprobacion === this.filtroEstatusAprobacion
      );
    }

    if (this.filtroTipoEcf) {
      filtered = filtered.filter(f =>
        f.idTipoEcf.toString() === this.filtroTipoEcf
      );
    }

    return filtered;
  }

  aplicarFiltros() {
    this.pagination.pageNumber = 1;
    this.loadFacturas();
  }

  limpiarFiltros() {
    this.filtroRazonSocialEmisor = '';
    this.filtroRncEmisor = '';
    this.filtroEcf = '';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.filtroEstatusAprobacion = '';
    this.filtroTipoEcf = '';
    this.pagination.pageNumber = 1;
    this.loadFacturas();
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  viewFactura(factura: FacturaRecibida) {
    this.loadingDetail = true;
    this.showDetailModal = true;
    this.facturasRecibidasService.getFacturaRecibidaById(factura.idDocumento).subscribe({
      next: (detalle) => {
        this.selectedFactura = detalle;
        this.loadingDetail = false;
      },
      error: (error) => {
        console.error('Error al cargar detalle:', error);
        this.notificationService.error('Error al cargar el detalle de la factura');
        this.loadingDetail = false;
        this.closeDetailModal();
      }
    });
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedFactura = null;
  }

  aprobarFactura() {
    if (!this.selectedFactura) return;
    const changeStatus: ChangeStatusFactura = {
      IdDocumento: this.selectedFactura.idDocumento,
      Aprobado: true,
      ComentarioRechazo: null
    };
    this.loadingDetail = true;
    this.facturasRecibidasService.changeStatusFactura(changeStatus).subscribe({
      next: () => {
        this.notificationService.success('Factura aprobada exitosamente');
        this.loadingDetail = false;
        this.closeDetailModal();
        this.loadFacturas();
      },
      error: (error) => {
        console.error('Error al aprobar factura:', error);
        this.notificationService.error('Error al aprobar la factura');
        this.loadingDetail = false;
      }
    });
  }

  openRechazarModal() {
    this.motivoRechazo = '';
    this.showRechazarModal = true;
  }

  closeRechazarModal() {
    this.showRechazarModal = false;
    this.motivoRechazo = '';
  }

  rechazarFactura() {
    if (!this.selectedFactura || !this.motivoRechazo.trim()) {
      this.notificationService.error('Debe indicar un motivo para rechazar la factura');
      return;
    }
    const changeStatus: ChangeStatusFactura = {
      IdDocumento: this.selectedFactura.idDocumento,
      Aprobado: true,
      ComentarioRechazo: null
    };
    this.loadingDetail = true;
    this.facturasRecibidasService.changeStatusFactura(changeStatus).subscribe({
      next: () => {
        this.notificationService.success('Factura rechazada exitosamente');
        this.loadingDetail = false;
        this.closeRechazarModal();
        this.closeDetailModal();
        this.loadFacturas();
      },
      error: (error) => {
        console.error('Error al rechazar factura:', error);
        this.notificationService.error('Error al rechazar la factura');
        this.loadingDetail = false;
      }
    });
  }

  descargarXml() {
    if (!this.selectedFactura || !this.selectedFactura.documentosXmldata || this.selectedFactura.documentosXmldata.length === 0) {
      this.notificationService.error('No hay XML disponible para descargar');
      return;
    }

    const xmlData = this.selectedFactura.documentosXmldata[0].fullXmldata;
    const blob = this.facturasRecibidasService.descargarXml(this.selectedFactura.ecf, xmlData);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.selectedFactura.ecf}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    this.notificationService.success('XML descargado exitosamente');
  }

  goToPage(page: number) {
    this.pagination.pageNumber = page;
    this.loadFacturas();
  }

  nextPage() {
    if (this.pagination.hasNextPage) {
      this.pagination.pageNumber++;
      this.loadFacturas();
    }
  }

  previousPage() {
    if (this.pagination.hasPreviousPage) {
      this.pagination.pageNumber--;
      this.loadFacturas();
    }
  }

  get pages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const currentPage = this.pagination.pageNumber;
    const totalPages = this.pagination.totalPages;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  convertYYYYMMDDtoDDMMYYYY(fecha: string): string {
    const [year, month, day] = fecha.split('-');
    return `${day}-${month}-${year}`;
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getEstatusClass(estatus: string): string {
    const classes: any = {
      'Pendiente': 'estado-pendiente',
      'Aprobado': 'estado-aprobado',
      'Rechazado': 'estado-rechazado'
    };
    return classes[estatus] || 'estado-pendiente';
  }

  getTipoEcfLabel(idTipoEcf: number): string {
    const tipos: any = {
      1: 'Factura Crédito Fiscal',
      3: 'Nota de Débito',
      4: 'Nota de Crédito',
      7: 'Gastos Menores'
    };
    return tipos[idTipoEcf] || `Tipo ${idTipoEcf}`;
  }

  formatCurrency(value: number): string {
    if (!value) return 'RD$ 0.00';
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(value);
  }
}
