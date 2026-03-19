import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-page">
      <div class="auth-left">
        <div class="auth-brand">
          <div class="brand-logo">⚡ RevHire</div>
          <h2>Your next career move starts here</h2>
          <p>Connect with top companies and find your dream job today.</p>

        </div>
      </div>
      <div class="auth-right">
        <div class="auth-box">
          <div class="auth-header">
            <h1>Welcome back</h1>
            <p>Sign in to your account</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" formControlName="email" placeholder="you@example.com" class="form-input">
              <div *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.errors?.['required']"
                   class="field-error">Email is required</div>
            </div>

            <div class="form-group">
              <label>Password</label>
              <div class="input-with-toggle">
                <input [type]="showPassword ? 'text' : 'password'" formControlName="password"
                       placeholder="Enter your password" class="form-input">
                <button type="button" class="toggle-pw" (click)="showPassword=!showPassword">
                  {{showPassword ? '🙈' : '👁️'}}
                </button>
              </div>
            </div>

            <div *ngIf="error" class="alert-error">{{error}}</div>

            <button type="submit" class="btn-submit" [disabled]="loading">
              <span *ngIf="loading" class="spinner"></span>
              {{loading ? 'Signing in...' : 'Sign In'}}
            </button>
          </form>

          <div class="auth-footer">
            <p>Don't have an account? <a routerLink="/register" class="link">Create one</a></p>

      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
    }
    .auth-left {
      flex: 1;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
      color: white;
    }
    .auth-brand { max-width: 400px; }
    .brand-logo { font-size: 28px; font-weight: 800; margin-bottom: 32px; }
    .auth-left h2 { font-size: 36px; font-weight: 800; line-height: 1.2; margin-bottom: 16px; }
    .auth-left p { font-size: 16px; opacity: 0.85; margin-bottom: 40px; }
    .stats-row { display: flex; gap: 32px; }
    .stat { display: flex; flex-direction: column; }
    .stat strong { font-size: 28px; font-weight: 800; }
    .stat span { font-size: 13px; opacity: 0.7; margin-top: 2px; }
    .auth-right {
      width: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background: var(--bg-primary);
    }
    .auth-box { width: 100%; max-width: 380px; }
    .auth-header { margin-bottom: 32px; }
    .auth-header h1 { font-size: 28px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; }
    .auth-header p { color: var(--text-secondary); font-size: 15px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-weight: 600; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; }
    .form-input {
      width: 100%;
      padding: 12px 14px;
      border: 1.5px solid var(--border-color);
      border-radius: 10px;
      font-size: 14px;
      color: var(--text-primary);
      background: var(--bg-primary);
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .form-input:focus { border-color: var(--accent-primary); outline: none; }
    .input-with-toggle { position: relative; }
    .input-with-toggle .form-input { padding-right: 48px; }
    .toggle-pw {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
    }
    .field-error { color: #ef4444; font-size: 12px; margin-top: 4px; }
    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 14px;
      margin-bottom: 16px;
    }
    .btn-submit {
      width: 100%;
      padding: 14px;
      background: var(--accent-primary);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 0.2s;
    }
    .btn-submit:hover:not(:disabled) { background: var(--accent-dark); }
    .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .auth-footer { text-align: center; margin-top: 20px; font-size: 14px; color: var(--text-secondary); }
    .link { color: var(--accent-primary); text-decoration: none; font-weight: 600; }
    .demo-logins {
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
    }
    .demo-title { font-size: 12px; color: var(--text-tertiary); text-align: center; margin-bottom: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .demo-btns { display: flex; gap: 8px; }
    .demo-btn {
      flex: 1;
      padding: 10px;
      border: 1.5px solid var(--border-color);
      border-radius: 9px;
      background: var(--bg-secondary);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      color: var(--text-primary);
      transition: all 0.2s;
    }
    .demo-btn:hover { border-color: var(--accent-primary); background: var(--bg-primary); }
    @media (max-width: 768px) {
      .auth-left { display: none; }
      .auth-right { width: 100%; }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  fillDemo(role: string) {
    if (role === 'seeker') {
      this.loginForm.patchValue({ email: 'seeker@demo.com', password: 'demo1234' });
    } else {
      this.loginForm.patchValue({ email: 'employer@demo.com', password: 'demo1234' });
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    this.authService.login(this.loginForm.value).subscribe({
      next: (user) => {
        this.loading = false;
        if (user.role === 'JOB_SEEKER') {
          this.router.navigate(['/seeker/dashboard']);
        } else {
          this.router.navigate(['/employer/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Login failed. Please try again.';
      }
    });
  }
}
