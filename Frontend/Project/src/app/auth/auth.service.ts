import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { catchError, throwError } from 'rxjs';

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  signup(payload: SignupPayload) {
    return this.http
      .post(`${this.base}/auth/signup`, payload)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const detail =
            (err.error && (err.error.detail || err.error.message)) ||
            err.message ||
            'Something went wrong. Please try again.';
          return throwError(() => ({ status: err.status, message: detail }));
        })
      );
  }


  login(payload: LoginPayload) {
    return this.http.post<LoginResponse>(`${this.base}/auth/login`, payload).pipe(
      catchError((err: HttpErrorResponse) => {
        const detail =
          (err.error && (err.error.detail || err.error.message)) ||
          'Invalid email or password';
        return throwError(() => ({ status: err.status, message: detail }));
      })
    );
  }


  saveToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }


  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem('access_token');
  }


  isLoggedIn(): boolean {
    return !!this.getToken();
  }


  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  
  getCurrentUser() {
    return this.http.get(`${this.base}/auth/me`);
  }
}