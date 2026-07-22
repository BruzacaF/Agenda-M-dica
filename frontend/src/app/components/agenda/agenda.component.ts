import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
    BuscaPacienteComponent, 
    BuscaCpfComponent, 
    BuscaMedicoComponent
  ],
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
  
  // Modo de Busca: 'individual' (Abas) ou 'multi' (Agrupado)
  searchMode: 'individual' | 'multi' = 'individual';
  
  // Aba Ativa para Filtro Individual ('paciente' | 'cpf' | 'medico')
  activeSearchTab: 'paciente' | 'cpf' | 'medico' = 'paciente';
  
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

    this.agendaService.getAgendamentos(
      this.currentPage,
      this.pageSize,
      this.activeFilters,
      this.simulateFail,
      this.simulateEmpty
    ).subscribe({
      next: (res) => {
        this.loading = false;
        this.agendamentos = res.data;
        this.totalRecords = res.total;
        this.totalPages = res.total_pages;
        this.currentPage = res.page;
        this.initOrUpdateTable(res.data);
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
      setTimeout(() => this.tabulatorInstance?.redraw(true), 50);
      return;
    }

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
            if (!val || val === '----/--/--') return val || '';
            const parts = val.split('-');
            return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : val;
          }
        },
        { title: 'Horário', field: 'horario', width: 90, hozAlign: 'center', headerHozAlign: 'center' },
        { title: 'Paciente', field: 'paciente', minWidth: 160 },
        { title: 'CPF', field: 'cpf', width: 140, hozAlign: 'center', headerHozAlign: 'center' },
        { title: 'Médico', field: 'medico', minWidth: 160 },
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

  // Tratador para busca individual de cada um dos 3 componentes (Estrito por campo)
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

  // Executa o agrupamento de múltiplos filtros simultâneos (AND logic)
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

  selectSearchTab(tab: 'paciente' | 'cpf' | 'medico'): void {
    this.activeSearchTab = tab;
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
    if (this.simulateFail) this.simulateEmpty = false;
    this.currentPage = 1;
    this.loadData();
  }

  toggleSimulateEmpty(): void {
    this.simulateEmpty = !this.simulateEmpty;
    if (this.simulateEmpty) this.simulateFail = false;
    this.currentPage = 1;
    this.loadData();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
