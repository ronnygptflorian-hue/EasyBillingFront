import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlantillaPrintService } from '../../service/plantilla-print.service';
import { PlantillaPrint, PrintOption } from '../../model/plantilla-print.model';
import { NotificationService } from '../../../../services/notification.service';
import { LoadingComponent } from '../../../shared/loading.component/loading.component';

@Component({
  selector: 'app-plantillas-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './plantillas-tab.component.html',
  styleUrls: ['./plantillas-tab.component.scss']
})
export class PlantillasTabComponent implements OnInit {
  loading = false;
  currentPlantilla: PlantillaPrint | null = null;
  printOptions: PrintOption[] = [];
  selectedOption: string = '';
  showPreview = false;
  idEmpresa: number = 0;
  creadoPor: string = '';

  constructor(
    private plantillaPrintService: PlantillaPrintService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('User');
    if (userStr) {
      const userData = JSON.parse(userStr);
      this.idEmpresa = userData.idEmpresa;
      this.creadoPor = userData.nombre || 'Usuario';
      this.loadData();
    }
  }

  loadData() {
    this.loading = true;
    this.plantillaPrintService.getPrintOptions().subscribe({
      next: (options) => {
        this.printOptions = options;
        this.loadCurrentPlantilla();
      },
      error: (error) => {
        console.error('Error al cargar opciones de plantillas:', error);
        this.notificationService.error('Error al cargar las opciones de plantillas');
        this.loading = false;
      }
    });
  }

  loadCurrentPlantilla() {
    this.plantillaPrintService.getPlantillaByEmpresa(this.idEmpresa).subscribe({
      next: (response) => {
        if (response.data) {
          this.currentPlantilla = response.data;
          this.selectedOption = response.data.tipoPlantilla;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar plantilla actual:', error);
        this.loading = false;
      }
    });
  }

  onOptionChange() {
    this.showPreview = true;
  }

  getPreviewImage(): string {
    if (this.selectedOption === 'A4') {
      return 'https://images.pexels.com/photos/6289065/pexels-photo-6289065.jpeg?auto=compress&cs=tinysrgb&w=800';
    } else if (this.selectedOption === 'Ticket') {
      return 'https://images.pexels.com/photos/5650026/pexels-photo-5650026.jpeg?auto=compress&cs=tinysrgb&w=800';
    }
    return '';
  }

  getSelectedOptionText(): string {
    const option = this.printOptions.find(opt => opt.value === this.selectedOption);
    return option?.text || '';
  }

  savePlantilla() {
    if (!this.selectedOption) {
      this.notificationService.error('Por favor selecciona una plantilla');
      return;
    }

    this.loading = true;
    const selectedPrintOption = this.printOptions.find(opt => opt.value === this.selectedOption);

    const request = {
      idEmpresa: this.idEmpresa,
      nombrePlantilla: selectedPrintOption?.text || '',
      tipoPlantilla: this.selectedOption,
      fechaCreacion: new Date().toISOString(),
      creadoPor: this.creadoPor
    };

    this.plantillaPrintService.createPlantilla(request).subscribe({
      next: (response) => {
        const successMsg = response.messages?.find((m: any) => m.type === 'success');
        if (successMsg || response.data) {
          this.notificationService.success('Plantilla configurada exitosamente');
          this.showPreview = false;
          this.loadCurrentPlantilla();
        }
      },
      error: (error) => {
        console.error('Error al guardar plantilla:', error);
        this.notificationService.error('Error al guardar la plantilla');
        this.loading = false;
      }
    });
  }

  deletePlantilla() {
    if (!confirm('¿Estás seguro de que deseas eliminar la configuración actual de plantilla?')) {
      return;
    }

    this.loading = true;
    this.plantillaPrintService.deletePlantilla(this.idEmpresa).subscribe({
      next: (response) => {
        this.notificationService.success('Plantilla eliminada');
        this.currentPlantilla = null;
        this.selectedOption = '';
        this.showPreview = false;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al eliminar plantilla:', error);
        this.notificationService.error('Error al eliminar la plantilla');
        this.loading = false;
      }
    });
  }
}
