import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-busca-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './busca-paciente.component.html',
  styleUrls: ['./busca-paciente.component.css']
})
export class BuscaPacienteComponent {
  nomePaciente = '';

  @Output() search = new EventEmitter<{ type: string, value: string }>();
  @Output() clear = new EventEmitter<void>();

  onSearch(): void {
    if (this.nomePaciente.trim()) {
      this.search.emit({ type: 'paciente', value: this.nomePaciente.trim() });
    }
  }

  onClear(): void {
    this.nomePaciente = '';
    this.clear.emit();
  }
}
