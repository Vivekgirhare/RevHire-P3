import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Job } from '../../models/models';

@Component({
  selector: 'app-job-list',
  template: `
    <div class="page-container">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <h1>Find Your Dream Job</h1>
          <p>Discover thousands of opportunities from top companies</p>
          <div class="hero-search" [formGroup]="searchForm">
            <input formControlName="title" type="text" placeholder="Job title, skills, or company..." class="hero-input">
            <input formControlName="location" type="text" placeholder="Location..." class="hero-input hero-input-loc">
            <button (click)="search()" class="hero-btn">🔍 Search Jobs</button>
          </div>
        </div>
      </div>

      <div class="main-layout">
        <!-- Filters Sidebar -->
        <aside class="filters-panel" [formGroup]="searchForm">
          <div class="filter-header">
            <h3>Filters</h3>
            <button (click)="clearFilters()" class="clear-btn">Clear All</button>
          </div>

          <div class="filter-group">
            <label>Job Type</label>
            <select formControlName="jobType" class="filter-select">
              <option value="">All Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Max Experience (Years)</label>
            <input formControlName="maxExperience" type="number" placeholder="e.g. 5" class="filter-input">
          </div>

          <div class="filter-group">
            <label>Company Name</label>
            <input formControlName="companyName" type="text" placeholder="Company name" class="filter-input">
          </div>

          <button (click)="search()" class="apply-filters-btn">Apply Filters</button>
        </aside>

        <!-- Jobs List -->
        <div class="jobs-main">
          <div class="results-bar">
            <span class="results-count">{{jobs.length}} jobs found</span>
            <div class="sort-options">
              <span>Sort by: </span>
              <select class="sort-select" (change)="sortJobs($event)">
                <option value="newest">Newest First</option>
                <option value="relevant">Most Relevant</option>
              </select>
            </div>
          </div>

          <div *ngIf="loading" class="loading-state">
            <div class="spinner-large"></div>
            <p>Finding jobs for you...</p>
          </div>

          <div *ngIf="!loading && jobs.length === 0" class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>No jobs found</h3>
            <p>Try adjusting your search filters</p>
          </div>

          <div class="job-cards">
            <div *ngFor="let job of jobs" class="job-card" (click)="viewJob(job.id)">
              <div class="job-card-header">
                <div class="company-avatar">{{job.companyName?.charAt(0) || 'C'}}</div>
                <div class="job-title-section">
                  <h3 class="job-title">{{job.title}}</h3>
                  <span class="company-name">{{job.companyName}}</span>
                </div>
                <div class="job-actions" (click)="$event.stopPropagation()">
                  <button *ngIf="isSeeker" (click)="toggleSave(job)" class="save-btn"
                          [class.saved]="job.saved">
                    {{job.saved ? '❤️' : '🤍'}}
                  </button>
                </div>
              </div>

              <div class="job-meta">
                <span class="meta-item">📍 {{job.location || 'Remote'}}</span>
                <span class="meta-item">💼 {{formatJobType(job.jobType)}}</span>
                <span *ngIf="job.minExperienceYears !== null" class="meta-item">
                  📅 {{job.minExperienceYears}}-{{job.maxExperienceYears}} yrs
                </span>
                <span *ngIf="job.minSalary" class="meta-item">
                  💰 ₹{{job.minSalary | number}}-{{job.maxSalary | number}}
                </span>
              </div>

              <p class="job-desc">{{job.description | slice:0:120}}...</p>

              <div class="job-skills" *ngIf="job.requiredSkills">
                <span *ngFor="let skill of getSkills(job.requiredSkills)" class="skill-chip">{{skill}}</span>
              </div>

              <div class="job-card-footer">
                <span class="posted-time">{{getTimeAgo(job.postedAt)}}</span>
                <div class="card-actions">
                  <span *ngIf="job.alreadyApplied" class="applied-badge">✓ Applied</span>
                  <button *ngIf="isSeeker && !job.alreadyApplied" (click)="$event.stopPropagation(); applyJob(job)" class="quick-apply-btn">
                    Quick Apply
                  </button>
                  <button class="view-btn">View →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { min-height: 100vh; background: var(--bg-secondary); }
    .hero-section {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 60%, #06b6d4 100%);
      padding: 60px 24px;
      text-align: center;
      color: white;
    }
    .hero-content { max-width: 800px; margin: 0 auto; }
    .hero-content h1 { font-size: 42px; font-weight: 800; margin-bottom: 12px; }
    .hero-content p { font-size: 18px; opacity: 0.85; margin-bottom: 32px; }
    .hero-search {
      display: flex;
      gap: 10px;
      background: white;
      padding: 10px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .hero-input {
      flex: 1;
      border: none;
      padding: 12px 16px;
      font-size: 15px;
      color: #1e293b;
      background: transparent;
      outline: none;
    }
    .hero-input-loc { border-left: 1px solid #e2e8f0; }
    .hero-btn {
      padding: 12px 24px;
      background: linear-gradient(135deg, #1e40af, #3b82f6);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
    }
    .main-layout {
      display: flex;
      gap: 24px;
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px;
    }
    .filters-panel {
      width: 260px;
      flex-shrink: 0;
      background: var(--bg-primary);
      border-radius: 16px;
      padding: 20px;
      height: fit-content;
      position: sticky;
      top: 80px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }
    .filter-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .filter-header h3 { font-size: 16px; font-weight: 700; color: var(--text-primary); }
    .clear-btn { background: none; border: none; color: var(--accent-primary); font-size: 12px; font-weight: 600; cursor: pointer; }
    .filter-group { margin-bottom: 18px; }
    .filter-group label { display: block; font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .filter-select, .filter-input {
      width: 100%;
      padding: 9px 12px;
      border: 1.5px solid var(--border-color);
      border-radius: 9px;
      font-size: 13px;
      color: var(--text-primary);
      background: var(--bg-secondary);
      box-sizing: border-box;
    }
    .filter-select:focus, .filter-input:focus { border-color: var(--accent-primary); outline: none; }
    .apply-filters-btn {
      width: 100%;
      padding: 10px;
      background: var(--accent-primary);
      color: white;
      border: none;
      border-radius: 9px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 8px;
    }
    .jobs-main { flex: 1; min-width: 0; }
    .results-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .results-count { font-size: 15px; color: var(--text-secondary); font-weight: 500; }
    .sort-select {
      padding: 6px 12px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 13px;
      background: var(--bg-primary);
      color: var(--text-primary);
    }
    .loading-state, .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: var(--text-secondary);
    }
    .spinner-large {
      width: 48px; height: 48px;
      border: 4px solid var(--border-color);
      border-top-color: var(--accent-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .job-cards { display: flex; flex-direction: column; gap: 16px; }
    .job-card {
      background: var(--bg-primary);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: var(--shadow-sm);
    }
    .job-card:hover { box-shadow: 0 8px 30px rgba(59,130,246,0.12); border-color: var(--accent-primary); transform: translateY(-2px); }
    .job-card-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
    .company-avatar {
      width: 48px; height: 48px;
      background: linear-gradient(135deg, #1e40af, #3b82f6);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; font-weight: 800; color: white;
      flex-shrink: 0;
    }
    .job-title-section { flex: 1; }
    .job-title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
    .company-name { font-size: 13px; color: var(--text-secondary); font-weight: 500; }
    .save-btn { background: none; border: none; font-size: 22px; cursor: pointer; padding: 4px; }
    .job-meta { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
    .meta-item { font-size: 13px; color: var(--text-secondary); }
    .job-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 14px; }
    .job-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
    .skill-chip {
      padding: 4px 10px;
      background: #eff6ff;
      color: #1e40af;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }
    .job-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid var(--border-color);
    }
    .posted-time { font-size: 12px; color: var(--text-tertiary); }
    .card-actions { display: flex; gap: 8px; align-items: center; }
    .applied-badge {
      padding: 6px 12px;
      background: #dcfce7;
      color: #16a34a;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
    }
    .quick-apply-btn {
      padding: 7px 14px;
      background: var(--accent-primary);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    .view-btn {
      padding: 7px 14px;
      border: 1.5px solid var(--border-color);
      background: transparent;
      color: var(--text-primary);
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    @media (max-width: 768px) {
      .main-layout { flex-direction: column; padding: 16px; }
      .filters-panel { width: 100%; position: static; }
      .hero-search { flex-direction: column; }
      .hero-input-loc { border-left: none; border-top: 1px solid #e2e8f0; }
    }
  `]
})
export class JobListComponent implements OnInit {
  searchForm: FormGroup;
  jobs: Job[] = [];
  loading = false;
  isSeeker = false;

  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private authService: AuthService,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      title: [''],
      location: [''],
      jobType: [''],
      maxExperience: [''],
      companyName: ['']
    });
  }

  ngOnInit() {
    this.isSeeker = this.authService.currentUser?.role === 'JOB_SEEKER';
    this.search();
  }

  search() {
    this.loading = true;
    const params = this.searchForm.value;
    this.jobService.searchJobs(params).subscribe({
      next: (jobs) => { this.jobs = jobs; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  clearFilters() {
    this.searchForm.reset();
    this.search();
  }

  sortJobs(event: any) {
    const val = (event.target as HTMLSelectElement).value;
    if (val === 'newest') {
      this.jobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    }
  }

  viewJob(id: number) {
    this.router.navigate(['/jobs', id]);
  }

  toggleSave(job: Job) {
    if (!this.authService.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    if (job.saved) {
      this.jobService.unsaveJob(job.id).subscribe(() => job.saved = false);
    } else {
      this.jobService.saveJob(job.id, job).subscribe(() => job.saved = true);
    }
  }

  applyJob(job: Job) {
    if (!this.authService.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/jobs', job.id]);
  }

  formatJobType(type: string): string {
    return type ? type.replace('_', ' ') : '';
  }

  getSkills(skills: string): string[] {
    return skills ? skills.split(',').slice(0, 4).map(s => s.trim()) : [];
  }

  getTimeAgo(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
    return `${Math.floor(diff / 30)} months ago`;
  }
}
