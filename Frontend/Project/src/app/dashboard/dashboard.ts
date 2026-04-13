import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { map, catchError, of } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})

export class Dashboard {
  private auth = inject(AuthService);
  private router = inject(Router);

  user$ = this.auth.getCurrentUser().pipe(
    map((user: any) => {
      const fullName = user.name?.trim() || '';
      return fullName.split(' ')[0];
    }),
    catchError(() => of(null))
  );

  showConfirm = false;

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