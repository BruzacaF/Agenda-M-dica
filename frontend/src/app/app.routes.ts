import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AgendaComponent } from './components/agenda/agenda.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'agenda', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'agenda', component: AgendaComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'agenda' }
];
