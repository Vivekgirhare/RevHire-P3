import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../services/api.service';

@Component({
  selector: 'app-company-profile',
  template: `
    <div class="company-page">
      <div class="company-container">
        <div class="page-header">
          <h1>🏢 Company Profile</h1>
          <p>Keep your company information up to date to attract top talent</p>
        </div>

        <div class="company-layout">
          <div class="form-main">
            <div class="form-card">
              <h2>Company Information</h2>
              <form [formGroup]="companyForm" (ngSubmit)="save()">
                <div class="form-group">
                  <label>Company Name *</label>
                  <input formControlName="name" type="text" class="form-input" placeholder="Your company name">
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Industry</label>
                    <input formControlName="industry" type="text" class="form-input" placeholder="e.g. Information Technology">
                  </div>
                  <div class="form-group">
                    <label>Company Size</label>
                    <select formControlName="size" class="form-select">
                      <option value="">Select size</option>
                      <option value="STARTUP">Startup (1-10)</option>
                      <option value="SMALL">Small (11-50)</option>
                      <option value="MEDIUM">Medium (51-200)</option>
                      <option value="LARGE">Large (201-1000)</option>
                      <option value="ENTERPRISE">Enterprise (1000+)</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label>Location</label>
                  <input formControlName="location" type="text" class="form-input" placeholder="City, Country">
                </div>
                <div class="form-group">
                  <label>Website</label>
                  <input formControlName="website" type="url" class="form-input" placeholder="https://yourcompany.com">
                </div>
                <div class="form-group">
                  <label>Company Description</label>
                  <textarea formControlName="description" rows="5" class="form-textarea"
                    placeholder="Tell job seekers about your company, culture, and what makes you a great place to work..."></textarea>
                </div>

                <div *ngIf="saveSuccess" class="alert-success">✓ Company profile updated successfully!</div>
                <div *ngIf="saveError" class="alert-error">{{saveError}}</div>

                <button type="submit" class="btn-save" [disabled]="saving">
                  <span *ngIf="saving" class="spinner"></span>
                  {{saving ? 'Saving...' : '💾 Save Changes'}}
                </button>
              </form>
            </div>
          </div>

          <div class="company-sidebar">
            <div class="preview-card">
              <h3>Preview</h3>
              <div class="company-preview">
                <div class="preview-logo">{{companyForm.get('name')?.value?.charAt(0) || 'C'}}</div>
                <h4>{{companyForm.get('name')?.value || 'Company Name'}}</h4>
                <p class="preview-industry">{{companyForm.get('industry')?.value || 'Industry'}}</p>
                <div class="preview-meta">
                  <span *ngIf="companyForm.get('location')?.value">📍 {{companyForm.get('location')?.value}}</span>
                  <span *ngIf="companyForm.get('size')?.value">👥 {{formatSize(companyForm.get('size')?.value)}}</span>
                </div>
                <p *ngIf="companyForm.get('website')?.value" class="preview-website">
                  🌐 {{companyForm.get('website')?.value}}
                </p>
              </div>
            </div>

            <div class="tips-card">
              <h3>💡 Profile Tips</h3>
              <ul>
                <li>Add a detailed description to attract candidates</li>
                <li>Include your company website for credibility</li>
                <li>Specify company size to set expectations</li>
                <li>Keep location accurate for relevant applicants</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .company-page { min-height: 100vh; background: var(--bg-secondary); padding: 32px 24px; }
    .company-container { max-width: 1100px; margin: 0 auto; }
    .page-header { margin-bottom: 28px; }
    .page-header h1 { font-size: 28px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px; }
    .page-header p { color: var(--text-secondary); font-size: 15px; margin: 0; }
    .company-layout { display: grid; grid-template-columns: 1fr 300px; gap: 24px; }
    .form-main { }
    .company-sidebar { display: flex; flex-direction: column; gap: 20px; }
    .form-card, .preview-card, .tips-card {
      background: var(--bg-primary); border-radius: 16px; padding: 24px;
      border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);
    }
    .form-card h2 { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; }
    .form-input, .form-textarea, .form-select {
      width: 100%; padding: 11px 14px;
      border: 1.5px solid var(--border-color); border-radius: 10px;
      font-size: 14px; color: var(--text-primary); background: var(--bg-secondary); box-sizing: border-box;
    }
    .form-textarea { resize: vertical; font-family: inherit; }
    .form-input:focus, .form-textarea:focus, .form-select:focus { border-color: var(--accent-primary); outline: none; background: var(--bg-primary); }
    .btn-save {
      padding: 12px 28px; background: var(--accent-primary); color: white;
      border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; gap: 8px;
    }
    .btn-save:disabled { opacity: 0.7; cursor: not-allowed; }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
    .alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
    .preview-card h3, .tips-card h3 { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0 0 16px; }
    .company-preview { text-align: center; }
    .preview-logo {
      width: 64px; height: 64px; background: linear-gradient(135deg, #065f46, #10b981);
      border-radius: 16px; display: flex; align-items: center; justify-content: center;
      font-size: 26px; font-weight: 800; color: white; margin: 0 auto 12px;
    }
    .company-preview h4 { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
    .preview-industry { font-size: 13px; color: var(--text-secondary); margin: 0 0 10px; }
    .preview-meta { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; }
    .preview-website { font-size: 12px; color: var(--accent-primary); }
    .tips-card ul { padding-left: 18px; margin: 0; }
    .tips-card li { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; line-height: 1.5; }
    @media (max-width: 900px) { .company-layout { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class CompanyProfileComponent implements OnInit {
  companyForm: FormGroup;
  saving = false;
  saveSuccess = false;
  saveError = '';

  constructor(private fb: FormBuilder, private companyService: CompanyService) {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      industry: [''],
      size: [''],
      location: [''],
      website: [''],
      description: ['']
    });
  }

  ngOnInit() {
    this.companyService.getCompany().subscribe(c => {
      if (c) this.companyForm.patchValue(c);
    });
  }

  save() {
    if (this.companyForm.invalid) return;
    this.saving = true;
    this.saveError = '';
    this.companyService.updateCompany(this.companyForm.value).subscribe({
      next: () => { this.saving = false; this.saveSuccess = true; setTimeout(() => this.saveSuccess = false, 3000); },
      error: (err) => { this.saving = false; this.saveError = err.error?.error || 'Failed to save.'; }
    });
  }

  formatSize(size: string): string {
    const sizes: Record<string, string> = {
      STARTUP: '1-10', SMALL: '11-50', MEDIUM: '51-200', LARGE: '201-1000', ENTERPRISE: '1000+'
    };
    return sizes[size] || size;
  }
}
