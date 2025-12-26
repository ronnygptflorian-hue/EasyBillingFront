import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "modal-crear-cliente",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./modal-crear-cliente.component.html",
  styleUrls: ["./modal-crear-cliente.component.scss"],
})
export class ModalCrearClienteComponent {
  @Input() showModal: boolean = false;
  @Input() isEditing: boolean = false;

  @Input() currentCliente: any = {};

  @Input() tipoIdOptions: { label: string; value: string }[] = [];
  @Input() provincias: string[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  closeModal() {
    this.close.emit();
  }

  addClient() {
    this.save.emit(this.currentCliente);
  }

  validarLongitudDocumento() {
    const tipo = this.currentCliente.tipoId;
    let doc = this.currentCliente.rnc || "";

    if (tipo === "C") {
      doc = doc.replace(/\D/g, "").slice(0, 11);
    } else if (tipo === "R") {
      doc = doc.replace(/\D/g, "").slice(0, 9);
    } else {
      doc = doc.slice(0, 50);
    }

    this.currentCliente.rnc = doc;
  }
}
