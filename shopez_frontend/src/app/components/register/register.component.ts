import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  form: any = {
    fullname: '',
    username: '',
    password: '',
    role: 'USER',
    email: '',
    phone: ''
  };

  submitted = false;
  loading = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastService
  ) {}

  //  EMAIL VALIDATION
  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  //  PHONE VALIDATION (6-9 start + 10 digits)
  isValidPhone(phone: string): boolean {
    return /^[6-9][0-9]{9}$/.test(phone);
  }

  

  //  PREVENT PASTE INVALID TEXT
  onPaste(event: ClipboardEvent) {
    const pasted = event.clipboardData?.getData('text') || '';

    if (!/^[0-9]+$/.test(pasted)) {
      event.preventDefault();
    }
  }

showPassword = false;

togglePassword() {
  this.showPassword = !this.showPassword;
}

//  ALLOW ONLY NUMBERS WHILE TYPING
  
allowOnlyNumbers(event: any) {
  const charCode = event.which ? event.which : event.keyCode;

  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
}

// 6-digit validation
isValidPassword(): boolean {
  return /^[0-9]{6}$/.test(this.form.password);
}

  //  MAIN REGISTER METHOD
  register() {

    this.submitted = true;

    //  CHECK EMPTY FIELDS
    if (
      !this.form.fullname ||
      !this.form.username ||
      !this.form.password ||
      !this.form.role ||
      !this.form.email ||
      !this.form.phone
    ) {
      this.toast.error('Please fill all required fields');
      return;
    }

    //  EMAIL VALIDATION
    if (!this.isValidEmail(this.form.email)) {
      this.toast.error('Please enter a valid email');
      return;
    }

    //  PHONE VALIDATION (UPDATED MESSAGE)
    if (!this.isValidPhone(this.form.phone)) {
      this.toast.error('Enter valid phone number (start with 6-9 and 10 digits)');
      return;
    }
    //Password valid
    if (!this.form.password) {
      this.submitted = true;
      return;
    }
    
    if (!this.isValidPassword()) {
      this.toast.error('Password must be exactly 6 digits ❌');
      return;
    }

    //  CALL API
    this.loading = true;

    this.api.register(this.form).subscribe({

      next: (res: any) => {

        this.loading = false;

        if (res?.success === false) {
          this.toast.error(res?.message || 'Registration failed');
          return;
        }

        this.toast.success(res?.message || 'Registered successfully');

        //  REDIRECT
        this.router.navigate(['/login']);
      },

      error: (err) => {
        this.loading = false;
        console.error(err);
        this.toast.error(err?.error?.message || 'Registration failed');
      }
    });
  }
}