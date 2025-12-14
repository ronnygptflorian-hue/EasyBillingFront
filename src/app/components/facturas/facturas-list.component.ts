import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FacturaService } from './service/facturas.service';
import { Factura, FacturaResponse, PaginationInfo } from './model/factura-request.model';
import { LoadingComponent } from '../shared/loading.component/loading.component'


@Component({
  selector: 'app-facturas-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,LoadingComponent],
  templateUrl: './facturas-list.component.html',
  styleUrls: ['./facturas-list.component.scss']
})
export class FacturasListComponent implements OnInit {
  facturas: FacturaResponse[] = [];
  filteredFacturas: FacturaResponse[] = [];
  loading = true;
  searchTerm = '';
  selectedEstado = '';
  filtroId = '';
  filtroIdCliente = '';
  filtroFechaDesde = '';
  filtroFechaHasta = '';
  showDetailModal = false;
  selectedFactura: Factura | null = null;
  Math = Math;
  notaCredito = 34;
  pagination: PaginationInfo = {
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  };

  constructor(
    private facturasService: FacturaService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadFacturas();
  }

  async loadFacturas() {
    try {
      this.loading = true;
      this.facturasService.getAllPagination('invoice/GetInvoice', {
        pageIndex: this.pagination.pageNumber,
        pageSize: this.pagination.pageSize
      }).subscribe({
        next: (resp) => {
          this.facturas = resp.data;
          if (resp.pagination) {
            this.pagination = resp.pagination;
          }
          this.filteredFacturas = [...this.facturas];
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

  filterFacturas() {
    let filtered = [...this.facturas];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        (f.ecf && f.ecf.toLowerCase().includes(term)) ||
        (f.nombreCliente && f.nombreCliente.toLowerCase().includes(term))
      );
    }

    if (this.selectedEstado) {
      filtered = filtered.filter(f => f.tipoVenta === this.selectedEstado);
    }

    if (this.filtroId) {
      const id = parseInt(this.filtroId);
      if (!isNaN(id)) {
        filtered = filtered.filter(f => f.id === id);
      }
    }

    if (this.filtroIdCliente) {
      const idCliente = parseInt(this.filtroIdCliente);
      if (!isNaN(idCliente)) {
        filtered = filtered.filter(f => f.idCliente === idCliente);
      }
    }

    if (this.filtroFechaDesde) {
      const fechaDesde = new Date(this.filtroFechaDesde);
      filtered = filtered.filter(f => {
        const fechaFactura = new Date(f.fechaAdd);
        return fechaFactura >= fechaDesde;
      });
    }

    if (this.filtroFechaHasta) {
      const fechaHasta = new Date(this.filtroFechaHasta);
      fechaHasta.setHours(23, 59, 59, 999);
      filtered = filtered.filter(f => {
        const fechaFactura = new Date(f.fechaAdd);
        return fechaFactura <= fechaHasta;
      });
    }

    this.filteredFacturas = filtered;
  }

  limpiarFiltros() {
    this.searchTerm = '';
    this.selectedEstado = '';
    this.filtroId = '';
    this.filtroIdCliente = '';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.filteredFacturas = [...this.facturas];
  }

  viewFactura(factura: FacturaResponse) {
    this.loading = true;
    this.facturasService.getById(factura.id).subscribe({
      next: (resp) => {
        this.selectedFactura = resp;
        this.showDetailModal = true;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar factura:', error);
        this.loading = false;
      }
    });
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedFactura = null;
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
    for (let i = 1; i <= this.pagination.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-DO');
  }

  getEstadoClass(tipoVenta: string): string {
    const classes: any = {
      'CO': 'estado-pendiente',
      'CR': 'estado-pagada',
    };
    return classes[tipoVenta] || 'estado-pendiente';
  }

  getEstadoLabel(tipoVenta: string): string {
    const labels: any = {
      'CO': 'Contado',
      'CR': 'Crédito',
    };
    return labels[tipoVenta] || tipoVenta;
  }

  crearNotaCredito(factura: FacturaResponse) {
    this.router.navigate(['/facturas/crear'], {
      queryParams: {
        tipo: this.notaCredito,
        facturaOriginal: factura.id
      }
    });
  }

  getQrCodeUrl(qrUrl: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}`;
  }

  onQrImageError(event: any) {
    event.target.style.display = 'none';
  }
  printFactura(factura: FacturaResponse) {
    this.facturasService.printFactura(factura.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${factura.rnc}${factura.ecf || factura.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al imprimir factura:', error);
      }
    });
  }
}
