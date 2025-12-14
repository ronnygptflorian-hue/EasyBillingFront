import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigutionService } from '../../service/configuracion.service';
import { Certificado, EmpresaCertificadoResponse } from '../../model/configuration.model';
import { CustomDatepickerComponent } from '../../../shared/custom-datepicker/custom-datepicker.component';

interface CertificateData {
  idEmpresa: number;
  idCertificado?: number;
  entidadEmisora: string;
  fechaEmision: string | null;
  fechaEfectiva: string;
  fechaExpira: string;
  alias: string;
  credenciales: string;
  idUsuario: number;
  nivelAcceso: number;
  bloqueado: boolean;
  default: boolean;
}

@Component({
  selector: 'app-certificate-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDatepickerComponent],
  templateUrl: './certificate-tab.component.html',
  styleUrls: ['./certificate-tab.component.scss']
})
export class CertificateTabComponent implements OnInit {
  loading = false;
  selectedFile: File | null = null;
  certificateInfo: Certificado | null = null;
  empresaInfo: EmpresaCertificadoResponse | null = null;

  certificateData: CertificateData = {
    idEmpresa: 12,
    entidadEmisora: '',
    fechaEmision: null,
    fechaEfectiva: '',
    fechaExpira: '',
    alias: '',
    credenciales: '',
    idUsuario: 24,
    nivelAcceso: 1,
    bloqueado: false,
    default: false
  };

  constructor(private configuracionService: ConfigutionService) {}

  ngOnInit() {
    this.loadCurrentCertificate();
  }

  loadCurrentCertificate() {
    this.configuracionService.getCompanyInfo().subscribe({
      next: (response: EmpresaCertificadoResponse) => {
        console.log('Respuesta del servidor:', response);
        if (response && response.certificado) {
          this.empresaInfo = response;
          this.certificateInfo = response.certificado;
          this.populateFormWithCurrentCertificate();
        }
      },
      error: (error) => {
        console.error('Error al cargar certificado:', error);
      }
    });
  }

  populateFormWithCurrentCertificate() {
    if (this.certificateInfo) {
      console.log('Poblando formulario con certificado:', this.certificateInfo);

      this.certificateData = {
        idEmpresa: this.certificateInfo.idEmpresa,
        idCertificado: this.certificateInfo.id,
        entidadEmisora: this.certificateInfo.entidadEmisora || '',
        fechaEmision: this.certificateInfo.fechaEmision,
        fechaEfectiva: this.formatDateForInput(this.certificateInfo.fechaEfectiva),
        fechaExpira: this.formatDateForInput(this.certificateInfo.fechaExpira),
        alias: this.certificateInfo.alias || '',
        credenciales: '',
        idUsuario: 24,
        nivelAcceso: 1,
        bloqueado: this.certificateInfo.bloqueado,
        default: false
      };

      console.log('Datos del formulario después de poblar:', this.certificateData);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith('.p12') || file.name.endsWith('.pfx')) {
        this.selectedFile = file;
      } else {
        alert('Por favor selecciona un archivo .p12 o .pfx');
        event.target.value = '';
      }
    }
  }

  onSubmit() {
    if (!this.selectedFile) {
      alert('Por favor selecciona un archivo de certificado');
      return;
    }

    this.loading = true;

    const formData = new FormData();

    const jsonData = JSON.stringify({
      IdEmpresa: this.certificateData.idEmpresa,
      IdCertificado: this.certificateData.idCertificado || 0,
      EntidadEmisora: this.certificateData.entidadEmisora,
      FechaEmision: this.certificateData.fechaEmision,
      FechaEfectiva: this.certificateData.fechaEfectiva,
      FechaExpira: this.certificateData.fechaExpira,
      Alias: this.certificateData.alias,
      Credenciales: this.certificateData.credenciales,
      IdUsuario: this.certificateData.idUsuario,
      NivelAcceso: this.certificateData.nivelAcceso,
      Bloqueado: this.certificateData.bloqueado,
      Default: this.certificateData.default
    });

    formData.append('', jsonData);
    formData.append('certificado', this.selectedFile);

    this.configuracionService.updateCertificate(formData).subscribe({
      next: (response) => {
        this.loading = false;
        alert('Certificado actualizado exitosamente');
        this.loadCurrentCertificate();
        this.resetForm();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al actualizar certificado:', error);
        alert('Error al actualizar el certificado. Por favor intenta de nuevo.');
      }
    });
  }

  onCancel() {
    this.resetForm();
  }

  resetForm() {
    this.certificateData = {
      idEmpresa: 12,
      entidadEmisora: '',
      fechaEmision: null,
      fechaEfectiva: '',
      fechaExpira: '',
      alias: '',
      credenciales: '',
      idUsuario: 24,
      nivelAcceso: 1,
      bloqueado: false,
      default: false
    };
    this.selectedFile = null;
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isExpired(): boolean {
    if (!this.certificateInfo || !this.certificateInfo.fechaExpira) {
      return false;
    }
    const expiryDate = new Date(this.certificateInfo.fechaExpira);
    return expiryDate < new Date();
  }

  removeFile(event: Event) {
    event.stopPropagation();
    this.selectedFile = null;
  }
}
