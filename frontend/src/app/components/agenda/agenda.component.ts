import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { AgendaService } from '../../services/agenda.service';
import { AuthService } from '../../services/auth.service';
import { Agendamento } from '../../models/agendamento.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css']
})
export class AgendaComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tabulatorTable', { static: false }) tableElement!: ElementRef;

  tabulatorInstance?: Tabulator;
  currentUser: User | null = null;
  agendamentos: Agendamento[] = [];
  
  loading = false;
  errorMessage = '';
  searchTerm = '';
  
  // Flags para simulação de cenários da Mock API
  simulateFail = false;
  simulateEmpty = false;

  constructor(
    private agendaService: AgendaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
  }

  ngAfterViewInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    if (this.tabulatorInstance) {
      this.tabulatorInstance.destroy();
    }
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.agendaService.getAgendamentos(this.simulateFail, this.simulateEmpty).subscribe({
      next: (data) => {
        this.loading = false;
        this.agendamentos = data;
        this.initOrUpdateTable(data);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Erro ao carregar lista de agendamentos.';
        if (this.tabulatorInstance) {
          this.tabulatorInstance.setData([]);
        }
      }
    });
  }

  private initOrUpdateTable(data: Agendamento[]): void {
    if (!this.tableElement) return;

    if (this.tabulatorInstance) {
      this.tabulatorInstance.setData(data);
      return;
    }

    this.tabulatorInstance = new Tabulator(this.tableElement.nativeElement, {
      data: data,
      layout: 'fitColumns',
      responsiveLayout: 'collapse',
      pagination: true,
      paginationSize: 10,
      paginationSizeSelector: [5, 10, 25, 50],
      placeholder: 'Nenhum agendamento encontrado',
      columns: [
        { title: 'ID', field: 'id', width: 70, hozAlign: 'center' },
        { 
          title: 'Data', 
          field: 'data', 
          width: 120,
          formatter: (cell) => {
            const val = cell.getValue();
            if (!val || val === '----/--/--') return val;
            const parts = val.split('-');
            return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : val;
          }
        },
        { title: 'Horário', field: 'horario', width: 90, hozAlign: 'center' },
        { title: 'Paciente', field: 'paciente', minWidth: 160 },
        { title: 'CPF', field: 'cpf', width: 140 },
        { title: 'Médico', field: 'medico', minWidth: 160 },
        { title: 'Especialidade', field: 'especialidade', width: 140 },
        { title: 'Convênio', field: 'convenio', width: 130 },
        { 
          title: 'Status', 
          field: 'status', 
          width: 130,
          hozAlign: 'center',
          formatter: (cell) => {
            const val = cell.getValue() || 'Pendente';
            const statusClass = val.toLowerCase();
            return `<span class="badge-status ${statusClass}">${val}</span>`;
          }
        }
      ]
    });
  }

  onSearchChange(): void {
    if (!this.tabulatorInstance) return;

    const term = this.searchTerm ? this.searchTerm.trim() : '';

    if (!term) {
      this.tabulatorInstance.clearFilter();
      return;
    }

    // Busca insensível a maiúsculas/minúsculas por Paciente, CPF ou Médico
    this.tabulatorInstance.setFilter((data: Agendamento) => {
      const lowerTerm = term.toLowerCase();
      const pacienteMatch = data.paciente ? data.paciente.toLowerCase().includes(lowerTerm) : false;
      const cpfMatch = data.cpf ? data.cpf.replaceAll('.', '').replaceAll('-', '').includes(lowerTerm.replaceAll('.', '').replaceAll('-', '')) : false;
      const medicoMatch = data.medico ? data.medico.toLowerCase().includes(lowerTerm) : false;

      return pacienteMatch || cpfMatch || medicoMatch;
    });
  }

  toggleSimulateFail(): void {
    this.simulateFail = !this.simulateFail;
    if (this.simulateFail) this.simulateEmpty = false;
    this.loadData();
  }

  toggleSimulateEmpty(): void {
    this.simulateEmpty = !this.simulateEmpty;
    if (this.simulateEmpty) this.simulateFail = false;
    this.loadData();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
