import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  submitting = false;
  serverError: string | null = null;
  showPassword = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  submit() {
    this.serverError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const { email, password } = this.form.getRawValue();

    this.auth.login({ email, password } as any).subscribe({
      next: (res) => {
        this.submitting = false;
        this.auth.saveToken(res.access_token);
        this.router.navigateByUrl('/dashboard');
      },
      error: (err: { status?: number; message?: unknown }) => {
        this.submitting = false;
        if (err?.status === 401 || err?.status === 400) {
          this.serverError = 'Invalid email or password';
        } else if (typeof err?.message === 'string') {
          this.serverError = err.message;
        } else {
          this.serverError = 'Invalid email or password.';
        }
        this.cdr.detectChanges();
      }

    });
  }
}
