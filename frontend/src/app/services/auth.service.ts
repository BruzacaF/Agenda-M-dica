import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoginResponse, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';
  private TOKEN_KEY = 'agenda_medica_token';
  private USER_KEY = 'agenda_medica_user';

  constructor(private http: HttpClient) {}

  login(
    email: string, 
    senha: string, 
    fail: boolean = false, 
    offline: boolean = false
  ): Observable<LoginResponse> {
    let targetUrl = offline ? 'http://localhost:5999/api/login' : `${this.apiUrl}/login`;
    if (fail) {
      targetUrl += '?fail=true';
    }

    return this.http.post<LoginResponse>(targetUrl, { email, senha, fail }).pipe(
      tap((res) => {
        if (res.token) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu uma falha ao tentar realizar o login. Por favor, tente novamente.';

    if (error.status === 0) {
      errorMessage = 'Não foi possível conectar ao servidor. Por favor, verifique sua conexão com a internet ou tente novamente em alguns instantes.';
    } else if (error.status === 401) {
      errorMessage = 'E-mail ou senha incorretos. Por favor, verifique suas credenciais e tente novamente.';
    } else if (error.status === 500) {
      errorMessage = 'O serviço de autenticação encontrou uma instabilidade temporária. Por favor, tente novamente em alguns instantes.';
    } else if (error.error && typeof error.error === 'object' && error.error.error) {
      errorMessage = error.error.error;
    }

    return throwError(() => new Error(errorMessage));
  }
}
