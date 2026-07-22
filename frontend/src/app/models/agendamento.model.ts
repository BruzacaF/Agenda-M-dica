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
