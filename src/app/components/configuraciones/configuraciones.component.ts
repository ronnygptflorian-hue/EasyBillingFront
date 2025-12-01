import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoicesTabComponent } from './tabs/invoices-tab.component/invoices-tab.component';
import {CertificateTabComponent } from './tabs/certificate-tab.component/certificate-tab.component'
@Component({
  selector: 'app-configuraciones',
  standalone: true,
  imports: [CommonModule,InvoicesTabComponent,CertificateTabComponent],
  templateUrl: './configuraciones.component.html',
  styleUrls: ['./configuraciones.component.scss']
})
export class ConfiguracionesComponent {
  activeTab: 'certificado' | 'comprobantes' | 'facturacion' | 'correo' = 'certificado';
  mobileMenuOpen = false;

  setTab(tab: 'certificado' | 'comprobantes' | 'facturacion' | 'correo') {
    this.activeTab = tab;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
