export interface Agendamento {
  id: number;
  paciente: string;
  cpf: string;
  medico: string;
  especialidade: string;
  data: string;
  horario: string;
  convenio: string;
  status: 'Confirmado' | 'Pendente' | 'Cancelado' | string;
}

export interface PaginatedAgendamentoResponse {
  data: Agendamento[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
