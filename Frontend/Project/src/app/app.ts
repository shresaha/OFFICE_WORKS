import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})

export class App {
  private auth = inject(AuthService);
  private router = inject(Router);

  showConfirm = false;
  
  get isAuthRoute(): boolean {
  const url = this.router.url;
  return url.startsWith('/login') || url.startsWith('/signup');
}

  get showLogout(): boolean {
    const url = this.router.url;

    return (
      this.auth.isLoggedIn() &&
      !url.startsWith('/login') &&
      !url.startsWith('/signup')
    );
  }

  openLogoutModal() {
    this.showConfirm = true;
  }

  cancelLogout() {
    this.showConfirm = false;
  }

  confirmLogout() {
    this.showConfirm = false;
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
