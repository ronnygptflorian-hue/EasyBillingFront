import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoicesTabComponent } from './tabs/invoices-tab.component/invoices-tab.component';
import { CertificateTabComponent } from './tabs/certificate-tab.component/certificate-tab.component';
import { FeaturesTabComponent } from './tabs/features-tab.component/features-tab.component';
import { SmtpTabComponent } from './tabs/smtp-tab.component/smtp-tab.component';
import { PlantillasTabComponent } from './tabs/plantillas-tab.component/plantillas-tab.component';

@Component({
  selector: 'app-configuraciones',
  standalone: true,
  imports: [
    CommonModule,
    InvoicesTabComponent,
    CertificateTabComponent,
    FeaturesTabComponent,
    SmtpTabComponent,
    PlantillasTabComponent
  ],
  templateUrl: './configuraciones.component.html',
  styleUrls: ['./configuraciones.component.scss']
})
export class ConfiguracionesComponent {
  activeTab: 'certificado' | 'comprobantes' | 'features' | 'smtp' | 'plantillas' = 'certificado';
  mobileMenuOpen = false;

  setTab(tab: 'certificado' | 'comprobantes' | 'features' | 'smtp' | 'plantillas') {
    this.activeTab = tab;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
