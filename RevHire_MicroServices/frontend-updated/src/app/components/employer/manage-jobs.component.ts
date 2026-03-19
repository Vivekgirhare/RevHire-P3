import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JobService } from '../../services/api.service';

@Component({
  selector: 'app-manage-jobs',
  template: `
    <div class="manage-page">
      <div class="manage-container">
        <div class="page-header">
          <div>
            <h1>Manage Job Postings</h1>
            <p>View, edit, and manage all your job listings</p>
          </div>
          <button class="btn-post" (click)="router.navigate(['/employer/post-job'])">+ Post New Job</button>
        </div>

        <!-- Status Tabs -->
        <div class="status-tabs">
          <button *ngFor="let tab of tabs" class="tab" [class.active]="activeTab === tab.value"
                  (click)="activeTab = tab.value">
            {{tab.label}} <span class="count">{{getCount(tab.value)}}</span>
          </button>
        </div>

        <div *ngIf="loading" class="loading-state"><div class="spinner"></div></div>

        <div *ngIf="!loading && filteredJobs.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No jobs {{activeTab !== 'ALL' ? 'with status ' + activeTab : 'posted yet'}}</h3>
          <button class="btn-post" (click)="router.navigate(['/employer/post-job'])">Post Your First Job</button>
        </div>

        <div class="jobs-list">
          <div *ngFor="let job of filteredJobs" class="job-card">
            <div class="job-card-main">
              <div class="job-header">
                <div>
                  <h3>{{job.title}}</h3>
                  <div class="job-meta">
                    <span>📍 {{job.location || 'Remote'}}</span>
                    <span>💼 {{formatType(job.jobType)}}</span>
                    <span *ngIf="job.minSalary">💰 ₹{{job.minSalary | number}}-{{job.maxSalary | number}}</span>
                    <span>🎯 {{job.numberOfOpenings || 1}} opening(s)</span>
                    <span>📅 Posted {{getTimeAgo(job.postedAt)}}</span>
                  </div>
                </div>
                <span class="status-badge" [class]="'status-' + job.status?.toLowerCase()">{{job.status}}</span>
              </div>

              <p class="job-desc">{{job.description | slice:0:160}}...</p>

              <div *ngIf="job.requiredSkills" class="skills-row">
                <span *ngFor="let s of getSkills(job.requiredSkills)" class="skill-chip">{{s}}</span>
              </div>
            </div>

            <div class="job-actions">
              <button class="btn-applicants" (click)="router.navigate(['/employer/jobs', job.id, 'applicants'])">
                👥 View Applicants
              </button>
              <button class="btn-edit" (click)="router.navigate(['/employer/post-job'], {queryParams: {edit: job.id}})">✏️ Edit</button>

              <div class="status-actions">
                <button *ngIf="job.status === 'ACTIVE'" class="btn-status-close" (click)="updateStatus(job, 'CLOSED')">Close</button>
                <button *ngIf="job.status === 'CLOSED'" class="btn-status-open" (click)="updateStatus(job, 'ACTIVE')">Reopen</button>
                <button *ngIf="job.status === 'ACTIVE'" class="btn-status-fill" (click)="updateStatus(job, 'FILLED')">Mark Filled</button>
              </div>

              <button class="btn-delete" (click)="confirmDelete(job)">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirm modal -->
    <div *ngIf="deleteJob" class="modal-overlay" (click)="deleteJob=null">
      <div class="modal" (click)="$event.stopPropagation()">
        <h3>Delete Job Posting?</h3>
        <p>This will permanently delete "<strong>{{deleteJob.title}}</strong>" and all associated applications.</p>
        <div class="modal-actions">
          <button class="btn-cancel" (click)="deleteJob=null">Cancel</button>
          <button class="btn-confirm-delete" (click)="doDelete()">Delete</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .manage-page { min-height: 100vh; background: var(--bg-secondary); padding: 32px 24px; }
    .manage-container { max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { font-size: 28px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px; }
    .page-header p { color: var(--text-secondary); margin: 0; }
    .btn-post { padding: 11px 22px; background: var(--accent-primary); color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 14px; }
    .status-tabs { display: flex; gap: 6px; margin-bottom: 24px; flex-wrap: wrap; }
    .tab {
      padding: 8px 16px; border: 1.5px solid var(--border-color); background: var(--bg-primary);
      border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; color: var(--text-secondary);
      display: flex; align-items: center; gap: 6px; transition: all 0.2s;
    }
    .tab.active { background: var(--accent-primary); color: white; border-color: var(--accent-primary); }
    .count { background: rgba(255,255,255,0.25); padding: 2px 7px; border-radius: 12px; font-size: 11px; }
    .tab:not(.active) .count { background: var(--bg-secondary); color: var(--text-tertiary); }
    .loading-state { text-align: center; padding: 60px; }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--border-color); border-top-color: var(--accent-primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { text-align: center; padding: 80px; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }
    .empty-state h3 { font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 20px; }
    .jobs-list { display: flex; flex-direction: column; gap: 16px; }
    .job-card {
      background: var(--bg-primary); border-radius: 16px; padding: 24px;
      border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);
    }
    .job-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .job-header h3 { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 8px; }
    .job-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 13px; color: var(--text-secondary); }
    .status-badge { padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; white-space: nowrap; }
    .status-active { background: #f0fdf4; color: #16a34a; }
    .status-closed { background: #f1f5f9; color: #64748b; }
    .status-filled { background: #eff6ff; color: #1e40af; }
    .status-draft { background: #fefce8; color: #ca8a04; }
    .job-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin: 10px 0 12px; }
    .skills-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
    .skill-chip { padding: 4px 10px; background: #eff6ff; color: #1e40af; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .job-actions { display: flex; align-items: center; gap: 8px; padding-top: 14px; border-top: 1px solid var(--border-color); flex-wrap: wrap; }
    .btn-applicants { padding: 8px 16px; background: var(--accent-primary); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }
    .btn-edit { padding: 8px 14px; background: transparent; border: 1.5px solid var(--border-color); border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; color: var(--text-primary); }
    .status-actions { display: flex; gap: 6px; flex: 1; }
    .btn-status-close, .btn-status-open, .btn-status-fill {
      padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1.5px solid;
    }
    .btn-status-close { border-color: #fecaca; color: #dc2626; background: transparent; }
    .btn-status-open { border-color: #bbf7d0; color: #16a34a; background: transparent; }
    .btn-status-fill { border-color: #bfdbfe; color: #1e40af; background: transparent; }
    .btn-delete { padding: 8px 10px; background: transparent; border: 1.5px solid #fecaca; border-radius: 8px; font-size: 14px; cursor: pointer; margin-left: auto; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 2000; }
    .modal { background: var(--bg-primary); border-radius: 16px; padding: 28px; width: 440px; max-width: 90vw; }
    .modal h3 { font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0 0 12px; }
    .modal p { font-size: 14px; color: var(--text-secondary); margin-bottom: 24px; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .btn-cancel { padding: 10px 20px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 9px; font-weight: 600; cursor: pointer; color: var(--text-secondary); }
    .btn-confirm-delete { padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 9px; font-weight: 700; cursor: pointer; }
  `]
})
export class ManageJobsComponent implements OnInit {
  jobs: any[] = [];
  loading = true;
  activeTab = 'ALL';
  deleteJob: any = null;
  tabs = [
    { label: 'All', value: 'ALL' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Closed', value: 'CLOSED' },
    { label: 'Filled', value: 'FILLED' }
  ];

  constructor(private jobService: JobService, public router: Router) {}

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.loading = true;
    this.jobService.getMyJobs().subscribe({
      next: (jobs) => { this.jobs = jobs; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get filteredJobs(): any[] {
    return this.activeTab === 'ALL' ? this.jobs : this.jobs.filter(j => j.status === this.activeTab);
  }

  getCount(status: string): number {
    return status === 'ALL' ? this.jobs.length : this.jobs.filter(j => j.status === status).length;
  }

  updateStatus(job: any, status: string) {
    this.jobService.updateJobStatus(job.id, status).subscribe(() => job.status = status);
  }

  confirmDelete(job: any) {
    this.deleteJob = job;
  }

  doDelete() {
    if (!this.deleteJob) return;
    this.jobService.deleteJob(this.deleteJob.id).subscribe(() => {
      this.jobs = this.jobs.filter(j => j.id !== this.deleteJob.id);
      this.deleteJob = null;
    });
  }

  getSkills(skills: string): string[] {
    return skills ? skills.split(',').slice(0, 4).map(s => s.trim()) : [];
  }

  formatType(type: string): string {
    return type ? type.replace('_', ' ') : '';
  }

  getTimeAgo(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diff === 0) return 'today';
    if (diff === 1) return 'yesterday';
    return `${diff} days ago`;
  }
}
