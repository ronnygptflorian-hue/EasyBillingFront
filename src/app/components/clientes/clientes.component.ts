import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from './service/customer.service';
import { LoadingComponent } from '../shared/loading.component/loading.component'
import { Customer } from './model/customer.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent implements OnInit {

  Math = Math;

  clientes: Customer[] = [];
  showModal = false;
  isEditing = false;
  loading = true;
  searchQuery = '';
  filterStatus: string = 'all';
  filterProvincia: string = 'all';

  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;
  pageSizeOptions = [5, 10, 20, 50];

  private searchTimeout: any;

  currentCliente: Customer = {
    nombreComercial: '',
    rnc: '',
    direccion: '',
    telefonos: '',
    eMail: '',
    bloqueado: false,
    celular: '',
    codigo: '',
    codigoPostal: '',
    fechaAdd: '',
    id: 0,
    idEmpresa: this.customerService.EMPRESA?.userCompanies[0].id || 0,
    idPais: 0,
    tipoId: '',
    razonSocial: '',
    ciudad: '',
    provincia: ''
  };
  tipoIdOptions = [
    { label: 'Cédula', value: 'C' },
    { label: 'RNC', value: 'R' },
    { label: 'Pasaporte', value: 'P' }
  ];
  provincias = [
    'Azua', 'Baoruco', 'Barahona', 'Dajabón', 'Distrito Nacional', 'Duarte',
    'Elías Piña', 'El Seibo', 'Espaillat', 'Hato Mayor', 'Hermanas Mirabal',
    'Independencia', 'La Altagracia', 'La Romana', 'La Vega', 'María Trinidad Sánchez',
    'Monseñor Nouel', 'Monte Cristi', 'Monte Plata', 'Pedernales', 'Peravia',
    'Puerto Plata', 'Samaná', 'San Cristóbal', 'San José de Ocoa', 'San Juan',
    'San Pedro de Macorís', 'Sánchez Ramírez', 'Santiago', 'Santiago Rodríguez',
    'Santo Domingo', 'Valverde'
  ];

  constructor(
    private customerService: CustomerService,
    private notificationService: NotificationService
  ) { }

  async ngOnInit() {
    await this.loadClientes();
  }

  loadClientes() {
    this.loading = true;

    const filters: any = {};

    if (this.searchQuery) {
      filters.searchQuery = this.searchQuery;
    }

    if (this.filterStatus !== 'all') {
      filters.bloqueado = this.filterStatus === 'blocked';
    }

    if (this.filterProvincia !== 'all') {
      filters.provincia = this.filterProvincia;
    }

    this.customerService.getClientes(this.currentPage, this.pageSize, filters).subscribe({
      next: (res) => {
        this.clientes = res.data;
        this.totalRecords = res.pagination?.totalCount || 0;
        this.totalPages = res.pagination?.totalPages || 1;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error(err.message || 'Error al cargar clientes');
      }
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadClientes();
  }

  changePageSize() {
    this.currentPage = 1;
    this.loadClientes();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(start + maxVisible - 1, this.totalPages);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadClientes();
    }, 500);
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadClientes();
  }

  clearFilters() {
    this.searchQuery = '';
    this.filterStatus = 'all';
    this.filterProvincia = 'all';
    this.currentPage = 1;
    this.loadClientes();
  }


  openModal(cliente?: Customer) {
    if (cliente) {
      this.isEditing = true;
      this.currentCliente = { ...cliente };
    } else {
      this.isEditing = false;
      this.currentCliente = {
        nombreComercial: '',
        rnc: '',
        direccion: '',
        telefonos: '',
        eMail: '',
        bloqueado: false,
        celular: '',
        codigo: '',
        codigoPostal: '',
        fechaAdd: new Date().toISOString(),
        id: 0,
        idEmpresa: this.customerService.EMPRESA?.userCompanies[0].id || 0,
        idPais: 1,
        tipoId: '',
        razonSocial: '',
        ciudad: '',
        provincia: ''
      };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  addClient() {
    const rnc = this.currentCliente.rnc;
    if (this.currentCliente.tipoId === 'C' && rnc.length !== 11) {
      this.notificationService.error("La cédula debe tener exactamente 11 dígitos");
      return;
    }

    if (this.currentCliente.tipoId === 'R' && rnc.length !== 9) {
      this.notificationService.error("El RNC debe tener exactamente 9 dígitos");
      return;
    }
    const request$ = this.isEditing
      ? this.customerService.update('client/update', this.currentCliente)
      : this.customerService.post('client/add', this.currentCliente);

    request$.subscribe({
      next: () => {
        this.showModal = false;
        this.loadClientes();

        const msg = this.isEditing
          ? 'Cliente actualizado exitosamente'
          : 'Cliente creado exitosamente';
        this.notificationService.success(msg);
      },
      error: (err) => {
        this.notificationService.error(
          err?.message || 'Ocurrió un error al guardar el cliente'
        );
      }
    });
  }

  validarLongitudDocumento() {
    let doc = this.currentCliente.rnc;

    if (this.currentCliente.tipoId === 'C') {
      doc = doc.replace(/\D/g, '').slice(0, 11);
    }

    if (this.currentCliente.tipoId === 'R') {
      doc = doc.replace(/\D/g, '').slice(0, 9);
    }
    this.currentCliente.rnc = doc;
  }

}

