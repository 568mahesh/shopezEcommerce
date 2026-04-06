import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgotpassword',
  imports: [FormsModule,CommonModule],
  templateUrl: './forgotpassword.component.html',
  styleUrl: './forgotpassword.component.css'
})
export class ForgotpasswordComponent {

  // 'emailStep' is the initial view. 'resetStep' is the "reloaded" view with password fields.
  step: 'emailStep' | 'resetStep' = 'emailStep';
  loading = false;
  resetSubmitted = false;

  resetForm = {
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private api: ApiService, 
    private router: Router, 
    private toast: ToastService
  ) {}

  // --- STEP 1: GENERATE OTP ---
  generateOtp() {
    if (!this.resetForm.email) {
      this.toast.error("Please enter your registered email");
      return;
    }

    this.loading = true;
    // Calls your backend @PostMapping("/auth/forgot-password")
    this.api.forgotPasswordByEmail(this.resetForm.email).subscribe({
      next: (res: any) => {
        this.loading = false;
        // Requirement: Show popup on success
        alert("OTP has been sent successfully to your registered email.");
        
        // Requirement: Switch to reset fields (refresh/reload effect)
        this.step = 'resetStep';
      },
      error: (err) => {
        this.loading = false;
        // Requirement: Handle invalid email
        this.toast.error(err?.error?.message || "Email not found. Please register first.");
      }
    });
  }

  // --- STEP 2: VALIDATE OTP & UPDATE PASSWORD ---
  updatePassword() {
    this.resetSubmitted = true;

    // Client-side cross-check for passwords
    if (this.resetForm.newPassword !== this.resetForm.confirmPassword) {
      return; 
    }

    if (!this.resetForm.otp || !this.resetForm.newPassword) {
      this.toast.error("Please fill all fields");
      return;
    }

    this.loading = true;
    // Calls your backend @PostMapping("/auth/reset-password")
    this.api.verifyAndResetPassword(this.resetForm).subscribe({
      next: (res: any) => {
        this.loading = false;
        alert("Password updated successfully!");
        // Requirement: Return to login page
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err?.error?.message || "Invalid OTP. Please check your email.");
      }
    });
  }
}