import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeatureService } from '../../service/feature.service';
import { Feature, EmpresaFeature } from '../../model/feature.model';
import { NotificationService } from '../../../../services/notification.service';
import { LoadingComponent } from '../../../shared/loading.component/loading.component';

@Component({
  selector: 'app-features-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './features-tab.component.html',
  styleUrls: ['./features-tab.component.scss']
})
export class FeaturesTabComponent implements OnInit {
  loading = false;
  allFeatures: Feature[] = [];
  empresaFeatures: EmpresaFeature[] = [];
  idEmpresa: number = 0;

  constructor(
    private featureService: FeatureService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('User');
    if (userStr) {
      const userData = JSON.parse(userStr);
      this.idEmpresa = userData.idEmpresa;
      this.loadData();
    }
  }

  loadData() {
    this.loading = true;
    this.featureService.getAllFeatures().subscribe({
      next: (response) => {
        if (response.data) {
          this.allFeatures = response.data;
          this.loadEmpresaFeatures();
        }
      },
      error: (error) => {
        console.error('Error al cargar features:', error);
        this.notificationService.error('Error al cargar las características');
        this.loading = false;
      }
    });
  }

  loadEmpresaFeatures() {
    this.featureService.getEmpresaFeatures(this.idEmpresa).subscribe({
      next: (response) => {
        if (response.data) {
          this.empresaFeatures = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar features de empresa:', error);
        this.loading = false;
      }
    });
  }

  isFeatureActive(featureId: number): boolean {
    const empresaFeature = this.empresaFeatures.find(ef => ef.idFeature === featureId);
    return empresaFeature?.activo || false;
  }

  getFeatureValue(featureId: number): string {
    const empresaFeature = this.empresaFeatures.find(ef => ef.idFeature === featureId);
    return empresaFeature?.valor || 'false';
  }

  toggleFeature(feature: Feature) {
    const empresaFeature = this.empresaFeatures.find(ef => ef.idFeature === feature.id);

    if (empresaFeature) {
      this.loading = true;
      this.featureService.deleteEmpresaFeature(empresaFeature.id).subscribe({
        next: (response) => {
          const successMsg = response.messages?.find((m: any) => m.type === 'success');
          if (successMsg) {
            this.notificationService.success('Característica desactivada');
            this.loadEmpresaFeatures();
          }
        },
        error: (error) => {
          console.error('Error al desactivar feature:', error);
          this.notificationService.error('Error al desactivar la característica');
          this.loading = false;
        }
      });
    } else {
      this.loading = true;
      const request = {
        idEmpresa: this.idEmpresa,
        idFeature: feature.id,
        activo: true,
        valor: 'true',
        observacion: ''
      };

      this.featureService.addFeatureToEmpresa(request).subscribe({
        next: (response) => {
          const successMsg = response.messages?.find((m: any) => m.type === 'success');
          if (successMsg) {
            this.notificationService.success('Característica activada');
            this.loadEmpresaFeatures();
          }
        },
        error: (error) => {
          console.error('Error al activar feature:', error);
          this.notificationService.error('Error al activar la característica');
          this.loading = false;
        }
      });
    }
  }
}
