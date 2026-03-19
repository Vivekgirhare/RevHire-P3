import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CompanyService, JobService, ApplicationService } from '../../services/api.service';

@Component({
  selector: 'app-employer-dashboard',
  template: `
    <div class="dashboard-page">
      <div class="dashboard-container">
        <!-- Header -->
        <div class="welcome-header">
          <div class="welcome-left">
            <div class="company-avatar">{{companyName?.charAt(0) || 'C'}}</div>
            <div>
              <h1>{{companyName || 'Company'}} Dashboard 🏢</h1>
              <p>Manage your job postings and find great talent</p>
            </div>
          </div>
          <div class="welcome-actions">
            <button class="btn-primary" (click)="router.navigate(['/employer/post-job'])">+ Post New Job</button>
            <button class="btn-outline" (click)="router.navigate(['/employer/company'])">⚙️ Company Settings</button>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon blue">📋</div>
            <div class="stat-info">
              <div class="stat-num">{{totalJobs}}</div>
              <div class="stat-label">Total Jobs Posted</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green">✅</div>
            <div class="stat-info">
              <div class="stat-num">{{activeJobs}}</div>
              <div class="stat-label">Active Jobs</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon yellow">👥</div>
            <div class="stat-info">
              <div class="stat-num">{{totalApps}}</div>
              <div class="stat-label">Total Applications</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange">🔍</div>
            <div class="stat-info">
              <div class="stat-num">{{pendingReview}}</div>
              <div class="stat-label">Pending Review</div>
            </div>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Recent Jobs -->
          <div class="dashboard-card">
            <div class="card-header">
              <h2>Recent Job Postings</h2>
              <a class="see-all" (click)="router.navigate(['/employer/jobs'])">Manage All →</a>
            </div>
            <div *ngIf="recentJobs.length === 0" class="empty-state-small">
              <p>No jobs posted yet</p>
              <button class="btn-primary-sm" (click)="router.navigate(['/employer/post-job'])">Post Your First Job</button>
            </div>
            <div class="job-list">
              <div *ngFor="let job of recentJobs" class="job-row">
                <div class="job-row-info">
                  <div class="job-title">{{job.title}}</div>
                  <div class="job-meta-row">
                    <span>📍 {{job.location}}</span>
                    <span>💼 {{formatType(job.jobType)}}</span>
                    <span>👥 {{getAppCount(job.id)}} applicants</span>
                  </div>
                </div>
                <div class="job-row-actions">
                  <span class="status-badge" [class]="'status-' + job.status?.toLowerCase()">{{job.status}}</span>
                  <button class="btn-view-apps" (click)="router.navigate(['/employer/jobs', job.id, 'applicants'])">
                    View Applicants
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="sidebar-cards">
            <div class="dashboard-card">
              <h2>Quick Actions</h2>
              <div class="quick-actions">
                <button class="action-btn" (click)="router.navigate(['/employer/post-job'])">
                  <span>➕</span><span>Post Job</span>
                </button>
                <button class="action-btn" (click)="router.navigate(['/employer/jobs'])">
                  <span>📋</span><span>Manage Jobs</span>
                </button>
                <button class="action-btn" (click)="router.navigate(['/employer/company'])">
                  <span>🏢</span><span>Company Profile</span>
                </button>
                <button class="action-btn" (click)="router.navigate(['/jobs'])">
                  <span>🔍</span><span>Browse Jobs</span>
                </button>
              </div>
            </div>

            <div class="dashboard-card tip-card">
              <h3>💡 Hiring Tips</h3>
              <ul>
                <li>Write clear job descriptions to attract the right candidates</li>
                <li>List specific skills and requirements</li>
                <li>Review applications promptly</li>
                <li>Provide feedback to rejected candidates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page { min-height: 100vh; background: var(--bg-secondary); padding: 32px 24px; }
    .dashboard-container { max-width: 1200px; margin: 0 auto; }
    .welcome-header {
      display: flex; justify-content: space-between; align-items: center;
      background: linear-gradient(135deg, #065f46, #10b981);
      border-radius: 20px; padding: 28px 32px; color: white; margin-bottom: 24px;
    }
    .welcome-left { display: flex; align-items: center; gap: 20px; }
    .company-avatar {
      width: 64px; height: 64px; background: rgba(255,255,255,0.25);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 26px; font-weight: 800;
    }
    .welcome-left h1 { font-size: 24px; font-weight: 800; margin: 0 0 6px; }
    .welcome-left p { font-size: 14px; opacity: 0.85; margin: 0; }
    .welcome-actions { display: flex; gap: 10px; }
    .btn-primary {
      padding: 10px 20px; background: white; color: #065f46;
      border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 14px;
    }
    .btn-outline {
      padding: 10px 20px; background: rgba(255,255,255,0.15); color: white;
      border: 1px solid rgba(255,255,255,0.4); border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 14px;
    }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card {
      background: var(--bg-primary); border-radius: 16px; padding: 20px;
      display: flex; align-items: center; gap: 14px;
      border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);
    }
    .stat-icon {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; font-size: 22px;
    }
    .stat-icon.blue { background: #eff6ff; }
    .stat-icon.green { background: #f0fdf4; }
    .stat-icon.yellow { background: #fefce8; }
    .stat-icon.orange { background: #fff7ed; }
    .stat-num { font-size: 28px; font-weight: 800; color: var(--text-primary); }
    .stat-label { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }
    .dashboard-grid { display: grid; grid-template-columns: 1fr 360px; gap: 20px; }
    .sidebar-cards { display: flex; flex-direction: column; gap: 20px; }
    .dashboard-card {
      background: var(--bg-primary); border-radius: 16px; padding: 24px;
      border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);
    }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .card-header h2 { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0; }
    .dashboard-card h2 { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 16px; }
    .see-all { color: var(--accent-primary); font-size: 14px; font-weight: 600; cursor: pointer; }
    .empty-state-small { text-align: center; padding: 30px; }
    .empty-state-small p { color: var(--text-secondary); margin-bottom: 14px; }
    .btn-primary-sm { padding: 8px 20px; background: var(--accent-primary); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .job-list { display: flex; flex-direction: column; gap: 12px; }
    .job-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px; background: var(--bg-secondary); border-radius: 12px;
      border: 1px solid var(--border-color); flex-wrap: wrap; gap: 10px;
    }
    .job-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
    .job-meta-row { display: flex; gap: 12px; font-size: 12px; color: var(--text-secondary); }
    .job-row-actions { display: flex; align-items: center; gap: 10px; }
    .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .status-active { background: #f0fdf4; color: #16a34a; }
    .status-closed { background: #f1f5f9; color: #64748b; }
    .status-filled { background: #eff6ff; color: #1e40af; }
    .btn-view-apps {
      padding: 7px 14px; background: var(--accent-primary); color: white;
      border: none; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;
    }
    .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .action-btn {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 16px; border-radius: 12px; background: var(--bg-secondary);
      border: 1px solid var(--border-color); cursor: pointer; font-size: 13px; font-weight: 600;
      color: var(--text-primary); transition: all 0.2s;
    }
    .action-btn span:first-child { font-size: 22px; }
    .action-btn:hover { background: #f0fdf4; border-color: #10b981; color: #065f46; }
    .tip-card h3 { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0 0 12px; }
    .tip-card ul { padding-left: 18px; margin: 0; }
    .tip-card li { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; line-height: 1.5; }
    @media (max-width: 1024px) {
      .dashboard-grid { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .welcome-header { flex-direction: column; gap: 16px; text-align: center; }
    }
  `]
})
export class EmployerDashboardComponent implements OnInit {
  companyName = '';
  totalJobs = 0; activeJobs = 0; totalApps = 0; pendingReview = 0;
  recentJobs: any[] = [];
  appCounts: Record<number, number> = {};

  constructor(
    private authService: AuthService,
    private companyService: CompanyService,
    private jobService: JobService,
    private applicationService: ApplicationService,
    public router: Router
  ) {}

  ngOnInit() {
    this.companyService.getCompany().subscribe(c => this.companyName = (c as any).name || '');
    this.jobService.getMyJobs().subscribe(jobs => {
      this.totalJobs = jobs.length;
      this.activeJobs = jobs.filter((j: any) => j.status === 'ACTIVE').length;
      this.recentJobs = jobs.slice(0, 5);
      jobs.forEach((job: any) => {
        this.applicationService.getJobApplications(job.id).subscribe(apps => {
          this.appCounts[job.id] = apps.length;
          this.totalApps = Object.values(this.appCounts).reduce((a, b) => a + b, 0);
          this.pendingReview = 0; // computed elsewhere
        });
      });
    });
  }

  getAppCount(jobId: number): number {
    return this.appCounts[jobId] || 0;
  }

  formatType(type: string): string {
    return type ? type.replace('_', ' ') : '';
  }
}
