import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TipoEcf, Moneda, TipoIngreso, CondicionPago, TipoImpuesto } from '../../models/common-data.model';
import { FacturaRequest, FacturaDetailRequest } from './model/factura-request.model';
import { Customer } from '../clientes/model/customer.model';
import { Product } from '../productos/model/products.model';
import { CustomerService } from '../clientes/service/customer.service';
import { ProductService } from '../productos/service/products.service';
import { CommonService } from '../../services/common-data.service';
import { FacturaService } from './service/facturas.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingComponent } from '../shared/loading.component/loading.component'
import { ConfigutionService } from '../configuraciones/service/configuracion.service';
import { SecuenciaEcf } from '../configuraciones/model/secuencia-ecf.model';


interface InvoiceItem extends Product {
  product: Product;
  quantity: number;
  price: number;
  discountStr: string;
  porcientoDescuento: number;
  porcientoRecargo: number;
  valorDescuento: number;
  valorRecargo: number;
  tipoRetencion: number;
  valorItbisRetencion: number;
  valorIsrRetencion: number;
  itbisPct: number;
  valorItbis: number;
  valorImpuesto: number;
  total: number;
  totalDetalle: number;
  showAdditionalTaxes: boolean;
  additionalTaxesSelected: Set<number>;
}

@Component({
  selector: 'app-crear-factura',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, LoadingComponent],
  templateUrl: './crear-factura.component.html',
  styleUrls: ['./crear-factura.component.scss']
})
export class CrearFacturaComponent implements OnInit {
  form!: FormGroup;

  tiposEcf: SecuenciaEcf[] = [];
  monedas: Moneda[] = [];
  tiposIngreso: TipoIngreso[] = [];
  condicionesPago: CondicionPago[] = [];
  tiposImpuesto: TipoImpuesto[] = [];
  impuestosAdicionales: TipoImpuesto[] = [];
  additionalTaxes: TipoImpuesto[] = [];

  aplicaDescuento = false;
  tieneRetencion = false;
  precioIncluyeImpuestos = true;

  clientResults: Customer[] = [];
  showClientDropdown = false;
  isSearchingClient = false;
  clientError = '';
  clientLocked = false;

  productResults: Product[] = [];
  showProductDropdown = false;
  isSearchingProduct = false;
  productError = '';
  fechaEmisionEcf: string = new Date().toLocaleDateString('en-CA');
  referencia: string = '';
  items: InvoiceItem[] = [];
  loading = false;
  referenciaCode: string = '';
  activeTaxDropdownIndex: number | null = null;

  isNotaCredito = false;
  facturaOriginalId: number | null = null;

