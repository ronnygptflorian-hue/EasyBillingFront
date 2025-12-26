import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { FacturaService } from "./service/facturas.service";
import {
  Factura,
  FacturaResponse,
  PaginationInfo,
} from "./model/factura-request.model";
import { LoadingComponent } from "../shared/loading.component/loading.component";
import { CustomerService } from "../clientes/service/customer.service";
import { Customer } from "../clientes/model/customer.model";
import { CustomDatepickerComponent } from "../shared/custom-datepicker/custom-datepicker.component";
import { NotificationService } from "../../services/notification.service";

@Component({
  selector: "app-facturas-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoadingComponent,
    CustomDatepickerComponent,
  ],
  templateUrl: "./facturas-list.component.html",
  styleUrls: ["./facturas-list.component.scss"],
})
export class FacturasListComponent implements OnInit {
  facturas: FacturaResponse[] = [];
  filteredFacturas: FacturaResponse[] = [];
  loading = true;
  searchTerm = "";
  filtroNcf = "";
  selectedEstado = "";
  filtroId = "";
  filtroIdCliente = "";
  filtroFechaDesde = "";
  filtroFechaHasta = "";
  showDetailModal = false;
  selectedFactura: Factura | null = null;
  showAdvancedFilters = false;
  Math = Math;
  notaCredito = 34;
  showClienteDropdown = false;
  clienteSuggestions: Customer[] = [];
  selectedCliente: Customer | null = null;
  pagination: PaginationInfo = {
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  constructor(
    private facturasService: FacturaService,
    private router: Router,
    private customerService: CustomerService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit() {
    await this.loadFacturas();
  }

  async loadFacturas() {
    try {
      this.loading = true;
      const params: any = {
        pageIndex: this.pagination.pageNumber,
        pageSize: this.pagination.pageSize,
      };

      if (this.filtroId) {
        params.Id = parseInt(this.filtroId);
      }
      if (this.filtroIdCliente) {
        params.IdCliente = parseInt(this.filtroIdCliente);
      }
      if (this.filtroFechaDesde) {
        params.FechaDesde = this.convertYYYYMMDDtoDDMMYYYY(
          this.filtroFechaDesde
        );
      }
      if (this.filtroFechaHasta) {
        params.FechaHasta = this.convertYYYYMMDDtoDDMMYYYY(
          this.filtroFechaHasta
        );
      }

      this.facturasService
        .getAllPagination("invoice/GetInvoice", params)
        .subscribe({
          next: (resp) => {
            this.facturas = resp.data;
            if (resp.pagination) {
              this.pagination = resp.pagination;
            }
            this.filteredFacturas = this.filterLocal([...this.facturas]);
            this.loading = false;
          },
          error: (error) => {
            console.error("Error:", error);
            this.loading = false;
          },
        });
    } catch (error) {
      console.error("Error:", error);
      this.loading = false;
    }
  }

  filterLocal(data: FacturaResponse[]): FacturaResponse[] {
    let filtered = [...data];

    if (this.filtroNcf) {
      const ncf = this.filtroNcf.toLowerCase();
      filtered = filtered.filter(
        (f) => f.ecf && f.ecf.toLowerCase().includes(ncf)
      );
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (f) => f.nombreCliente && f.nombreCliente.toLowerCase().includes(term)
      );
    }

    if (this.selectedEstado) {
      filtered = filtered.filter((f) => f.tipoVenta === this.selectedEstado);
    }

    return filtered;
  }

  aplicarFiltros() {
    this.pagination.pageNumber = 1;
    this.loadFacturas();
  }

  limpiarFiltros() {
    this.searchTerm = "";
    this.filtroNcf = "";
    this.selectedEstado = "";
    this.filtroId = "";
    this.filtroIdCliente = "";
    this.filtroFechaDesde = "";
    this.filtroFechaHasta = "";
    this.pagination.pageNumber = 1;
    this.loadFacturas();
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  onClienteSearch(event: any) {
    const searchValue = event.target.value;
    if (searchValue.length >= 2) {
      this.loadClienteSuggestions(searchValue);
    } else if (searchValue.length === 0) {
      this.selectedCliente = null;
      this.filtroIdCliente = "";
      this.loadClienteSuggestions("");
    } else {
      this.clienteSuggestions = [];
      this.showClienteDropdown = false;
    }
  }

  onClienteFocus() {
    if (this.searchTerm.length === 0) {
      this.loadClienteSuggestions("");
    } else if (this.searchTerm.length >= 2) {
      this.loadClienteSuggestions(this.searchTerm);
    }
  }

  onClienteBlur() {
    setTimeout(() => {
      this.showClienteDropdown = false;
    }, 200);
  }

  loadClienteSuggestions(search: string) {
    const filters = search ? { razonSocial: search } : {};
    this.customerService.getClientes(1, 3, filters).subscribe({
      next: (response) => {
        this.clienteSuggestions = response.data;
        this.showClienteDropdown = this.clienteSuggestions.length > 0;
      },
      error: (error) => {
        console.error("Error al cargar clientes:", error);
        this.clienteSuggestions = [];
      },
    });
  }

  selectCliente(cliente: Customer) {
    this.searchTerm = cliente.razonSocial;
    this.selectedCliente = cliente;
    this.filtroIdCliente = cliente.id.toString();
    this.showClienteDropdown = false;
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
        console.error("Error al cargar factura:", error);
        this.loading = false;
      },
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

  convertYYYYMMDDtoDDMMYYYY(fecha: string): string {
    const [year, month, day] = fecha.split("-");
    return `${day}-${month}-${year}`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString("es-DO");
  }

  getEstadoClass(tipoVenta: string): string {
    const classes: any = {
      CO: "estado-pendiente",
      CR: "estado-pagada",
    };
    return classes[tipoVenta] || "estado-pendiente";
  }

  getEstadoLabel(tipoVenta: string): string {
    const labels: any = {
      CO: "Contado",
      CR: "Crédito",
    };
    return labels[tipoVenta] || tipoVenta;
  }

  crearNotaCredito(factura: FacturaResponse) {
    this.router.navigate(["/facturas/crear"], {
      queryParams: {
        tipo: this.notaCredito,
        facturaOriginal: factura.id,
      },
    });
  }

  EditarFactura(factura: FacturaResponse) {
    this.router.navigate(["/facturas/crear"], {
      queryParams: {
        tipo: null,
        facturaOriginal: factura.id,
      },
    });
  }

  getQrCodeUrl(qrUrl: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
      qrUrl
    )}`;
  }

  onQrImageError(event: any) {
    event.target.style.display = "none";
  }
  printFactura(factura: FacturaResponse) {
    this.facturasService.printFactura(factura.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${factura.rnc}${factura.ecf || factura.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error("Error al imprimir factura:", error);
      },
    });
  }

  getSubtotal(factura: any): number {
    if (!factura.detalles) return 0;

    return factura.detalles.reduce((sum: number, d: any) => {
      const base = d.cantidad * d.precio;
      return sum + base;
    }, 0);
  }

  getTotalRetencion(factura: any): number {
    if (!factura.detalles) return 0;

    return factura.detalles.reduce((sum: number, d: any) => {
      return sum + (d.valorItbisRetencion || 0) + (d.valorIsrRetencion || 0);
    }, 0);
  }

  onDownloadPdf(factura: any) {
    this.loading = true;

    this.facturasService.printFactura(factura.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${factura.rnc}${factura.ecf || factura.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.loading = false;
      },
      error: (error) => {
        console.error("Error al imprimir factura:", error);
        this.loading = false;
      },
    });
  }

  onDownloadXml(factura: any) {
    const idFactura = factura.id;

    this.loading = true;

    this.facturasService.getXmlEasyBilling(idFactura).subscribe({
      next: (xmlString: string) => {
        // Generar un Blob con el contenido XML
        const blob = new Blob([xmlString], { type: "application/xml" });

        // Crear un enlace de descarga
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);

        // Nombre del archivo → factura.ecf.xml
        const fileName = `${factura.rnc}${factura.ecf || "Factura"}.xml`;
        link.download = fileName;

        // Descargar
        link.click();

        this.notificationService.success("XML descargado correctamente.");
        this.loading = false;
      },
      error: (err) => {
        console.error("Error descargando XML:", err);
        this.notificationService.error("Error descargando XML.");
        this.loading = false;
      },
    });
  }

  SignEcf(factura: any) {
    this.loading = true;

    this.facturasService.SignEcf(factura.id).subscribe({
      next: (res) => {
        this.notificationService.success("Factura enviada Correctamente.");
      },
      error: (err) => {
        this.notificationService.error("Error enviando factura a la dgii");
      },
      complete: () => {
        this.loading = false; // 🔥 Se apaga cuando termina de verdad
        this.showDetailModal = false;
        this.loadFacturas();
      },
    });
  }

  onDownloadJson(factura: any) {
    const data = JSON.stringify(factura, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Factura-${factura.ecf || factura.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  onPreviewFactura(factura: any) {
    // Abrir modal o página con layout de PDF
  }

  exportarExcel() {
    this.loading = true;

    this.facturasService.getExcel().subscribe({
      next: (res: any) => {
        // Convertir base64 → blob
        const excelBlob = this.base64ToBlob(res.file, res.contentType);

        // Descargar archivo
        const link = document.createElement("a");
        link.href = URL.createObjectURL(excelBlob);
        link.download = res.fileName;
        link.click();

        this.loading = false;
        this.notificationService.success(
          "Archivo Excel generado correctamente."
        );
      },
      error: () => {
        this.loading = false;
        this.notificationService.error("Error generando Excel.");
      },
    });
  }

  base64ToBlob(base64: string, contentType: string = ""): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length)
      .fill(0)
      .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);

    return new Blob([byteArray], { type: contentType });
  }
}
