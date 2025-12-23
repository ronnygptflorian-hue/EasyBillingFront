import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterModule, ActivatedRoute } from "@angular/router";
import {
  TipoEcf,
  Moneda,
  TipoIngreso,
  CondicionPago,
  TipoImpuesto,
} from "../../models/common-data.model";
import {
  FacturaRequest,
  FacturaDetailRequest,
} from "./model/factura-request.model";
import { Customer } from "../clientes/model/customer.model";
import { Product } from "../productos/model/products.model";
import { CustomerService } from "../clientes/service/customer.service";
import { ProductService } from "../productos/service/products.service";
import { CommonService } from "../../services/common-data.service";
import { FacturaService } from "./service/facturas.service";
import { NotificationService } from "../../services/notification.service";
import { LoadingComponent } from "../shared/loading.component/loading.component";
import { ConfigutionService } from "../configuraciones/service/configuracion.service";
import { SecuenciaEcf } from "../configuraciones/model/secuencia-ecf.model";
import { CustomDatepickerComponent } from "../shared/custom-datepicker/custom-datepicker.component";

interface InvoiceItem extends Product {
  discountError?: string;
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
  selector: "app-crear-factura",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    LoadingComponent,
    CustomDatepickerComponent,
  ],
  templateUrl: "./crear-factura.component.html",
  styleUrls: ["./crear-factura.component.scss"],
})
export class CrearFacturaComponent implements OnInit {
  form!: FormGroup;
  tiposImpuestoPrincipales: TipoImpuesto[] = [];
  tiposEcf: SecuenciaEcf[] = [];
  monedas: Moneda[] = [];
  tiposIngreso: TipoIngreso[] = [];
  condicionesPago: CondicionPago[] = [];
  tiposImpuesto: TipoImpuesto[] = [];
  impuestosAdicionales: TipoImpuesto[] = [];
  additionalTaxes: TipoImpuesto[] = [];
  discountError?: string;

  aplicaDescuento = false;
  tieneRetencion = false;
  permiteRetencion = false;
  precioIncluyeImpuestos = false;
  mostrarTasaCambio = false;
  cargandoTasaCambio = false;
  mostrarCliente = true;
  mostrarTipoIngreso = true;
  clienteObligatorio = true;

  clientResults: Customer[] = [];
  showClientDropdown = false;
  isSearchingClient = false;
  clientError = "";
  clientLocked = false;

