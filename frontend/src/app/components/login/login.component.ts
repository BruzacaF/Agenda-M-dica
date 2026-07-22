import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  returnUrl = '/agenda';
  hidePassword = true;

  // Sidebar / Painel de Opções de Inicialização (Ambiente de Teste)
  sidebarOpen = false;
  simulateFail = false;
  simulateOffline = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/agenda']);
      return;
    }

    this.loginForm = this.fb.group({
      email: ['admin@agendamedica.com.br', [Validators.required, Validators.email]],
      senha: ['AdminPassword123', [Validators.required, Validators.minLength(6)]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/agenda';
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleSimulateFail(): void {
    this.simulateFail = !this.simulateFail;
    if (this.simulateFail) {
      this.simulateOffline = false;
    }
  }

  toggleSimulateOffline(): void {
    this.simulateOffline = !this.simulateOffline;
    if (this.simulateOffline) {
      this.simulateFail = false;
    }
  }

  clearToken(): void {
    localStorage.removeItem('agenda_medica_token');
    localStorage.removeItem('agenda_medica_user');
    this.errorMessage = 'Token de sessão local removido com sucesso.';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, senha } = this.loginForm.value;

    this.authService.login(email, senha, this.simulateFail, this.simulateOffline).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Falha na autenticação. Tente novamente.';
      }
    });
  }
}
