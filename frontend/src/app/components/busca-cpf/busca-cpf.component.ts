import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-busca-cpf',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './busca-cpf.component.html',
  styleUrls: ['./busca-cpf.component.css']
})
export class BuscaCpfComponent {
  cpf = '';

  @Output() search = new EventEmitter<{ type: string, value: string }>();
  @Output() clear = new EventEmitter<void>();

  onCpfInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    if (value.length > 9) {
      this.cpf = `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6, 9)}-${value.substring(9)}`;
    } else if (value.length > 6) {
      this.cpf = `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6)}`;
    } else if (value.length > 3) {
      this.cpf = `${value.substring(0, 3)}.${value.substring(3)}`;
    } else {
      this.cpf = value;
    }
  }

  onSearch(): void {
    if (this.cpf.trim()) {
      this.search.emit({ type: 'cpf', value: this.cpf.trim() });
    }
  }

  onClear(): void {
    this.cpf = '';
    this.clear.emit();
  }
}
