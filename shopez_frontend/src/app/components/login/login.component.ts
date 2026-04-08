import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form: any = {
    username: '',
    password: ''
  };

  submitted = false;
  loading = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastService
  ) {}

  login() {
    this.submitted = true;

    if (!this.form.username || !this.form.password) {
      this.toast.error('Please enter username and password');
      return;
    }

    this.loading = true;

    this.api.login(this.form).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (!res || res.success === false || !res.token) {
          this.toast.error(res?.message || 'Invalid username or password');
          return;
        }

        localStorage.clear(); // ✅ CLEAR OLD DATA FIRST

        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res));
        localStorage.setItem('userId', res.id); // ✅ ADD THIS
        localStorage.setItem('role', res.role); // ✅ ADD THIS

        this.toast.success('Login successful');

        if (res.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/user']);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.toast.error(err?.error?.message || 'Login failed');
      }
    });
  }
}
