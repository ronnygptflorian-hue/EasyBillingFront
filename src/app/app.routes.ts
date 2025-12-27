import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { ProductosComponent } from './components/productos/productos.component';
import { FacturasListComponent } from './components/facturas/facturas-list.component';
import { CrearFacturaComponent } from './components/facturas/crear-factura.component';
import { ConfiguracionesComponent } from './components/configuraciones/configuraciones.component';
import { FacturasRecibidasComponent } from './components/facturas-recibidas/facturas-recibidas.component';
import { MiCuentaComponent } from './components/mi-cuenta/mi-cuenta.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'productos', component: ProductosComponent },
      { path: 'facturas', component: FacturasListComponent },
      { path: 'facturas/crear', component: CrearFacturaComponent },
      { path: 'facturas-recibidas', component: FacturasRecibidasComponent },
      { path: 'configuraciones', component: ConfiguracionesComponent },
      { path: 'mi-cuenta', component: MiCuentaComponent },
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
