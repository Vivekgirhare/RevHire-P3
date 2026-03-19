import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-page">
      <div class="auth-left">
        <div class="auth-brand">
          <div class="brand-logo">⚡ RevHire</div>
          <h2>Start your journey with RevHire</h2>
        </div>
      </div>
      <div class="auth-right">
        <div class="auth-box">
          <div class="auth-header">
            <h1>Create Account</h1>
            <p>Join RevHire and find your next opportunity</p>
          </div>

          <!-- Role Selection -->
          <div class="role-tabs">
            <button class="role-tab" [class.active]="selectedRole === 'JOB_SEEKER'"
                    (click)="setRole('JOB_SEEKER')">
              <span>👤</span> Job Seeker
            </button>
            <button class="role-tab" [class.active]="selectedRole === 'EMPLOYER'"
                    (click)="setRole('EMPLOYER')">
              <span>🏢</span> Employer
            </button>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <!-- Common Fields -->
            <div class="form-row">
              <div class="form-group">
                <label>Full Name *</label>
                <input type="text" formControlName="name" placeholder="Your full name" class="form-input">
                <div *ngIf="f['name'].touched && f['name'].errors?.['required']" class="field-error">Required</div>
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input type="email" formControlName="email" placeholder="you@example.com" class="form-input">
                <div *ngIf="f['email'].touched && f['email'].errors" class="field-error">Valid email required</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Password *</label>
                <input type="password" formControlName="password" placeholder="Min 6 characters" class="form-input">
                <div *ngIf="f['password'].touched && f['password'].errors?.['minlength']" class="field-error">Min 6 characters</div>
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input type="tel" formControlName="phone" placeholder="+91 99999 99999" class="form-input">
              </div>
            </div>

            <div class="form-group">
              <label>Location</label>
              <input type="text" formControlName="location" placeholder="City, State" class="form-input">
            </div>

            <!-- Job Seeker Fields -->
            <ng-container *ngIf="selectedRole === 'JOB_SEEKER'">
              <div class="form-group">
                <label>Current Employment Status</label>
                <select formControlName="employmentStatus" class="form-input">
                  <option value="">Select status</option>
                  <option value="EMPLOYED">Employed</option>
                  <option value="UNEMPLOYED">Unemployed</option>
                  <option value="STUDENT">Student</option>
                  <option value="FREELANCER">Freelancer</option>
                </select>
              </div>
            </ng-container>

            <!-- Employer Fields -->
            <ng-container *ngIf="selectedRole === 'EMPLOYER'">
              <div class="form-row">
                <div class="form-group">
                  <label>Company Name *</label>
                  <input type="text" formControlName="companyName" placeholder="Company name" class="form-input">
                </div>
                <div class="form-group">
                  <label>Industry</label>
                  <input type="text" formControlName="industry" placeholder="e.g. Technology" class="form-input">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Company Size</label>
                  <select formControlName="companySize" class="form-input">
                    <option value="">Select size</option>
                    <option value="STARTUP">Startup (1-10)</option>
                    <option value="SMALL">Small (11-50)</option>
                    <option value="MEDIUM">Medium (51-200)</option>
                    <option value="LARGE">Large (201-1000)</option>
                    <option value="ENTERPRISE">Enterprise (1000+)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Website</label>
                  <input type="url" formControlName="website" placeholder="https://company.com" class="form-input">
                </div>
              </div>
              <div class="form-group">
                <label>Company Description</label>
                <textarea formControlName="companyDescription" placeholder="Tell candidates about your company"
                          class="form-input" rows="3"></textarea>
              </div>
            </ng-container>

            <div *ngIf="error" class="alert-error">{{error}}</div>

            <button type="submit" class="btn-submit" [disabled]="loading">
              <span *ngIf="loading" class="spinner"></span>
              {{loading ? 'Creating account...' : 'Create Account'}}
            </button>
          </form>

          <div class="auth-footer">
            <p>Already have an account? <a routerLink="/login" class="link">Sign in</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; }
    .auth-left {
      flex: 1;
      background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
      color: white;
    }
    .auth-brand { max-width: 400px; }
    .brand-logo { font-size: 28px; font-weight: 800; margin-bottom: 32px; }
    .auth-left h2 { font-size: 32px; font-weight: 800; line-height: 1.2; margin-bottom: 32px; }
    .feature-list { display: flex; flex-direction: column; gap: 14px; }
    .feature { font-size: 15px; opacity: 0.9; }
    .auth-right {
      width: 560px;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 40px;
      background: var(--bg-primary);
      overflow-y: auto;
    }
    .auth-box { width: 100%; max-width: 460px; }
    .auth-header { margin-bottom: 24px; }
    .auth-header h1 { font-size: 26px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; }
    .auth-header p { color: var(--text-secondary); font-size: 14px; }
    .role-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      background: var(--bg-secondary);
      border-radius: 12px;
      padding: 4px;
    }
    .role-tab {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
      background: transparent;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .role-tab.active {
      background: var(--bg-primary);
      color: var(--accent-primary);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .form-row { display: flex; gap: 14px; }
    .form-row .form-group { flex: 1; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-weight: 600; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px; }
    .form-input {
      width: 100%;
      padding: 11px 14px;
      border: 1.5px solid var(--border-color);
      border-radius: 10px;
      font-size: 14px;
      color: var(--text-primary);
      background: var(--bg-primary);
      transition: border-color 0.2s;
      box-sizing: border-box;
      resize: vertical;
    }
    .form-input:focus { border-color: var(--accent-primary); outline: none; }
    .field-error { color: #ef4444; font-size: 11px; margin-top: 4px; }
    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .btn-submit {
      width: 100%;
      padding: 13px;
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
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .auth-footer { text-align: center; margin-top: 16px; font-size: 14px; color: var(--text-secondary); }
    .link { color: var(--accent-primary); text-decoration: none; font-weight: 600; }
    @media (max-width: 768px) { .auth-left { display: none; } .auth-right { width: 100%; } .form-row { flex-direction: column; } }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';
  selectedRole = 'JOB_SEEKER';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: [''],
      location: [''],
      employmentStatus: [''],
      companyName: [''],
      industry: [''],
      companySize: [''],
      website: [''],
      companyDescription: ['']
    });
  }

  get f() { return this.registerForm.controls; }

setRole(role: string) {
  this.selectedRole = role;

  if (role === 'JOB_SEEKER') {
    // Clear employer fields
    this.registerForm.patchValue({
      companyName: '',
      industry: '',
      companySize: '',
      website: '',
      companyDescription: ''
    });
  }

  if (role === 'EMPLOYER') {
    // Clear job seeker field
    this.registerForm.patchValue({
      employmentStatus: ''
    });
  }
}
onSubmit() {
  if (this.registerForm.invalid) {
    this.registerForm.markAllAsTouched();
    return;
  }

  this.loading = true;
  this.error = '';

  const formValue = { ...this.registerForm.value };

  // Remove irrelevant fields before sending
  if (this.selectedRole === 'JOB_SEEKER') {
    delete formValue.companyName;
    delete formValue.industry;
    delete formValue.companySize;
    delete formValue.website;
    delete formValue.companyDescription;
  }

  if (this.selectedRole === 'EMPLOYER') {
    delete formValue.employmentStatus;
  }

  const data = { ...formValue, role: this.selectedRole };

  this.authService.register(data).subscribe({
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
      this.error = err.error?.error || 'Registration failed. Please try again.';
    }
  });
}
}
