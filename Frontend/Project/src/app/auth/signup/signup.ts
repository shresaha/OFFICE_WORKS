import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth.service';


@Component({
  standalone: true,
  selector: 'app-signup',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss'],
})


export class Signup {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  submitting = false;
  serverError: string | null = null;
  showPassword = false;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });


  get f() {
    return this.form.controls;
  }


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

    const { name, email, password } = this.form.getRawValue();
    

    this.auth.signup({ name, email, password }).subscribe({
      next: () => {
        this.auth.login({ email, password }).subscribe({
          next: (res) => {
            this.auth.saveToken(res.access_token);
            this.router.navigateByUrl('/dashboard');
          },
          error: () => {
            this.router.navigateByUrl('/login');
          },
        });
      },

      error: (err: { status?: number; message?: unknown }) => {
        this.submitting = false;

        if (err?.status === 409) {
          this.serverError = 'Email already exists';
        } else if (typeof err?.message === 'string') {
          this.serverError = err.message;
        } else {
          this.serverError = 'Please enter a valid email address.';
        }

        this.cdr.detectChanges();
      }
    });
  }
}
