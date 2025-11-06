import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../productos/service/products.service';
import { Product } from "../productos/model/products.model";
import { NotificationService } from '../../services/notification.service';
import { LoadingComponent } from '../shared/loading.component/loading.component'
import { TipoImpuesto, UnidadMedida } from "../../models/common-data.model";



@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit {
  Math = Math;
  productos: Product[] = [];
  showModal = false;
  isEditing = false;
  loading = true;

  searchQuery = '';

  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;
  pageSizeOptions = [5, 10, 20, 50];

  tiposImpuesto: TipoImpuesto[] = []
  unidadesMedida: UnidadMedida[] = []
  tiposProducto = [
    { id: 1, descripcion: 'Producto' },
    { id: 2, descripcion: 'Servicio' }
  ];

  currentProducto: Product = {
    id: 0,
    idEmpresa: 0,
    descripcion: '',
    codigo: '',
    precio: 0,
    idMedida: 0,
    idTipoImpuesto: 0,
    itbisIncluido: false,
    fechaAdd: '',
    bloqueado: false,
    aplicaDescuento: false,
    descripcionUnidad: '',
    descripcionTipoImpuesto: '',
    tipoProducto: 0
  };

  constructor(
    private productosService: ProductService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.loadProductos();
    this.getTipoImpuesto();
  }

  loadProductos() {
    this.loading = true;
    this.productosService.getProducts(this.currentPage, this.pageSize, this.searchQuery).subscribe({
      next: (res) => {
        this.productos = res.data;
        this.totalRecords = res.pagination?.totalCount || 0;
        this.totalPages = res.pagination?.totalPages || 1;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error(err.message || 'Error al cargar clientes');
      }
    })
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProductos();
  }

  changePageSize() {
    this.currentPage = 1;
    this.loadProductos();
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

  openModal(producto?: Product) {
    if (producto) {
      this.isEditing = true;
      this.currentProducto = { ...producto };
    } else {
      this.isEditing = false;
      this.currentProducto = {
        id: 0,
        idEmpresa: this.productosService.EMPRESA?.id || 0,
        descripcion: '',
        codigo: '',
        precio: 0,
        idMedida: 0,
        idTipoImpuesto: 0,
        itbisIncluido: false,
        fechaAdd: new Date().toISOString(),
        bloqueado: false,
        aplicaDescuento: false,
        descripcionUnidad: '',
        descripcionTipoImpuesto: '',
        tipoProducto: 0
      };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
  getTipoProductoLabel(tipo: number): string {
    return tipo === 2 ? 'Servicio' : 'Producto';
  }

  getTipoImpuesto() {
    this.productosService.getTiposImpuestosYUnidades().subscribe({
      next: (res) => {
        ({ tiposImpuestos: this.tiposImpuesto, unidadesMedida: this.unidadesMedida } = res.data);
      }
    })
  }

   saveProduct() {
    const request$ = this.isEditing
      ? this.productosService.update('Product/Update', this.currentProducto)
      : this.productosService.post('product/add', this.currentProducto);

    request$.subscribe({
      next: () => {
        this.showModal = false;
        this.loadProductos();

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
}
