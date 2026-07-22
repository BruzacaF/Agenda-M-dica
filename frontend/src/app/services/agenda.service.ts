import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { Agendamento, PaginatedAgendamentoResponse } from '../models/agendamento.model';

export interface AgendaFilters {
  paciente?: string;
  cpf?: string;
  medico?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  private mockApiUrl = 'http://localhost:5001/api/agendamentos';

  constructor(private http: HttpClient) {}

  getAgendamentos(
    page: number = 1,
    limit: number = 10,
    filters: AgendaFilters = {},
    fail: boolean = false,
    empty: boolean = false
  ): Observable<PaginatedAgendamentoResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters.paciente && filters.paciente.trim()) {
      params = params.set('paciente', filters.paciente.trim());
    }

    if (filters.cpf && filters.cpf.trim()) {
      params = params.set('cpf', filters.cpf.trim());
    }

    if (filters.medico && filters.medico.trim()) {
      params = params.set('medico', filters.medico.trim());
    }

    if (fail) params = params.set('fail', 'true');
    if (empty) params = params.set('empty', 'true');

    return this.http.get<PaginatedAgendamentoResponse>(this.mockApiUrl, { params }).pipe(
      timeout(10000), // 10s timeout
      map((res) => ({
        ...res,
        data: this.sanitizeAgendamentos(res.data)
      })),
      catchError(this.handleError)
    );
  }

  private sanitizeAgendamentos(agendamentos: Agendamento[]): Agendamento[] {
    if (!Array.isArray(agendamentos)) return [];
    return agendamentos.map((item, index) => ({
      id: item.id || index + 1,
      paciente: item.paciente || 'Paciente Não Identificado',
      cpf: item.cpf || '---',
      medico: item.medico || 'Médico Não Informado',
      especialidade: item.especialidade || 'Geral',
      data: item.data || '----/--/--',
      horario: item.horario || '--:--',
      convenio: item.convenio || 'Particular',
      status: item.status || 'Pendente'
    }));
  }

  private handleError(error: HttpErrorResponse | any) {
    let errorMessage = 'Não foi possível carregar os agendamentos.';
    if (error.name === 'TimeoutError') {
      errorMessage = 'Tempo de resposta da API de agendamentos excedido (Timeout).';
    } else if (error.status === 0) {
      errorMessage = 'Servidor da Mock API indisponível (Conexão Recusada).';
    } else if (error.error && typeof error.error === 'object' && error.error.error) {
      errorMessage = error.error.error;
    } else if (error.status === 500) {
      errorMessage = 'Erro interno simulado no servidor da Mock API (HTTP 500).';
    }
    return throwError(() => new Error(errorMessage));
  }
}
