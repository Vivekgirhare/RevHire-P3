import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { JobService, ApplicationService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Job } from '../../models/models';

@Component({
  selector: 'app-job-detail',
  template: `
    <div class="page-wrapper">
      <div *ngIf="loading" class="loading-center">
        <div class="spinner-large"></div>
      </div>

      <div *ngIf="!loading && job" class="detail-container">
        <button class="back-btn" (click)="router.navigate(['/jobs'])">← Back to Jobs</button>

        <div class="detail-layout">
          <!-- Main Content -->
          <div class="detail-main">
            <div class="job-header-card">
              <div class="company-logo">{{job.companyName?.charAt(0) || 'C'}}</div>
              <div class="job-header-info">
                <h1>{{job.title}}</h1>
                <p class="company-link">{{job.companyName}}</p>
                <div class="job-tags">
                  <span class="tag">📍 {{job.location || 'Remote'}}</span>
                  <span class="tag">💼 {{formatJobType(job.jobType)}}</span>
                  <span *ngIf="job.minSalary" class="tag">💰 ₹{{job.minSalary | number}} - ₹{{job.maxSalary | number}}</span>
                  <span *ngIf="job.minExperienceYears !== null" class="tag">📅 {{job.minExperienceYears}}-{{job.maxExperienceYears}} Years</span>
                  <span *ngIf="job.numberOfOpenings" class="tag">🎯 {{job.numberOfOpenings}} Openings</span>
                </div>
              </div>
            </div>

            <div class="content-card">
              <h2>Job Description</h2>
              <div class="description-text" [innerHTML]="formatDescription(job.description)"></div>
            </div>

            <div class="content-card" *ngIf="job.requiredSkills">
              <h2>Required Skills</h2>
              <div class="skills-grid">
                <span *ngFor="let skill of getSkills(job.requiredSkills)" class="skill-tag">{{skill}}</span>
              </div>
            </div>

            <div class="content-card" *ngIf="job.requiredEducation">
              <h2>Education Requirements</h2>
              <p>{{job.requiredEducation}}</p>
            </div>

            <div class="content-card" *ngIf="job.applicationDeadline">
              <h2>Application Deadline</h2>
              <p class="deadline">📅 {{job.applicationDeadline | date:'MMMM dd, yyyy'}}</p>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="detail-sidebar">
            <div class="apply-card">
              <div *ngIf="!isSeeker && !isLoggedIn">
                <p class="apply-hint">Login as a job seeker to apply</p>
                <button class="btn-primary" (click)="router.navigate(['/login'])">Login to Apply</button>
              </div>

              <div *ngIf="isSeeker">
                <div *ngIf="job.alreadyApplied" class="applied-status">
                  <div class="applied-icon">✓</div>
                  <h3>Already Applied</h3>
                  <p>Your application has been submitted</p>
                  <button class="btn-outline" (click)="router.navigate(['/seeker/applications'])">View My Applications</button>
                </div>

                <div *ngIf="!job.alreadyApplied">
                  <h3>Apply for this role</h3>
                  <p class="apply-subtitle">Your profile will be shared with the employer</p>
                  <form [formGroup]="applyForm">
                    <div class="form-group">
                      <label>Cover Letter (optional)</label>
                      <textarea formControlName="coverLetter" rows="5" placeholder="Tell the employer why you're a great fit..." class="form-textarea"></textarea>
                    </div>
                    <div *ngIf="applyError" class="alert-error">{{applyError}}</div>
                    <div *ngIf="applySuccess" class="alert-success">{{applySuccess}}</div>
                    <button (click)="applyNow()" [disabled]="applyLoading" class="btn-primary">
                      <span *ngIf="applyLoading" class="spinner"></span>
                      {{applyLoading ? 'Submitting...' : 'Apply Now'}}
                    </button>
                  </form>
                </div>
              </div>

              <div class="save-section" *ngIf="isSeeker">
                <button (click)="toggleSave()" class="btn-save">
                  {{job.saved ? '❤️ Saved' : '🤍 Save Job'}}
                </button>
              </div>
            </div>

            <div class="company-card">
              <h3>About {{job.companyName}}</h3>
              <div class="company-info">
                <div class="info-row"><span>📍</span> {{job.companyLocation || job.location}}</div>
                <div class="info-row"><span>🏭</span> {{job.companyIndustry || 'Technology'}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper { min-height: 100vh; background: var(--bg-secondary); padding: 24px; }
    .loading-center { display: flex; justify-content: center; padding: 80px; }
    .spinner-large {
      width: 48px; height: 48px;
      border: 4px solid var(--border-color);
      border-top-color: var(--accent-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .back-btn {
      background: none; border: none; color: var(--accent-primary);
      font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 20px;
      padding: 0;
    }
    .detail-container { max-width: 1200px; margin: 0 auto; }
    .detail-layout { display: flex; gap: 24px; }
    .detail-main { flex: 1; display: flex; flex-direction: column; gap: 20px; }
    .detail-sidebar { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 20px; }
    .job-header-card {
      background: var(--bg-primary);
      border-radius: 16px;
      padding: 28px;
      display: flex;
      gap: 20px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }
    .company-logo {
      width: 72px; height: 72px;
      background: linear-gradient(135deg, #1e40af, #3b82f6);
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px; font-weight: 800; color: white; flex-shrink: 0;
    }
    .job-header-info h1 { font-size: 24px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px; }
    .company-link { font-size: 15px; color: var(--accent-primary); font-weight: 600; margin-bottom: 12px; }
    .job-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag {
      padding: 5px 12px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 13px;
      color: var(--text-secondary);
    }
    .content-card {
      background: var(--bg-primary);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }
    .content-card h2 { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 16px; }
    .description-text { font-size: 14px; color: var(--text-secondary); line-height: 1.8; white-space: pre-wrap; }
    .skills-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-tag {
      padding: 6px 14px;
      background: #eff6ff;
      color: #1e40af;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
    }
    .deadline { color: var(--text-secondary); font-size: 14px; }
    .apply-card {
      background: var(--bg-primary);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }
    .apply-card h3 { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 8px; }
    .apply-subtitle { font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; }
    .apply-hint { font-size: 14px; color: var(--text-secondary); margin-bottom: 16px; text-align: center; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; }
    .form-textarea {
      width: 100%;
      padding: 12px;
      border: 1.5px solid var(--border-color);
      border-radius: 10px;
      font-size: 13px;
      color: var(--text-primary);
      background: var(--bg-secondary);
      resize: vertical;
      box-sizing: border-box;
      font-family: inherit;
    }
    .form-textarea:focus { border-color: var(--accent-primary); outline: none; }
    .btn-primary {
      width: 100%;
      padding: 14px;
      background: var(--accent-primary);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-primary:hover:not(:disabled) { background: var(--accent-dark); }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .btn-outline {
      width: 100%;
      padding: 12px;
      background: transparent;
      color: var(--accent-primary);
      border: 2px solid var(--accent-primary);
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 12px;
    }
    .btn-save {
      width: 100%;
      padding: 10px;
      background: transparent;
      border: 1.5px solid var(--border-color);
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 10px;
      color: var(--text-primary);
    }
    .applied-status { text-align: center; padding: 10px 0; }
    .applied-icon {
      width: 56px; height: 56px;
      background: #dcfce7;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px;
      margin: 0 auto 12px;
      color: #16a34a;
    }
    .applied-status h3 { font-size: 18px; font-weight: 700; color: #16a34a; margin-bottom: 6px; }
    .applied-status p { font-size: 13px; color: var(--text-secondary); }
    .alert-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
      padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 12px;
    }
    .alert-success {
      background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a;
      padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 12px;
    }
    .company-card {
      background: var(--bg-primary);
      border-radius: 16px;
      padding: 20px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }
    .company-card h3 { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0 0 14px; }
    .info-row { display: flex; gap: 8px; font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; }
    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }
    .save-section { margin-top: 8px; }
    @media (max-width: 900px) {
      .detail-layout { flex-direction: column; }
      .detail-sidebar { width: 100%; }
    }
  `]
})
export class JobDetailComponent implements OnInit {
  job: Job | null = null;
  loading = true;
  isSeeker = false;
  isLoggedIn = false;
  applyForm: FormGroup;
  applyLoading = false;
  applyError = '';
  applySuccess = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private fb: FormBuilder,
    private jobService: JobService,
    private applicationService: ApplicationService,
    private authService: AuthService
  ) {
    this.applyForm = this.fb.group({ coverLetter: [''] });
  }

  ngOnInit() {
    this.isLoggedIn = !!this.authService.currentUser;
    this.isSeeker = this.authService.currentUser?.role === 'JOB_SEEKER';
    const id = Number(this.route.snapshot.params['id']);
    this.jobService.getJobById(id).subscribe({
      next: (job) => { this.job = job; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  applyNow() {
    if (!this.job) return;
    this.applyLoading = true;
    this.applyError = '';
    this.applicationService.apply(this.job.id, this.applyForm.value.coverLetter).subscribe({
      next: () => {
        this.applyLoading = false;
        this.applySuccess = 'Application submitted successfully!';
        if (this.job) this.job.alreadyApplied = true;
      },
      error: (err) => {
        this.applyLoading = false;
        this.applyError = err.error?.error || 'Failed to apply. Please try again.';
      }
    });
  }

  toggleSave() {
    if (!this.job) return;
    if (this.job.saved) {
      this.jobService.unsaveJob(this.job.id).subscribe(() => { if (this.job) this.job.saved = false; });
    } else {
      this.jobService.saveJob(this.job.id, this.job).subscribe(() => { if (this.job) this.job.saved = true; });
    }
  }

  formatDescription(desc: string): string {
    return desc ? desc.replace(/\n/g, '<br>') : '';
  }

  formatJobType(type: string): string {
    return type ? type.replace('_', ' ') : '';
  }

  getSkills(skills: string): string[] {
    return skills ? skills.split(',').map(s => s.trim()) : [];
  }
}
