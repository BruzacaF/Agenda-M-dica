import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

// @ts-ignore
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { AgendaService, AgendaFilters } from '../../services/agenda.service';
import { AuthService } from '../../services/auth.service';
import { Agendamento } from '../../models/agendamento.model';
import { User } from '../../models/user.model';
import { BuscaPacienteComponent } from '../busca-paciente/busca-paciente.component';
import { BuscaCpfComponent } from '../busca-cpf/busca-cpf.component';
import { BuscaMedicoComponent } from '../busca-medico/busca-medico.component';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatToolbarModule,
    MatCardModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    BuscaPacienteComponent, 
    BuscaCpfComponent, 
    BuscaMedicoComponent
  ],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css']
})
export class AgendaComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tabulatorTable', { static: false }) tableElement!: ElementRef;

  // TABULATOR CONTINUA SENDO O MOTOR ESTRITO DA TABELA
  tabulatorInstance?: Tabulator;
  currentUser: User | null = null;
  agendamentos: Agendamento[] = [];
  
  loading = false;
  errorMessage = '';
  isAuthError = false;
  
  // Modo de Busca: 'individual' (Abas) ou 'multi' (Agrupado)
  searchMode: 'individual' | 'multi' = 'individual';
  
  // Aba Ativa para Filtro Individual ('paciente' | 'cpf' | 'medico')
  activeSearchTab: 'paciente' | 'cpf' | 'medico' = 'paciente';
  selectedTabIndex = 0;
  
  // Objeto de Filtros Ativos para o Servidor (Paciente, CPF, Médico)
  activeFilters: AgendaFilters = {};

  // Form Fields para o Modo Múltiplos Filtros Agrupados
  multiPaciente = '';
  multiCpf = '';
  multiMedico = '';

  // Parâmetros de Paginação Server-Side
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 1;

  // Flags para simulação de cenários da Mock API
  simulateFail = false;
  simulateEmpty = false;
  simulateOffline = false;
  simulateIncomplete = false;

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
    this.isAuthError = false;

    this.agendaService.getAgendamentos(
      this.currentPage,
      this.pageSize,
      this.activeFilters,
      this.simulateFail,
      this.simulateEmpty,
      this.simulateOffline,
      this.simulateIncomplete
    ).subscribe({
      next: (res) => {
        this.loading = false;
        this.agendamentos = res.data;
        this.totalRecords = res.total;
        this.totalPages = res.total_pages;
        this.currentPage = res.page;
        this.initOrUpdateTable(res.data);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.message || 'Erro ao carregar lista de agendamentos.';
        this.isAuthError = !this.authService.isLoggedIn() || err.status === 401 || (err.message && (err.message.includes('expirou') || err.message.includes('autorizado') || err.message.includes('sessão')));
        this.agendamentos = [];
        this.totalRecords = 0;
        this.totalPages = 1;
        this.currentPage = 1;
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
      setTimeout(() => this.tabulatorInstance?.redraw(true), 50);
      return;
    }

    // INICIALIZAÇÃO DA TABELA TABULATOR
    this.tabulatorInstance = new Tabulator(this.tableElement.nativeElement, {
      data: data,
      layout: 'fitColumns',
      height: '450px',
      pagination: false,
      placeholder: '<span>Nenhum agendamento encontrado</span>',
      columns: [
        { title: 'ID', field: 'id', width: 75, hozAlign: 'center', headerHozAlign: 'center' },
        { 
          title: 'Data', 
          field: 'data', 
          width: 110,
          hozAlign: 'center',
          headerHozAlign: 'center',
          formatter: (cell: any) => {
            const val = cell.getValue();
            if (!val || val === '----/--/--') return `<span style="color: #94a3b8; font-style: italic;">----/--/--</span>`;
            const parts = val.split('-');
            return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : val;
          }
        },
        { 
          title: 'Horário', 
          field: 'horario', 
          width: 90, 
          hozAlign: 'center', 
          headerHozAlign: 'center',
          formatter: (cell: any) => {
            const val = cell.getValue();
            return val === '--:--' ? `<span style="color: #94a3b8; font-style: italic;">--:--</span>` : val;
          }
        },
        { 
          title: 'Paciente', 
          field: 'paciente', 
          minWidth: 160,
          formatter: (cell: any) => {
            const val = cell.getValue();
            return val === 'Paciente Não Identificado' ? `<span style="color: #94a3b8; font-style: italic;">${val}</span>` : val;
          }
        },
        { 
          title: 'CPF', 
          field: 'cpf', 
          width: 140, 
          hozAlign: 'center', 
          headerHozAlign: 'center',
          formatter: (cell: any) => {
            const val = cell.getValue();
            return val === '---' ? `<span style="color: #94a3b8; font-style: italic;">${val}</span>` : val;
          }
        },
        { 
          title: 'Médico', 
          field: 'medico', 
          minWidth: 160,
          formatter: (cell: any) => {
            const val = cell.getValue();
            return val === 'Médico Não Informado' ? `<span style="color: #94a3b8; font-style: italic;">${val}</span>` : val;
          }
        },
        { title: 'Especialidade', field: 'especialidade', width: 140 },
        { title: 'Convênio', field: 'convenio', width: 130 },
        { 
          title: 'Status', 
          field: 'status', 
          width: 130,
          hozAlign: 'center',
          headerHozAlign: 'center',
          formatter: (cell: any) => {
            const val = cell.getValue() || 'Pendente';
            const statusClass = val.toLowerCase();
            return `<span class="badge-status ${statusClass}">${val}</span>`;
          }
        }
      ]
    });

    setTimeout(() => this.tabulatorInstance?.redraw(true), 100);
  }

  handleIndividualSearch(event: { type: string, value: string }): void {
    this.activeFilters = {};
    if (event.type === 'paciente') {
      this.activeFilters.paciente = event.value;
    } else if (event.type === 'cpf') {
      this.activeFilters.cpf = event.value;
    } else if (event.type === 'medico') {
      this.activeFilters.medico = event.value;
    }
    this.currentPage = 1;
    this.loadData();
  }

  onMultiPacienteInput(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.multiPaciente = input.value.replace(/[0-9]/g, '');
      input.value = this.multiPaciente;
    }
  }

  onMultiMedicoInput(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.multiMedico = input.value.replace(/[0-9]/g, '');
      input.value = this.multiMedico;
    }
  }

  onMultiCpfInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    if (value.length > 9) {
      this.multiCpf = `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6, 9)}-${value.substring(9)}`;
    } else if (value.length > 6) {
      this.multiCpf = `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6)}`;
    } else if (value.length > 3) {
      this.multiCpf = `${value.substring(0, 3)}.${value.substring(3)}`;
    } else {
      this.multiCpf = value;
    }
  }


  applyMultiSearch(): void {
    const filters: AgendaFilters = {};
    if (this.multiPaciente.trim()) filters.paciente = this.multiPaciente.trim();
    if (this.multiCpf.trim()) filters.cpf = this.multiCpf.trim();
    if (this.multiMedico.trim()) filters.medico = this.multiMedico.trim();

    this.activeFilters = filters;
    this.currentPage = 1;
    this.loadData();
  }

  clearAllFilters(): void {
    this.activeFilters = {};
    this.multiPaciente = '';
    this.multiCpf = '';
    this.multiMedico = '';
    this.currentPage = 1;
    this.loadData();
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    if (index === 0) this.activeSearchTab = 'paciente';
    else if (index === 1) this.activeSearchTab = 'cpf';
    else if (index === 2) this.activeSearchTab = 'medico';
  }

  switchSearchMode(mode: 'individual' | 'multi'): void {
    this.searchMode = mode;
  }

  hasActiveFilters(): boolean {
    return !!(this.activeFilters.paciente || this.activeFilters.cpf || this.activeFilters.medico);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadData();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadData();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadData();
    }
  }

  toggleSimulateFail(): void {
    this.simulateFail = !this.simulateFail;
    if (this.simulateFail) {
      this.simulateEmpty = false;
      this.simulateOffline = false;
      this.simulateIncomplete = false;
    }
    this.currentPage = 1;
    this.loadData();
  }

  toggleSimulateEmpty(): void {
    this.simulateEmpty = !this.simulateEmpty;
    if (this.simulateEmpty) {
      this.simulateFail = false;
      this.simulateOffline = false;
      this.simulateIncomplete = false;
    }
    this.currentPage = 1;
    this.loadData();
  }

  toggleSimulateOffline(): void {
    this.simulateOffline = !this.simulateOffline;
    if (this.simulateOffline) {
      this.simulateFail = false;
      this.simulateEmpty = false;
      this.simulateIncomplete = false;
    }
    this.currentPage = 1;
    this.loadData();
  }

  toggleSimulateIncomplete(): void {
    this.simulateIncomplete = !this.simulateIncomplete;
    if (this.simulateIncomplete) {
      this.simulateFail = false;
      this.simulateEmpty = false;
      this.simulateOffline = false;
    }
    this.currentPage = 1;
    this.loadData();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  removeToken(): void {
    localStorage.removeItem('agenda_medica_token');
    this.isAuthError = true;
    this.loadData();
  }
}
