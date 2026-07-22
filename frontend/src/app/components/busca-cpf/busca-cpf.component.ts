import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-busca-cpf',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './busca-cpf.component.html',
  styleUrls: ['./busca-cpf.component.css']
})
export class BuscaCpfComponent {
  cpf = '';

  @Output() search = new EventEmitter<{ type: string, value: string }>();
  @Output() clear = new EventEmitter<void>();

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
