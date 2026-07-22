import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-busca-paciente',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
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
