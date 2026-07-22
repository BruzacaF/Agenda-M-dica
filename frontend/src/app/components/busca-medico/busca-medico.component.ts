import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-busca-medico',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './busca-medico.component.html',
  styleUrls: ['./busca-medico.component.css']
})
export class BuscaMedicoComponent {
  nomeMedico = '';

  @Output() search = new EventEmitter<{ type: string, value: string }>();
  @Output() clear = new EventEmitter<void>();

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.nomeMedico = input.value.replace(/[0-9]/g, '');
      input.value = this.nomeMedico;
    }
  }

  onSearch(): void {
    if (this.nomeMedico.trim()) {
      this.search.emit({ type: 'medico', value: this.nomeMedico.trim() });
    }
  }

  onClear(): void {
    this.nomeMedico = '';
    this.clear.emit();
  }
}

