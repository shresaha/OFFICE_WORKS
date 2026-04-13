import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },

  { path: '', pathMatch: 'full', redirectTo: 'signup' },
  { path: '**', redirectTo: 'signup' }
];