  productResults: Product[] = [];
  showProductDropdown = false;
  isSearchingProduct = false;
  productError = "";
  fechaEmisionEcf: Date = new Date();
  referencia: string = "";
  items: InvoiceItem[] = [];
  loading = false;
  referenciaCode: string = "";
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
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      idTipoEcf: [null, Validators.required],
      clientSearch: ["", Validators.required],
      selectedClient: [null],
      productSearch: [""],
      referencia: [this.referencia],
      comentario: [""],
      idMoneda: [1, Validators.required],
      tasaCambio: [1.0, Validators.required],
      fechaEmisionEcf: [this.fechaEmisionEcf, Validators.required],
      idTipoIngreso: [1, Validators.required],
      idCondicionPago: [1, Validators.required],
    });

    this.form.get("idTipoEcf")!.valueChanges.subscribe(() => {
      this.aplicarReglasPorTipoEcf();
    });

    this.form.get("idMoneda")!.valueChanges.subscribe((idMoneda) => {
      this.onMonedaChange(idMoneda);
    });

    this.route.queryParams.subscribe((params) => {
      if (params["tipo"] === "34" && params["facturaOriginal"]) {
        this.isNotaCredito = true;
        this.facturaOriginalId = +params["facturaOriginal"];
        this.loadFacturaOriginal(this.facturaOriginalId);
      }
    });

    this.loadCommonData();
    this.loadSecuencias();
    const random3 = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.referenciaCode = `FCT-${random3}`;
  }

  onMonedaChange(idMoneda: number | null) {
    if (!idMoneda) return;

    const moneda = this.monedas.find((m) => m.id === idMoneda);
    if (!moneda) return;

    const codigoMoneda = moneda.codigoIso || moneda.descripcion;

    if (codigoMoneda === "DOP" || codigoMoneda === "Peso Dominicano") {
      this.mostrarTasaCambio = false;
      this.form.patchValue({ tasaCambio: 1.0 });
    } else {
      this.mostrarTasaCambio = true;
      this.obtenerTasaCambio(codigoMoneda);
    }
  }

  obtenerTasaCambio(codigoMoneda: string) {
    this.cargandoTasaCambio = true;
    const url = `https://api.exchangerate-api.com/v4/latest/${codigoMoneda}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const tasaDOP = data.rates?.DOP;
        if (tasaDOP) {
          this.form.patchValue({ tasaCambio: tasaDOP });
        } else {
          this.notificationService.error(
            "No se pudo obtener la tasa de cambio"
          );
        }
        this.cargandoTasaCambio = false;
      })
      .catch((error) => {
        console.error("Error al obtener tasa de cambio:", error);
        this.notificationService.error("Error al obtener la tasa de cambio");
        this.cargandoTasaCambio = false;
      });
  }

  aplicarReglasPorTipoEcf() {
    const tipo = this.form.value.idTipoEcf;
    const sec = this.tiposEcf.find((x) => x.idTipoEcf === tipo);

    if (!sec) {
      console.log('No se encontró secuencia para tipo:', tipo);
      return;
    }

    const codigo = String(sec.codigoTipoEcf).trim();
    console.log('Aplicando reglas para tipo de comprobante:', codigo, 'ID:', tipo, 'Secuencia:', sec);

    this.form.get("clientSearch")?.clearValidators();
    this.form.get("idTipoIngreso")?.clearValidators();
    this.tieneRetencion = false;
    this.permiteRetencion = false;
    this.clientLocked = false;
    this.mostrarCliente = true;
    this.mostrarTipoIngreso = true;
    this.clienteObligatorio = true;

    switch (codigo) {
      case "31":
        console.log('→ Tipo 31: Factura de Crédito Fiscal');
        this.form.get("clientSearch")?.setValidators([Validators.required]);
        this.form.get("idTipoIngreso")?.setValidators([Validators.required]);
        this.clienteObligatorio = true;
        this.mostrarCliente = true;
        this.mostrarTipoIngreso = true;
        break;

      case "32":
        console.log('→ Tipo 32: Factura de Consumo');
        this.form.get("idTipoIngreso")?.setValidators([Validators.required]);
        this.clienteObligatorio = false;
        this.mostrarCliente = true;
        this.mostrarTipoIngreso = true;
        break;

      case "33":
      case "34":
        console.log('→ Tipo 33/34: Nota de Crédito/Débito');
        this.form.get("clientSearch")?.setValidators([Validators.required]);
        this.form.get("idTipoIngreso")?.setValidators([Validators.required]);
        this.clienteObligatorio = true;
        this.mostrarCliente = true;
        this.mostrarTipoIngreso = true;
        break;

      case "41":
        console.log('→ Tipo 41: Gastos Menores');
        this.form.get("clientSearch")?.setValidators([Validators.required]);
        this.permiteRetencion = true;
        this.tieneRetencion = true;
        this.form.get("idTipoIngreso")?.clearValidators();
        this.form.patchValue({ idTipoIngreso: null });
        this.clienteObligatorio = true;
        this.mostrarCliente = true;
        this.mostrarTipoIngreso = false;
        break;

      case "43":
        console.log('→ Tipo 43: Regímenes Especiales');
        this.form.get("clientSearch")?.clearValidators();
        this.form.patchValue({ selectedClient: null, clientSearch: "" });
        this.clientLocked = true;
        this.tieneRetencion = false;
        this.form.get("idTipoIngreso")?.clearValidators();
        this.form.patchValue({ idTipoIngreso: null });
        this.mostrarCliente = false;
        this.mostrarTipoIngreso = false;

        this.items.forEach((it, idx) => {
          it.idTipoImpuesto = 4;
          it.itbisPct = 0;
          this.calculateItem(idx);
        });
        break;

      case "44":
        console.log('→ Tipo 44: Gubernamental');
        this.tieneRetencion = false;
        this.mostrarCliente = true;
        this.mostrarTipoIngreso = true;
        this.items.forEach((it, idx) => {
          it.idTipoImpuesto = 4;
          it.itbisPct = 0;
          this.calculateItem(idx);
        });
        break;

      case "45":
        console.log('→ Tipo 45: Gubernamental Proveedores');
        this.tieneRetencion = false;
        this.mostrarCliente = true;
        this.mostrarTipoIngreso = true;
        break;

      case "46":
        console.log('→ Tipo 46: Exportaciones');
        this.form.get("clientSearch")?.setValidators([Validators.required]);
        this.tieneRetencion = false;
        this.clienteObligatorio = true;
        this.mostrarCliente = true;
        this.mostrarTipoIngreso = true;

        this.items.forEach((it, idx) => {
          const tipoImpuesto = this.tiposImpuesto.find((t) => t.impuestoP === 0);
          if (tipoImpuesto) {
            it.idTipoImpuesto = tipoImpuesto.id;
            it.itbisPct = 0;
          }
          this.calculateItem(idx);
        });
        break;

      case "47":
        console.log('→ Tipo 47: Pagos al Exterior');
        this.permiteRetencion = true;
        this.tieneRetencion = true;
        this.clienteObligatorio = false;
        this.mostrarCliente = true;
        this.mostrarTipoIngreso = true;
        this.items.forEach((it, idx) => {
          it.idTipoImpuesto = 4;
          it.itbisPct = 0;
          this.calculateItem(idx);
        });
        break;

      default:
        console.log('→ Tipo no reconocido:', codigo);
        break;
    }

    this.form.get("clientSearch")?.updateValueAndValidity();
    this.form.get("idTipoIngreso")?.updateValueAndValidity();

    console.log('Estado después de aplicar reglas:', {
      permiteRetencion: this.permiteRetencion,
      tieneRetencion: this.tieneRetencion,
      mostrarCliente: this.mostrarCliente,
      mostrarTipoIngreso: this.mostrarTipoIngreso,
      clienteObligatorio: this.clienteObligatorio,
      clientLocked: this.clientLocked
    });
  }

  loadCommonData() {
    this.loading = true;
    this.commonService.getAllListDocument().subscribe({
      next: (resp) => {
        this.additionalTaxes = (resp.data.tiposImpuestos || []).filter(
          (t) => t.adicional === true
        );
        this.monedas = resp.data.moneda;
        this.condicionesPago = resp.data.condicionesPago;
        this.tiposIngreso = resp.data.tiposIngreso;
        this.tiposImpuesto = resp.data.tiposImpuestos;
        this.tiposImpuestoPrincipales = this.tiposImpuesto.filter(
          (t) => !t.adicional
        );

        this.impuestosAdicionales = resp.data.tiposImpuestos || [];

        if (this.isNotaCredito) {
          const tipoNotaCredito = this.tiposEcf.find(
            (t) =>
              t.id === 34 ||
              (t.descripcionTipoEcf.toLowerCase().includes("nota") &&
                t.descripcionTipoEcf.toLowerCase().includes("crédito"))
          );
          if (tipoNotaCredito) {
            this.form.patchValue({ idTipoEcf: tipoNotaCredito.id });
          }
        }

        this.loading = false;
      },
      error: (err) => {
        this.additionalTaxes = [];
      },
      complete: () => (this.loading = false),
    });
  }
  loadSecuencias() {
    try {
      this.loading = true;
      this.configutionService
        .getSecuencia({ pageIndex: 1, pageSize: 100 })
        .subscribe({
          next: (result) => {
            this.tiposEcf = result.data;
            if (this.isNotaCredito) {
              this.tiposEcf = this.tiposEcf.filter(
                (x) => x.codigoTipoEcf == "34" || x.codigoTipoEcf == "33"
              );
            } else {
              this.tiposEcf = this.tiposEcf.filter(
                (x) => x.codigoTipoEcf != "34" && x.codigoTipoEcf != "33"
              );
            }
            this.loading = false;
          },
        });
    } catch (error) {
      console.error("Error cargando secuencias:", error);
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
            error: (err: any) => console.error("Error al cargar cliente", err),
          });
        }

        this.form.patchValue({
          referencia: `NC-${factura.ecf || factura.id}`,
          idMoneda: factura.idMoneda || 1,
          tasaCambio: factura.tasaCambio || 1.0,
          idTipoIngreso: factura.idTipoIngreso || 1,
          idCondicionPago: factura.idCondicionPago || 1,
          comentario: `Nota de crédito para factura ${
            factura.ecf || factura.id
          }`,
        });

        if (factura.detalles && factura.detalles.length > 0) {
          this.items = factura.detalles.map((detalle: any) => {
            const tipoImpuesto = this.tiposImpuesto.find(
              (t) => t.id === detalle.idTipoImpuesto
            );
            const tasaImpuesto = tipoImpuesto ? tipoImpuesto.impuestoP : 18;

            const productData: Product = {
              id: detalle.idProducto,
              idEmpresa: detalle.idEmpresa,
              descripcion: detalle.descripcionProducto,
              codigo: detalle.codigoUnidad || "",
              precio: detalle.precio,
              idMedida: 0,
              idTipoImpuesto: detalle.idTipoImpuesto,
              itbisIncluido: false,
              fechaAdd: detalle.fechaAdd,
              bloqueado: detalle.bloqueado,
              aplicaDescuento: true,
              descripcionUnidad: detalle.descripcionMedida || "",
              descripcionTipoImpuesto: detalle.descripcionItbi || "",
              tipoProducto: 1,
            };

            const item: InvoiceItem = {
              ...productData,
              product: productData,
              quantity: detalle.cantidad,
              price: detalle.precio,
              discountStr: detalle.porcientoDescuento?.toString() || "0",
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
              additionalTaxesSelected: new Set(),
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
        console.error("Error al cargar factura original", err);
        this.notificationService.error("No se pudo cargar la factura original");
        this.loading = false;
      },
    });
  }

  get hasNoResults(): boolean {
    return (
      !this.isSearchingClient &&
      !this.clientError &&
      this.clientResults.length === 0 &&
      this.form.value.clientSearch?.length >= 2
    );
  }

  get hasNoProductResults(): boolean {
    return (
      !this.isSearchingProduct &&
      !this.productError &&
      this.productResults.length === 0 &&
      this.form.value.productSearch?.length >= 2
    );
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
    this.clientError = "";
    this.showClientDropdown = true;

    this.customerService.getClientes(1, 2, {}).subscribe({
      next: (resp) => {
        this.clientResults = resp.data;
        this.isSearchingClient = false;
      },
      error: (error) => {
        this.clientError = "Error al cargar clientes";
        this.isSearchingClient = false;
      },
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
    this.clientError = "";
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
            this.clientError = "Error al buscar clientes";
            this.isSearchingClient = false;
          },
        });
      } catch (error) {
        this.clientError = "Error al buscar clientes";
        this.isSearchingClient = false;
      }
    }, 300);
  }
  selectClient(client: Customer) {
    this.form.patchValue({
      selectedClient: client,
      clientSearch: client.razonSocial,
    });
    this.clientLocked = true;
    this.showClientDropdown = false;
    this.clientResults = [];
  }

  changeClient() {
    this.clientLocked = false;
    this.form.patchValue({
      selectedClient: null,
      clientSearch: "",
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
    this.productError = "";
    this.showProductDropdown = true;

    this.productService.getProducts(1, 2, {}).subscribe({
      next: (resp) => {
        this.productResults = resp.data;
        this.isSearchingProduct = false;
      },
      error: (error) => {
        this.productError = "Error al cargar productos";
        this.isSearchingProduct = false;
      },
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
    this.productError = "";
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
            this.productError = "Error al buscar productos";
            this.isSearchingProduct = false;
          },
        });
      } catch (error) {
        this.productError = "Error al buscar productos";
        this.isSearchingProduct = false;
      }
    }, 300);
  }

  selectProduct(product: Product) {
    const tipoImpuesto = this.tiposImpuesto.find(
      (t) => t.id === product.idTipoImpuesto
    );
    const tasaImpuesto = tipoImpuesto ? tipoImpuesto.impuestoP : 18;

    const newItem: InvoiceItem = {
      ...product,
      product: product,
      quantity: 1,
      price: product.precio,
      discountStr: "0",
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
      additionalTaxesSelected: new Set(),
    };

    this.items.push(newItem);
    this.form.patchValue({ productSearch: "" });
    this.showProductDropdown = false;
    this.productResults = [];
    this.calculateItem(this.items.length - 1);
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  onApplyItbisInclusiveModelChange(index: number) {
    const str = this.items[index].discountStr;
    const val = parseFloat(str) || 0;
    this.items[index].porcientoDescuento = Math.min(100, Math.max(0, val));
    this.calculateItem(index);
  }

  onDiscountModelChange(index: number) {
    let str = this.items[index].discountStr;
    let val = parseFloat(str);

    if (isNaN(val)) val = 0;

    if (val < 1) val = 1;
    if (val > 100) val = 100;

    this.items[index].discountStr = val.toString();
    this.items[index].porcientoDescuento = val;

    this.calculateItem(index);
  }

  onChangeTipoImpuesto(index: number) {
    const item = this.items[index];
    const tipo = this.tiposImpuesto.find((t) => t.id === item.idTipoImpuesto);

    if (tipo) {
      item.itbisPct = tipo.impuestoP;
    }

    this.calculateItem(index);
  }

  calculateItem(index: number) {
    const item = this.items[index];
    let baseAmount = item.quantity * item.price;

    if (this.precioIncluyeImpuestos) {
      const tipoImpuesto = this.tiposImpuesto.find(
        (t) => t.id === item.idTipoImpuesto
      );
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

    const tipoImpuesto = this.tiposImpuesto.find(
      (t) => t.id === item.idTipoImpuesto
    );
    const tasaImpuesto = tipoImpuesto ? tipoImpuesto.impuestoP : 18;
    item.valorItbis = baseConAjustes * (tasaImpuesto / 100);

    item.valorImpuesto = 0;
    if (item.additionalTaxesSelected.size > 0) {
      item.additionalTaxesSelected.forEach((taxId) => {
        const impuesto = this.impuestosAdicionales.find((i) => i.id === taxId);
        if (impuesto) {
          item.valorImpuesto += baseConAjustes * (impuesto.impuestoP / 100);
        }
      });
    }

    let total = baseConAjustes + item.valorItbis + item.valorImpuesto;

    if (this.tieneRetencion) {
      total -= item.valorItbisRetencion + item.valorIsrRetencion;
    }

    item.totalDetalle = total;
    item.total = total;
  }

  onToggleItbisInclusive(event: any) {
    this.precioIncluyeImpuestos = event.target.checked;

    this.items.forEach((_, index) => this.calculateItem(index));
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

    if (!item.additionalTaxesSelected) {
      item.additionalTaxesSelected = new Set<number>();
    }

    if (checked && item.additionalTaxesSelected.size >= 2) {
      this.notificationService.error(
        "Solo puedes seleccionar máximo 2 impuestos adicionales."
      );
      return;
    }

    if (checked) {
      item.additionalTaxesSelected.add(taxId);
    } else {
      item.additionalTaxesSelected.delete(taxId);
    }

    this.calculateItem(itemIndex);
  }

  focusProductSearch() {
    const input = document.getElementById("productSearch") as HTMLInputElement;
    if (input) input.focus();
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => {
      let base = item.quantity * item.price;
      if (this.precioIncluyeImpuestos && item.itbisIncluido) {
        const tipoImpuesto = this.tiposImpuesto.find(
          (t) => t.id === item.idTipoImpuesto
        );
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
    return this.items.reduce((sum, item) => sum + item.valorImpuesto, 0);
  }

  get montoTotal(): number {
    let total = this.subtotal + this.totalImpuestos + this.totalItbis;
    if (this.tieneRetencion) {
      const retenciones = this.items.reduce((sum, item) => {
        return sum + item.valorItbisRetencion + item.valorIsrRetencion;
      }, 0);
      total -= retenciones;
    }
    return total;
  }

  get totalItbisRetencion(): number {
    return this.items.reduce((sum, item) => sum + item.valorItbisRetencion, 0);
  }

  get totalIsrRetencion(): number {
    return this.items.reduce((sum, item) => sum + item.valorIsrRetencion, 0);
  }

  validateDiscount(index: number) {
    const item = this.items[index];
    const value = Number(item.discountStr);

    // Reset error
    item.discountError = "";

    if (isNaN(value)) {
      item.discountError = "Debe introducir un número válido.";
      return;
    }

    if (value < 1) {
      item.discountError = "El descuento no puede ser menor que 1%.";
      return;
    }

    if (value > 100) {
      item.discountError = "El descuento no puede exceder 100%.";
      return;
    }

    // Si no hay error → guardamos el valor real
    item.porcientoDescuento = value;

    this.calculateItem(index);
  }

  buildFacturaRequest(): FacturaRequest | null {
    const formValue = this.form.value;
    const selectedClient = formValue.selectedClient as Customer;

    if (!selectedClient || !formValue.idTipoEcf || this.items.length === 0) {
      return null;
    }

    const detail: FacturaDetailRequest[] = this.items.map((item) => ({
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
        ValorIsrRetencion: item.valorIsrRetencion,
      }),
      totalDetalle: item.totalDetalle,
      ...(item.additionalTaxesSelected.size > 0 && {
        impuestosAdicionales: Array.from(item.additionalTaxesSelected).map(
          (taxId) => {
            const impuesto = this.impuestosAdicionales.find(
              (i) => i.id === taxId
            );
            const baseAmount =
              item.quantity * item.precio -
              item.valorDescuento +
              item.valorRecargo;
            return {
              idImpuestoAdicional: taxId,
              porcientoImpuesto: impuesto?.impuestoP || 0,
              valorImpuesto: baseAmount * ((impuesto?.impuestoP || 0) / 100),
            };
          }
        ),
      }),
    }));

    const request: FacturaRequest = {
      idEmpresa: this.facturasService.EMPRESA?.userCompanies[0].id || 0,
      idCliente: selectedClient.id,
      comentario: formValue.comentario || "",
      tipoVenta: "CO",
      referencia: formValue.referencia || "",
      idTipoEcf: formValue.idTipoEcf,
      idMoneda: formValue.idMoneda,
      tasaCambio: formValue.tasaCambio,
      fechaEmisionEcf: this.toIsoDate(formValue.fechaEmisionEcf),
      idTipoIngreso: formValue.idTipoIngreso,
      idCondicionPago: formValue.idCondicionPago,
      tieneRetencion: this.tieneRetencion,
      montoTotal: this.montoTotal,
      totalImpuestos: this.totalImpuestos,
      estadoFactura: "Borrador",
      AplicaDescuento: this.aplicaDescuento,
      PrecioIncluyeImpuestos: this.precioIncluyeImpuestos,
      detail,
    };
    return request;
  }

  toIsoDate(dateInput: any): string {
    if (!dateInput) return "";

    // Si ya es Date → convertir a ISO directo
    if (dateInput instanceof Date) {
      return dateInput.toISOString().substring(0, 10); // YYYY-MM-DD
    }

    // Si NO es string → devolver vacío
    if (typeof dateInput !== "string") {
      return "";
    }

    const dateStr = dateInput;

    // Detectar formato DD-MM-YYYY
    const dashed = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (dashed) {
      const [_, dd, mm, yyyy] = dashed;
      return `${yyyy}-${mm}-${dd}`;
    }

    // Detectar formato DD/MM/YYYY
    const slashed = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (slashed) {
      const [_, dd, mm, yyyy] = slashed;
      return `${yyyy}-${mm}-${dd}`;
    }

    // Detectar formato ISO ya válido
    const iso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) {
      return dateStr;
    }

    return "";
  }

  async guardarFactura() {
    this.loading = true;

    // 💡 REGLA ESPECIAL PARA FACTURA 32
    if (this.esFacturaConsumoMontoAlto() && !this.form.value.selectedClient) {
      this.notificationService.error(
        "Para Factura de Consumo (32) igual o mayor a RD$250,000 el cliente es obligatorio."
      );
      this.loading = false;
      return;
    }

    if (this.form.invalid || this.items.length === 0) {
      this.loading = false;
      return;
    }

    const facturaRequest = this.buildFacturaRequest();
    if (!facturaRequest) {
      this.loading = false;
      return;
    }

    this.facturasService.post("Invoice/Add", facturaRequest).subscribe({
      next: (resp) => {
        this.loading = false;
        const mensaje = this.isNotaCredito
          ? "Nota de crédito creada exitosamente"
          : "Factura creada exitosamente";
        this.notificationService.success(mensaje);
        this.router.navigate(["/facturas"]);
      },
      error: (error) => {
        this.loading = false;

        const mensaje = this.isNotaCredito
          ? "Error al crear la nota de crédito"
          : "Error al crear la factura";

        const backend = error?.error;

        // 1️⃣ Si existe backend.messages (lista)
        if (backend?.messages && Array.isArray(backend.messages)) {
          backend.messages.forEach((m: any) => {
            this.notificationService.error(
              m.msg || m.message || JSON.stringify(m)
            );
          });
        }

        // 2️⃣ Si backend trae solo un message
        else if (backend?.message) {
          this.notificationService.error(backend.message);
        }

        // 3️⃣ Si no se reconoce la estructura → imprimir error general
        else {
          this.notificationService.error("Ocurrió un error inesperado.");
          console.error("Error no reconocido del backend:", error);
        }

        // 4️⃣ Mensaje final del proceso
        this.notificationService.error(mensaje);
      },
    });
  }

  esFacturaConsumoMontoAlto(): boolean {
    const tipo = this.form.value.idTipoEcf;
    const sec = this.tiposEcf.find((x) => x.idTipoEcf === tipo);
    if (!sec) return false;

    return sec.codigoTipoEcf === "32" && this.montoTotal >= 250000;
  }

  formatCurrency(amount: number): string {
    return "RD$ " + amount.toFixed(2);
  }
}
