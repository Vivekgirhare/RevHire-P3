import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { JobService } from '../../services/api.service';

@Component({
  selector: 'app-post-job',
  template: `
    <div class="post-page">
      <div class="post-container">
        <div class="page-header">
          <button class="back-btn" (click)="router.navigate(['/employer/jobs'])">← Back</button>
          <div>
            <h1>{{isEdit ? 'Edit Job' : 'Post a New Job'}}</h1>
            <p>{{isEdit ? 'Update your job posting' : 'Reach thousands of qualified candidates'}}</p>
          </div>
        </div>

        <div class="form-layout">
          <div class="main-form">
            <form [formGroup]="jobForm" (ngSubmit)="onSubmit()">
              <!-- Basic Info -->
              <div class="form-section">
                <h2>📋 Basic Information</h2>
                <div class="form-group">
                  <label>Job Title *</label>
                  <input formControlName="title" type="text" class="form-input" placeholder="e.g. Senior Software Engineer">
                  <div *ngIf="jobForm.get('title')?.touched && jobForm.get('title')?.errors?.['required']" class="field-error">Job title is required</div>
                </div>
                <div class="form-group">
                  <label>Job Description *</label>
                  <textarea formControlName="description" rows="8" class="form-textarea"
                    placeholder="Describe the role, responsibilities, and what you're looking for..."></textarea>
                  <div *ngIf="jobForm.get('description')?.touched && jobForm.get('description')?.errors?.['required']" class="field-error">Description is required</div>
                </div>
                <div class="form-group">
                  <label>Required Skills (comma separated)</label>
                  <input formControlName="requiredSkills" type="text" class="form-input"
                    placeholder="Java, Spring Boot, Angular, MySQL, REST API...">
                  <div class="skills-preview" *ngIf="jobForm.get('requiredSkills')?.value">
                    <span *ngFor="let s of getSkillsList()" class="skill-chip">{{s}}</span>
                  </div>
                </div>
              </div>

              <!-- Requirements -->
              <div class="form-section">
                <h2>🎯 Requirements</h2>
                <div class="form-row-3">
                  <div class="form-group">
                    <label>Min Experience (yrs)</label>
                    <input formControlName="minExperienceYears" type="number" class="form-input" placeholder="0">
                  </div>
                  <div class="form-group">
                    <label>Max Experience (yrs)</label>
                    <input formControlName="maxExperienceYears" type="number" class="form-input" placeholder="5">
                  </div>
                  <div class="form-group">
                    <label>Number of Openings</label>
                    <input formControlName="numberOfOpenings" type="number" class="form-input" placeholder="1">
                  </div>
                </div>
                <div class="form-group">
                  <label>Required Education</label>
                  <input formControlName="requiredEducation" type="text" class="form-input"
                    placeholder="e.g. B.Tech in Computer Science or equivalent">
                </div>
              </div>

              <!-- Location & Type -->
              <div class="form-section">
                <h2>📍 Location & Type</h2>
                <div class="form-row">
                  <div class="form-group">
                    <label>Location</label>
                    <input formControlName="location" type="text" class="form-input" placeholder="e.g. Bangalore, India">
                  </div>
                  <div class="form-group">
                    <label>Job Type *</label>
                    <select formControlName="jobType" class="form-select">
                      <option value="">Select type</option>
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="FREELANCE">Freelance</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>
                </div>
                <div class="form-group checkbox-group">
                  <label class="checkbox-label">
                    <input formControlName="isRemote" type="checkbox">
                    <span>Remote Work Available</span>
                  </label>
                </div>
              </div>

              <!-- Salary -->
              <div class="form-section">
                <h2>💰 Salary Range</h2>
                <div class="form-row">
                  <div class="form-group">
                    <label>Min Salary (₹ per year)</label>
                    <input formControlName="minSalary" type="number" class="form-input" placeholder="500000">
                  </div>
                  <div class="form-group">
                    <label>Max Salary (₹ per year)</label>
                    <input formControlName="maxSalary" type="number" class="form-input" placeholder="1000000">
                  </div>
                </div>
              </div>

              <!-- Deadline -->
              <div class="form-section">
                <h2>📅 Application Deadline</h2>
                <div class="form-group">
                  <label>Application Deadline</label>
                  <input formControlName="applicationDeadline" type="date" class="form-input">
                </div>
              </div>

              <div *ngIf="error" class="alert-error">{{error}}</div>
              <div *ngIf="success" class="alert-success">{{success}}</div>

              <div class="form-actions">
                <button type="button" class="btn-cancel" (click)="router.navigate(['/employer/jobs'])">Cancel</button>
                <button type="submit" class="btn-submit" [disabled]="loading">
                  <span *ngIf="loading" class="spinner"></span>
                  {{loading ? 'Saving...' : (isEdit ? 'Update Job' : 'Post Job')}}
                </button>
              </div>
            </form>
          </div>

          <div class="form-sidebar">
            <div class="tips-card">
              <h3>📝 Writing Tips</h3>
              <div class="tip-item">
                <div class="tip-num">1</div>
                <p>Use a clear, specific job title that candidates search for</p>
              </div>
              <div class="tip-item">
                <div class="tip-num">2</div>
                <p>List specific skills and technologies required</p>
              </div>
              <div class="tip-item">
                <div class="tip-num">3</div>
                <p>Include salary range to attract more applicants</p>
              </div>
              <div class="tip-item">
                <div class="tip-num">4</div>
                <p>Set a realistic application deadline</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .post-page { min-height: 100vh; background: var(--bg-secondary); padding: 32px 24px; }
    .post-container { max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 28px; }
    .back-btn { background: none; border: none; color: var(--accent-primary); font-size: 14px; font-weight: 600; cursor: pointer; padding: 0; margin-top: 4px; white-space: nowrap; }
    .page-header h1 { font-size: 28px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px; }
    .page-header p { color: var(--text-secondary); margin: 0; }
    .form-layout { display: grid; grid-template-columns: 1fr 280px; gap: 24px; }
    .main-form { display: flex; flex-direction: column; gap: 20px; }
    .form-section {
      background: var(--bg-primary); border-radius: 16px; padding: 24px;
      border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);
    }
    .form-section h2 { font-size: 17px; font-weight: 700; color: var(--text-primary); margin: 0 0 20px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.4px; }
    .form-input, .form-textarea, .form-select {
      width: 100%; padding: 11px 14px;
      border: 1.5px solid var(--border-color);
      border-radius: 10px; font-size: 14px;
      color: var(--text-primary); background: var(--bg-secondary);
      box-sizing: border-box;
    }
    .form-textarea { resize: vertical; font-family: inherit; min-height: 160px; }
    .form-input:focus, .form-textarea:focus, .form-select:focus { border-color: var(--accent-primary); outline: none; background: var(--bg-primary); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .skills-preview { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .skill-chip { padding: 4px 10px; background: #eff6ff; color: #1e40af; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .checkbox-group { display: flex; align-items: center; }
    .checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; color: var(--text-primary); font-weight: 500; }
    .checkbox-label input { width: 16px; height: 16px; cursor: pointer; }
    .field-error { color: #ef4444; font-size: 12px; margin-top: 4px; }
    .alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 12px 14px; border-radius: 10px; font-size: 14px; margin-bottom: 16px; }
    .alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; padding: 12px 14px; border-radius: 10px; font-size: 14px; margin-bottom: 16px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; padding-top: 8px; }
    .btn-cancel {
      padding: 12px 24px; background: var(--bg-secondary); color: var(--text-secondary);
      border: 1px solid var(--border-color); border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;
    }
    .btn-submit {
      padding: 12px 32px; background: var(--accent-primary); color: white;
      border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; gap: 8px;
    }
    .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.7s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .form-sidebar { position: sticky; top: 80px; height: fit-content; }
    .tips-card {
      background: var(--bg-primary); border-radius: 16px; padding: 24px;
      border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);
    }
    .tips-card h3 { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0 0 16px; }
    .tip-item { display: flex; gap: 12px; margin-bottom: 14px; align-items: flex-start; }
    .tip-num {
      width: 24px; height: 24px; background: var(--accent-primary); color: white;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 800; flex-shrink: 0;
    }
    .tip-item p { font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.5; }
    @media (max-width: 900px) { .form-layout { grid-template-columns: 1fr; } .form-row, .form-row-3 { grid-template-columns: 1fr; } }
  `]
})
export class PostJobComponent implements OnInit {
  jobForm: FormGroup;
  loading = false;
  error = '';
  success = '';
  isEdit = false;
  editJobId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      requiredSkills: [''],
      requiredEducation: [''],
      minExperienceYears: [0],
      maxExperienceYears: [null],
      location: [''],
      isRemote: [false],
      minSalary: [null],
      maxSalary: [null],
      jobType: ['FULL_TIME'],
      numberOfOpenings: [1],
      applicationDeadline: [null]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.editJobId = +id;
      this.jobService.getJobById(+id).subscribe(job => this.jobForm.patchValue(job));
    }
  }

  getSkillsList(): string[] {
    const skills = this.jobForm.get('requiredSkills')?.value || '';
    return skills.split(',').map((s: string) => s.trim()).filter((s: string) => s);
  }

  onSubmit() {
    if (this.jobForm.invalid) { this.jobForm.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    const data = this.jobForm.value;
    const obs = this.isEdit && this.editJobId
      ? this.jobService.updateJob(this.editJobId, data)
      : this.jobService.createJob(data);
    obs.subscribe({
      next: () => {
        this.loading = false;
        this.success = this.isEdit ? 'Job updated successfully!' : 'Job posted successfully!';
        setTimeout(() => this.router.navigate(['/employer/jobs']), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to save job posting.';
      }
    });
  }
}
