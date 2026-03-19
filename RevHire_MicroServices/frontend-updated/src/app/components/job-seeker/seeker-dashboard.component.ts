import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApplicationService, JobService, NotificationService } from '../../services/api.service';

@Component({
  selector: 'app-seeker-dashboard',
  template: `
    <div class="dashboard-page">
      <div class="dashboard-container">
        <!-- Welcome Header -->
        <div class="welcome-header">
          <div class="welcome-left">
            <div class="avatar-large">{{userInitial}}</div>
            <div>
              <h1>Welcome back, {{userName}}! 👋</h1>
              <p>Here's what's happening with your job search</p>
            </div>
          </div>
          <div class="welcome-actions">
            <button class="btn-primary" (click)="router.navigate(['/jobs'])">🔍 Search Jobs</button>
            <button class="btn-outline" (click)="router.navigate(['/seeker/profile'])">✏️ Edit Profile</button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card" (click)="router.navigate(['/seeker/applications'])">
            <div class="stat-icon blue">📋</div>
            <div class="stat-info">
              <div class="stat-num">{{totalApps}}</div>
              <div class="stat-label">Total Applications</div>
            </div>
          </div>
          <div class="stat-card" (click)="router.navigate(['/seeker/applications'])">
            <div class="stat-icon yellow">🔍</div>
            <div class="stat-info">
              <div class="stat-num">{{underReview}}</div>
              <div class="stat-label">Under Review</div>
            </div>
          </div>
          <div class="stat-card" (click)="router.navigate(['/seeker/applications'])">
            <div class="stat-icon green">✅</div>
            <div class="stat-info">
              <div class="stat-num">{{shortlisted}}</div>
              <div class="stat-label">Shortlisted</div>
            </div>
          </div>
          <div class="stat-card" (click)="router.navigate(['/seeker/saved-jobs'])">
            <div class="stat-icon red">❤️</div>
            <div class="stat-info">
              <div class="stat-num">{{savedCount}}</div>
              <div class="stat-label">Saved Jobs</div>
            </div>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Recent Applications -->
          <div class="dashboard-card">
            <div class="card-header">
              <h2>Recent Applications</h2>
              <a (click)="router.navigate(['/seeker/applications'])" class="see-all">See All →</a>
            </div>
            <div *ngIf="recentApps.length === 0" class="empty-state-small">
              <p>No applications yet</p>
              <button class="btn-primary-sm" (click)="router.navigate(['/jobs'])">Browse Jobs</button>
            </div>
            <div class="app-list">
              <div *ngFor="let app of recentApps" class="app-item">
                <div class="app-company-logo">{{app.companyName?.charAt(0) || 'C'}}</div>
                <div class="app-info">
                  <div class="app-title">{{app.jobTitle}}</div>
                  <div class="app-company">{{app.companyName}}</div>
                  <div class="app-date">Applied {{getTimeAgo(app.appliedAt)}}</div>
                </div>
                <span class="status-badge" [class]="'status-' + app.status?.toLowerCase()">
                  {{formatStatus(app.status)}}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Actions + Profile Completeness -->
          <div class="sidebar-cards">
            <div class="dashboard-card">
              <h2>Quick Actions</h2>
              <div class="quick-actions">
                <button class="action-btn" (click)="router.navigate(['/jobs'])">
                  <span class="action-icon">🔍</span>
                  <span>Find Jobs</span>
                </button>
                <button class="action-btn" (click)="router.navigate(['/seeker/profile'])">
                  <span class="action-icon">👤</span>
                  <span>Update Profile</span>
                </button>
                <button class="action-btn" (click)="router.navigate(['/seeker/saved-jobs'])">
                  <span class="action-icon">❤️</span>
                  <span>Saved Jobs</span>
                </button>
                <button class="action-btn" (click)="router.navigate(['/seeker/applications'])">
                  <span class="action-icon">📋</span>
                  <span>Applications</span>
                </button>
              </div>
            </div>

            <div class="dashboard-card">
              <h2>Application Status</h2>
              <div class="status-breakdown">
                <div class="status-row">
                  <span class="status-dot applied"></span>
                  <span class="status-name">Applied</span>
                  <span class="status-count">{{applied}}</span>
                </div>
                <div class="status-row">
                  <span class="status-dot review"></span>
                  <span class="status-name">Under Review</span>
                  <span class="status-count">{{underReview}}</span>
                </div>
                <div class="status-row">
                  <span class="status-dot shortlisted"></span>
                  <span class="status-name">Shortlisted</span>
                  <span class="status-count">{{shortlisted}}</span>
                </div>
                <div class="status-row">
                  <span class="status-dot rejected"></span>
                  <span class="status-name">Rejected</span>
                  <span class="status-count">{{rejected}}</span>
                </div>
              </div>
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
      background: linear-gradient(135deg, #1e40af, #3b82f6);
      border-radius: 20px; padding: 28px 32px; color: white; margin-bottom: 24px;
    }
    .welcome-left { display: flex; align-items: center; gap: 20px; }
    .avatar-large {
      width: 64px; height: 64px;
      background: rgba(255,255,255,0.25);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 26px; font-weight: 800;
    }
    .welcome-left h1 { font-size: 24px; font-weight: 800; margin: 0 0 6px; }
    .welcome-left p { font-size: 14px; opacity: 0.85; margin: 0; }
    .welcome-actions { display: flex; gap: 10px; }
    .btn-primary {
      padding: 10px 20px; background: white; color: #1e40af;
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
      cursor: pointer; transition: all 0.2s;
    }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .stat-icon {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; font-size: 22px;
    }
    .stat-icon.blue { background: #eff6ff; }
    .stat-icon.yellow { background: #fefce8; }
    .stat-icon.green { background: #f0fdf4; }
    .stat-icon.red { background: #fef2f2; }
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
    .btn-primary-sm {
      padding: 8px 20px; background: var(--accent-primary); color: white;
      border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px;
    }
    .app-list { display: flex; flex-direction: column; gap: 12px; }
    .app-item {
      display: flex; align-items: center; gap: 14px;
      padding: 14px; border-radius: 12px; background: var(--bg-secondary);
      border: 1px solid var(--border-color);
    }
    .app-company-logo {
      width: 40px; height: 40px;
      background: linear-gradient(135deg, #1e40af, #3b82f6);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 800; color: white; flex-shrink: 0;
    }
    .app-info { flex: 1; }
    .app-title { font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .app-company { font-size: 12px; color: var(--text-secondary); }
    .app-date { font-size: 11px; color: var(--text-tertiary); margin-top: 2px; }
    .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .status-applied { background: #eff6ff; color: #1e40af; }
    .status-under_review { background: #fefce8; color: #ca8a04; }
    .status-shortlisted { background: #f0fdf4; color: #16a34a; }
    .status-rejected { background: #fef2f2; color: #dc2626; }
    .status-withdrawn { background: #f1f5f9; color: #64748b; }
    .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .action-btn {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 16px; border-radius: 12px; background: var(--bg-secondary);
      border: 1px solid var(--border-color); cursor: pointer; font-size: 13px; font-weight: 600;
      color: var(--text-primary); transition: all 0.2s;
    }
    .action-btn:hover { background: #eff6ff; border-color: var(--accent-primary); color: var(--accent-primary); }
    .action-icon { font-size: 22px; }
    .status-breakdown { display: flex; flex-direction: column; gap: 12px; }
    .status-row { display: flex; align-items: center; gap: 10px; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; }
    .status-dot.applied { background: #3b82f6; }
    .status-dot.review { background: #eab308; }
    .status-dot.shortlisted { background: #22c55e; }
    .status-dot.rejected { background: #ef4444; }
    .status-name { flex: 1; font-size: 14px; color: var(--text-secondary); }
    .status-count { font-size: 14px; font-weight: 700; color: var(--text-primary); }
    @media (max-width: 1024px) {
      .dashboard-grid { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .welcome-header { flex-direction: column; gap: 16px; text-align: center; }
      .welcome-left { flex-direction: column; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class SeekerDashboardComponent implements OnInit {
  recentApps: any[] = [];
  totalApps = 0; applied = 0; underReview = 0; shortlisted = 0; rejected = 0; savedCount = 0;

  constructor(
    private authService: AuthService,
    private applicationService: ApplicationService,
    private jobService: JobService,
    public router: Router
  ) {}

  get userName() { return this.authService.currentUser?.name?.split(' ')[0] || 'User'; }
  get userInitial() { return this.authService.currentUser?.name?.charAt(0).toUpperCase() || 'U'; }

  ngOnInit() {
    this.applicationService.getMyApplications().subscribe(apps => {
      this.totalApps = apps.length;
      this.applied = apps.filter(a => a.status === 'APPLIED').length;
      this.underReview = apps.filter(a => a.status === 'UNDER_REVIEW').length;
      this.shortlisted = apps.filter(a => a.status === 'SHORTLISTED').length;
      this.rejected = apps.filter(a => a.status === 'REJECTED').length;
      this.recentApps = apps.slice(0, 5);
    });
    this.jobService.getSavedJobs().subscribe(jobs => this.savedCount = jobs.length);
  }

  formatStatus(status: string): string {
    return status ? status.replace('_', ' ') : '';
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
