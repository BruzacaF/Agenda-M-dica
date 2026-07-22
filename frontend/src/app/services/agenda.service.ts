import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { Agendamento } from '../models/agendamento.model';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  private mockApiUrl = 'http://localhost:5001/api/agendamentos';

  constructor(private http: HttpClient) {}

  getAgendamentos(fail: boolean = false, empty: boolean = false): Observable<Agendamento[]> {
    let params = new HttpParams();
    if (fail) params = params.set('fail', 'true');
    if (empty) params = params.set('empty', 'true');

    return this.http.get<Agendamento[]>(this.mockApiUrl, { params }).pipe(
      timeout(10000), // 10s timeout
      map((agendamentos) => this.sanitizeAgendamentos(agendamentos)),
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
