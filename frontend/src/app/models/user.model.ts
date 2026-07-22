export interface User {
  id?: number;
  nome: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

export interface ApiError {
  error: string;
}