  private clientSearchTimeout: any;
  private productSearchTimeout: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private customerService: CustomerService,
    private productService: ProductService,
    private commonService: CommonService,
    private facturasService: FacturaService,
    private notificationService: NotificationService,
    private configutionService: ConfigutionService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      idTipoEcf: [null, Validators.required],
      clientSearch: ['', Validators.required],
      selectedClient: [null],
      productSearch: [''],
      referencia: [this.referencia],
      comentario: [''],
      idMoneda: [1, Validators.required],
      tasaCambio: [1.0, Validators.required],
      fechaEmisionEcf: [new Date().toISOString().split('T')[0], Validators.required],
      idTipoIngreso: [1, Validators.required],
      idCondicionPago: [1, Validators.required]
    });

    this.route.queryParams.subscribe(params => {
      if (params['tipo'] === '34' && params['facturaOriginal']) {
        this.isNotaCredito = true;
        this.facturaOriginalId = +params['facturaOriginal'];
        this.loadFacturaOriginal(this.facturaOriginalId);
      }
    });

    this.loadCommonData();
    this.loadSecuencias();
    const random3 = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.referenciaCode = `FCT-${random3}`;
  }

  loadCommonData() {
    this.loading = true;
    this.commonService.getAllListDocument().subscribe({
      next: (resp) => {
        this.additionalTaxes = (resp.data.tiposImpuestos || []).filter(t => t.adicional === true);
        this.monedas = resp.data.moneda;
        this.condicionesPago = resp.data.condicionesPago;
        this.tiposIngreso = resp.data.tiposIngreso;
        this.tiposImpuesto = resp.data.tiposImpuestos;
        this.impuestosAdicionales = resp.data.tiposImpuestos || [];

        if (this.isNotaCredito) {
          const tipoNotaCredito = this.tiposEcf.find(t => t.id === 34 || (t.descripcionTipoEcf.toLowerCase().includes('nota') && t.descripcionTipoEcf.toLowerCase().includes('crédito')));
          if (tipoNotaCredito) {
            this.form.patchValue({ idTipoEcf: tipoNotaCredito.id });
          }
        }

        this.loading = false;
      },
      error: (err) => {
        this.additionalTaxes = [];
      },
      complete: () => this.loading = false
    });
  }
  loadSecuencias() {
    try {
      this.loading = true;
      this.configutionService.getSecuencia({ pageIndex: 1, pageSize: 100 }).subscribe({
        next: (result) => {
          this.tiposEcf = result.data;
          this.loading = false;

        }
      });

    } catch (error) {
      console.error('Error cargando secuencias:', error);
    } finally {
      this.loading = false;
    }
  }


  loadFacturaOriginal(id: number) {
    this.loading = true;
    this.facturasService.getById(id).subscribe({
      next: (resp) => {
        const factura = resp;

        if (factura.idCliente) {
          this.customerService.getClienteById(factura.idCliente).subscribe({
            next: (clientResp: any) => {
              this.selectClient(clientResp);
            },
            error: (err: any) => console.error('Error al cargar cliente', err)
          });
        }

        this.form.patchValue({
          referencia: `NC-${factura.ecf || factura.id}`,
          idMoneda: factura.idMoneda || 1,
          tasaCambio: factura.tasaCambio || 1.0,
          idTipoIngreso: factura.idTipoIngreso || 1,
          idCondicionPago: factura.idCondicionPago || 1,
          comentario: `Nota de crédito para factura ${factura.ecf || factura.id}`
        });

        if (factura.detalles && factura.detalles.length > 0) {
          this.items = factura.detalles.map((detalle: any) => {
            const tipoImpuesto = this.tiposImpuesto.find(t => t.id === detalle.idTipoImpuesto);
            const tasaImpuesto = tipoImpuesto ? tipoImpuesto.impuestoP : 18;

            const productData: Product = {
              id: detalle.idProducto,
              idEmpresa: detalle.idEmpresa,
              descripcion: detalle.descripcionProducto,
              codigo: detalle.codigoUnidad || '',
              precio: detalle.precio,
              idMedida: 0,
              idTipoImpuesto: detalle.idTipoImpuesto,
              itbisIncluido: false,
              fechaAdd: detalle.fechaAdd,
              bloqueado: detalle.bloqueado,
              aplicaDescuento: true,
              descripcionUnidad: detalle.descripcionMedida || '',
              descripcionTipoImpuesto: detalle.descripcionItbi || '',
              tipoProducto: 1
            };

            const item: InvoiceItem = {
              ...productData,
              product: productData,
              quantity: detalle.cantidad,
              price: detalle.precio,
              discountStr: detalle.porcientoDescuento?.toString() || '0',
              porcientoDescuento: detalle.porcientoDescuento || 0,
              porcientoRecargo: detalle.porcientoRecargo || 0,
              valorDescuento: detalle.valorDescuento || 0,
              valorRecargo: detalle.valorRecargo || 0,
              tipoRetencion: 1,
              valorItbisRetencion: 0,
              valorIsrRetencion: 0,
              itbisPct: tasaImpuesto,
              valorItbis: detalle.valorItbis || 0,
              valorImpuesto: detalle.valorImpuesto || 0,
              total: detalle.totalDetalle || 0,
              totalDetalle: detalle.totalDetalle || 0,
              showAdditionalTaxes: false,
              additionalTaxesSelected: new Set()
            };

            return item;
          });

          if (factura.porcientoDescuento && factura.porcientoDescuento > 0) {
            this.aplicaDescuento = true;
          }
        }

        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar factura original', err);
        this.notificationService.error('No se pudo cargar la factura original');
        this.loading = false;
      }
    });
  }

  get hasNoResults(): boolean {
    return !this.isSearchingClient && !this.clientError &&
      this.clientResults.length === 0 &&
      this.form.value.clientSearch?.length >= 2;
  }

  get hasNoProductResults(): boolean {
    return !this.isSearchingProduct && !this.productError &&
      this.productResults.length === 0 &&
      this.form.value.productSearch?.length >= 2;
  }

  get visibleColumnsCount(): number {
    let count = 6;
    if (this.aplicaDescuento) count += 2;
    if (this.tieneRetencion) count += 3;
    return count;
  }

  onClientInputFocus() {
    if (!this.clientLocked) {
      if (this.form.value.clientSearch?.length >= 2) {
        this.showClientDropdown = true;
      } else {
        this.loadInitialClients();
      }
    }
  }

  loadInitialClients() {
    this.isSearchingClient = true;
    this.clientError = '';
    this.showClientDropdown = true;

    this.customerService.getClientes(1, 2, {}).subscribe({
      next: (resp) => {
        this.clientResults = resp.data;
        this.isSearchingClient = false;
      },
      error: (error) => {
        this.clientError = 'Error al cargar clientes';
        this.isSearchingClient = false;
      }
    });
  }

  onClientTyping() {
    clearTimeout(this.clientSearchTimeout);
    const query = this.form.value.clientSearch;

    if (query.length < 2) {
      this.clientResults = [];
      this.showClientDropdown = false;
      return;
    }

    this.isSearchingClient = true;
    this.clientError = '';
    this.showClientDropdown = true;

    this.clientSearchTimeout = setTimeout(() => {
      try {
        const filters = { razonSocial: query };
        this.customerService.getClientes(1, 10, filters).subscribe({
          next: (resp) => {
            this.clientResults = resp.data;
            this.isSearchingClient = false;
          },
          error: (error) => {
            this.clientError = 'Error al buscar clientes';
            this.isSearchingClient = false;
          }
        });
      } catch (error) {
        this.clientError = 'Error al buscar clientes';
        this.isSearchingClient = false;
      }
    }, 300);
  }

  selectClient(client: Customer) {
    this.form.patchValue({
      selectedClient: client,
      clientSearch: client.razonSocial
    });
    this.clientLocked = true;
    this.showClientDropdown = false;
    this.clientResults = [];
  }

  changeClient() {
    this.clientLocked = false;
    this.form.patchValue({
      selectedClient: null,
      clientSearch: ''
    });
  }

  onProductInputFocus() {
    if (this.form.value.productSearch?.length >= 2) {
      this.showProductDropdown = true;
    } else {
      this.loadInitialProducts();
    }
  }

  loadInitialProducts() {
    this.isSearchingProduct = true;
    this.productError = '';
    this.showProductDropdown = true;

    this.productService.getProducts(1, 2, {}).subscribe({
      next: (resp) => {
        this.productResults = resp.data;
        this.isSearchingProduct = false;
      },
      error: (error) => {
        this.productError = 'Error al cargar productos';
        this.isSearchingProduct = false;
      }
    });
  }

  onProductTyping() {
    clearTimeout(this.productSearchTimeout);
    const query = this.form.value.productSearch;

    if (query.length < 2) {
      this.productResults = [];
      this.showProductDropdown = false;
      return;
    }

    this.isSearchingProduct = true;
    this.productError = '';
    this.showProductDropdown = true;

    this.productSearchTimeout = setTimeout(() => {
      try {
        const filters = { descripcion: query };
        this.productService.getProducts(1, 10, filters).subscribe({
          next: (resp) => {
            this.productResults = resp.data;
            this.isSearchingProduct = false;
          },
          error: (error) => {
            this.productError = 'Error al buscar productos';
            this.isSearchingProduct = false;
          }
        });
      } catch (error) {
        this.productError = 'Error al buscar productos';
        this.isSearchingProduct = false;
      }
    }, 300);
  }

  selectProduct(product: Product) {
    const tipoImpuesto = this.tiposImpuesto.find(t => t.id === product.idTipoImpuesto);
    const tasaImpuesto = tipoImpuesto ? tipoImpuesto.impuestoP : 18;

    const newItem: InvoiceItem = {
      ...product,
      product: product,
      quantity: 1,
      price: product.precio,
      discountStr: '0',
      porcientoDescuento: 0,
      porcientoRecargo: 0,
      valorDescuento: 0,
      valorRecargo: 0,
      tipoRetencion: 1,
      valorItbisRetencion: 0,
      valorIsrRetencion: 0,
      itbisPct: tasaImpuesto,
      valorItbis: 0,
      valorImpuesto: 0,
      total: 0,
      totalDetalle: 0,
      showAdditionalTaxes: false,
      additionalTaxesSelected: new Set()
    };

    this.items.push(newItem);
    this.form.patchValue({ productSearch: '' });
    this.showProductDropdown = false;
    this.productResults = [];
    this.calculateItem(this.items.length - 1);
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  onDiscountModelChange(index: number) {
    const str = this.items[index].discountStr;
    const val = parseFloat(str) || 0;
    this.items[index].porcientoDescuento = Math.min(100, Math.max(0, val));
    this.calculateItem(index);
  }

  calculateItem(index: number) {
    const item = this.items[index];
    let baseAmount = item.quantity * item.precio;

    if (this.precioIncluyeImpuestos && item.itbisIncluido) {
      const tipoImpuesto = this.tiposImpuesto.find(t => t.id === item.idTipoImpuesto);
      const tasaImpuesto = tipoImpuesto ? tipoImpuesto.impuestoP : 18;
      baseAmount = baseAmount / (1 + tasaImpuesto / 100);
    }

    if (this.aplicaDescuento) {
      item.valorDescuento = baseAmount * (item.porcientoDescuento / 100);
      item.valorRecargo = baseAmount * (item.porcientoRecargo / 100);
    } else {
      item.valorDescuento = 0;
      item.valorRecargo = 0;
    }

    const baseConAjustes = baseAmount - item.valorDescuento + item.valorRecargo;

    const tipoImpuesto = this.tiposImpuesto.find(t => t.id === item.idTipoImpuesto);
    const tasaImpuesto = tipoImpuesto ? tipoImpuesto.impuestoP : 18;
    item.valorItbis = baseConAjustes * (tasaImpuesto / 100);

    item.valorImpuesto = 0;
    if (item.additionalTaxesSelected.size > 0) {
      item.additionalTaxesSelected.forEach(taxId => {
        const impuesto = this.impuestosAdicionales.find(i => i.id === taxId);
        if (impuesto) {
          item.valorImpuesto += baseConAjustes * (impuesto.impuestoP / 100);
        }
      });
    }

    let total = baseConAjustes + item.valorItbis + item.valorImpuesto;

    if (this.tieneRetencion) {
      total -= (item.valorItbisRetencion + item.valorIsrRetencion);
    }

    item.totalDetalle = total;
    item.total = total;
  }

  onToggleDescuento(event: any) {
    this.aplicaDescuento = event.target.checked;
    this.items.forEach((_, i) => this.calculateItem(i));
  }

  onToggleRetencion(event: any) {
    this.tieneRetencion = event.target.checked;
    this.items.forEach((_, i) => this.calculateItem(i));
  }

  toggleTaxDropdown(index: number, event: Event) {
    event.stopPropagation();
    if (this.activeTaxDropdownIndex === index) {
      this.activeTaxDropdownIndex = null;
    } else {
      this.activeTaxDropdownIndex = index;
    }
  }

  closeTaxDropdown() {
    this.activeTaxDropdownIndex = null;
  }

  onToggleTax(itemIndex: number, taxId: number, checked: boolean) {
    const item = this.items[itemIndex];
    if (checked) {
      item.additionalTaxesSelected.add(taxId);
    } else {
      item.additionalTaxesSelected.delete(taxId);
    }
    this.calculateItem(itemIndex);
  }

  focusProductSearch() {
    const input = document.getElementById('productSearch') as HTMLInputElement;
    if (input) input.focus();
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => {
      let base = item.quantity * item.precio;
      if (this.precioIncluyeImpuestos && item.itbisIncluido) {
        const tipoImpuesto = this.tiposImpuesto.find(t => t.id === item.idTipoImpuesto);
        const tasaImpuesto = tipoImpuesto ? tipoImpuesto.impuestoP : 18;
        base = base / (1 + tasaImpuesto / 100);
      }
      const disc = this.aplicaDescuento ? item.valorDescuento : 0;
      const rec = this.aplicaDescuento ? item.valorRecargo : 0;
      return sum + (base - disc + rec);
    }, 0);
  }

  get totalDescuentos(): number {
    if (!this.aplicaDescuento) return 0;
    return this.items.reduce((sum, item) => sum + item.valorDescuento, 0);
  }

  get totalItbis(): number {
    return this.items.reduce((sum, item) => sum + item.valorItbis, 0);
  }

  get totalImpuestos(): number {
    return this.totalItbis + this.items.reduce((sum, item) => sum + item.valorImpuesto, 0);
  }

  get montoTotal(): number {
    let total = this.subtotal + this.totalImpuestos;
    if (this.tieneRetencion) {
      const retenciones = this.items.reduce((sum, item) => {
        return sum + item.valorItbisRetencion + item.valorIsrRetencion;
      }, 0);
      total -= retenciones;
    }
    return total;
  }

  buildFacturaRequest(): FacturaRequest | null {
    const formValue = this.form.value;
    const selectedClient = formValue.selectedClient as Customer;

    if (!selectedClient || !formValue.idTipoEcf || this.items.length === 0) {
      return null;
    }

    const detail: FacturaDetailRequest[] = this.items.map(item => ({
      idProducto: item.id,
      cantidad: item.quantity,
      precio: item.precio,
      idTipoImpuesto: item.idTipoImpuesto,
      porcientoDescuento: item.porcientoDescuento,
      porcientoRecargo: item.porcientoRecargo,
      valorItbis: item.valorItbis,
      valorImpuesto: item.valorImpuesto,
      valorDescuento: item.valorDescuento,
      valorRecargo: item.valorRecargo,
      ...(this.tieneRetencion && {
        TipoRetencion: item.tipoRetencion,
        ValorItbisRetencion: item.valorItbisRetencion,
        ValorIsrRetencion: item.valorIsrRetencion
      }),
      totalDetalle: item.totalDetalle,
      ...(item.additionalTaxesSelected.size > 0 && {
        impuestosAdicionales: Array.from(item.additionalTaxesSelected).map(taxId => {
          const impuesto = this.impuestosAdicionales.find(i => i.id === taxId);
          const baseAmount = item.quantity * item.precio - item.valorDescuento + item.valorRecargo;
          return {
            idImpuestoAdicional: taxId,
            porcientoImpuesto: impuesto?.impuestoP || 0,
            valorImpuesto: baseAmount * ((impuesto?.impuestoP || 0) / 100)
          };
        })
      })
    }));

    const request: FacturaRequest = {
      idEmpresa: this.facturasService.EMPRESA?.userCompanies[0].id || 0,
      idCliente: selectedClient.id,
      comentario: formValue.comentario || '',
      tipoVenta: 'CO',
      referencia: formValue.referencia || '',
      idTipoEcf: formValue.idTipoEcf,
      idMoneda: formValue.idMoneda,
      tasaCambio: formValue.tasaCambio,
      fechaEmisionEcf: formValue.fechaEmisionEcf,
      idTipoIngreso: formValue.idTipoIngreso,
      idCondicionPago: formValue.idCondicionPago,
      tieneRetencion: this.tieneRetencion,
      montoTotal: this.montoTotal,
      totalImpuestos: this.totalImpuestos,
      estadoFactura: 'Borrador',
      AplicaDescuento: this.aplicaDescuento,
      PrecioIncluyeImpuestos: this.precioIncluyeImpuestos,
      detail
    };
    return request;
  }

  async guardarFactura() {
    this.loading = true;
    if (this.form.invalid || this.items.length === 0) {
      return;
    }

    const facturaRequest = this.buildFacturaRequest();
    if (!facturaRequest) {
      return;
    }

    this.facturasService.post('Invoice/Add', facturaRequest).subscribe({
      next: (resp) => {
        console.log(resp);
        this.loading = false;
        const mensaje = this.isNotaCredito ? 'Nota de crédito creada exitosamente' : 'Factura creada exitosamente';
        this.notificationService.success(mensaje);
        this.router.navigate(['/facturas']);
      },
      error: (error) => {
        console.error(error);
        const mensaje = this.isNotaCredito ? 'Error al crear la nota de crédito' : 'Error al crear la factura';
        this.notificationService.error(mensaje);
        this.loading = false;
      }
    });
  }

  formatCurrency(amount: number): string {
    return 'RD$ ' + amount.toFixed(2);
  }
}
