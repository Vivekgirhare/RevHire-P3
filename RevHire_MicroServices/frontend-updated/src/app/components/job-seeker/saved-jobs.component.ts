import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JobService } from '../../services/api.service';

// Backend returns SavedJob shape, not full Job
interface SavedJob {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  jobLocation: string;
  jobType: string;
  savedAt: string;
}

@Component({
  selector: 'app-saved-jobs',
  template: `
    <div class="saved-page">
      <div class="saved-container">
        <div class="page-header">
          <h1>❤️ Saved Jobs</h1>
          <p>Jobs you've bookmarked for later</p>
        </div>

        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div>
        </div>

        <div *ngIf="!loading && jobs.length === 0" class="empty-state">
          <div class="empty-icon">🤍</div>
          <h3>No saved jobs yet</h3>
          <p>Browse jobs and click the heart icon to save them here</p>
          <button class="btn-browse" (click)="router.navigate(['/jobs'])">Browse Jobs</button>
        </div>

        <div class="jobs-grid">
          <div *ngFor="let job of jobs" class="job-card">
            <div class="card-header">
              <div class="logo">{{job.companyName?.charAt(0) || 'C'}}</div>
              <div class="job-info">
                <h3>{{job.jobTitle}}</h3>
                <span>{{job.companyName}}</span>
              </div>
              <button class="unsave-btn" (click)="unsave(job)" title="Remove from saved">❤️</button>
            </div>
            <div class="job-meta">
              <span class="meta">📍 {{job.jobLocation || 'Remote'}}</span>
              <span class="meta">💼 {{formatType(job.jobType)}}</span>
              
            </div>
            
            <div class="card-actions">
              <button class="btn-view" (click)="router.navigate(['/jobs', job.jobId])">View Job</button>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .saved-page { min-height: 100vh; background: var(--bg-secondary); padding: 32px 24px; }
    .saved-container { max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 28px; }
    .page-header h1 { font-size: 28px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px; }
    .page-header p { color: var(--text-secondary); font-size: 15px; margin: 0; }
    .loading-state { text-align: center; padding: 60px; }
    .spinner {
      width: 36px; height: 36px; border: 3px solid var(--border-color);
      border-top-color: var(--accent-primary); border-radius: 50%;
      animation: spin 1s linear infinite; margin: 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { text-align: center; padding: 80px 20px; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }
    .empty-state h3 { font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
    .empty-state p { color: var(--text-secondary); margin-bottom: 20px; }
    .btn-browse { padding: 10px 24px; background: var(--accent-primary); color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; }
    .jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .job-card {
      background: var(--bg-primary); border-radius: 16px; padding: 20px;
      border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);
      transition: all 0.2s;
    }
    .job-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
    .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
    .logo {
      width: 44px; height: 44px;
      background: linear-gradient(135deg, #1e40af, #3b82f6);
      border-radius: 10px; display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 800; color: white; flex-shrink: 0;
    }
    .job-info { flex: 1; }
    .job-info h3 { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0 0 3px; }
    .job-info span { font-size: 12px; color: var(--text-secondary); }
    .unsave-btn { background: none; border: none; font-size: 20px; cursor: pointer; }
    .job-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
    .meta { font-size: 12px; color: var(--text-secondary); }
    .desc { font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 14px; }
    .card-actions { display: flex; align-items: center; gap: 10px; justify-content: space-between; }
    .btn-view {
      padding: 8px 18px; background: var(--accent-primary); color: white;
      border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer;
    }
    .applied-badge { padding: 5px 12px; background: #dcfce7; color: #16a34a; border-radius: 8px; font-size: 12px; font-weight: 700; }
  `]
})
export class SavedJobsComponent implements OnInit {
  jobs: SavedJob[] = [];
  loading = true;

  constructor(private jobService: JobService, public router: Router) {}

  ngOnInit() {
    this.jobService.getSavedJobs().subscribe({
      next: (jobs) => { this.jobs = jobs; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  unsave(job: SavedJob) {
    this.jobService.unsaveJob(job.jobId).subscribe(() => {
      this.jobs = this.jobs.filter(j => j.jobId !== job.jobId);
    });
  }

  formatType(type: string): string {
    return type ? type.replace('_', ' ') : '';
  }
}
