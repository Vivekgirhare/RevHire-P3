import { Component, OnInit } from '@angular/core';
import { ApplicationService } from '../../services/api.service';

@Component({
  selector: 'app-seeker-applications',
  template: `
    <div class="apps-page">
      <div class="apps-container">
        <div class="page-header">
          <div>
            <h1>My Applications</h1>
            <p>Track all your job applications in one place</p>
          </div>
          <div class="filter-tabs">
            <button *ngFor="let f of filters" class="filter-tab" [class.active]="activeFilter === f"
                    (click)="activeFilter = f">{{f}}</button>
          </div>
        </div>

        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div>
        </div>

        <div *ngIf="!loading && filteredApps.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No applications {{activeFilter !== 'All' ? 'with status ' + activeFilter : 'yet'}}</h3>
          <p>Start exploring jobs and apply today!</p>
        </div>

        <div class="app-list">
          <div *ngFor="let app of filteredApps" class="app-card">
            <div class="app-card-header">
              <div class="company-logo">{{app.companyName?.charAt(0) || 'C'}}</div>
              <div class="app-main-info">
                <h3>{{app.jobTitle}}</h3>
                <p class="company">{{app.companyName}} · {{app.companyLocation}}</p>
                <p class="applied-date">Applied on {{app.appliedAt | date:'MMM dd, yyyy'}}</p>
              </div>
              <div class="app-status-section">
                <span class="status-badge" [class]="'status-' + app.status?.toLowerCase()">
                  {{formatStatus(app.status)}}
                </span>
              </div>
            </div>

            <div *ngIf="app.coverLetter" class="cover-letter">
              <h4>Cover Letter</h4>
              <p>{{app.coverLetter}}</p>
            </div>

            <div *ngIf="app.employerNote" class="employer-note">
              <h4>📝 Employer Note</h4>
              <p>{{app.employerNote}}</p>
            </div>

            <div class="app-card-footer">
              <span class="updated-at">Last updated: {{app.updatedAt | date:'MMM dd, yyyy'}}</span>
              <div class="app-actions">
                <button *ngIf="app.status !== 'WITHDRAWN' && app.status !== 'REJECTED'"
                        class="btn-withdraw" (click)="showWithdrawDialog(app)">
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Withdraw Dialog -->
    <div *ngIf="withdrawApp" class="modal-overlay" (click)="cancelWithdraw()">
      <div class="modal" (click)="$event.stopPropagation()">
        <h3>Withdraw Application</h3>
        <p>Are you sure you want to withdraw your application for <strong>{{withdrawApp.jobTitle}}</strong>?</p>
        <div class="form-group">
          <label>Reason (optional)</label>
          <textarea [(ngModel)]="withdrawReason" rows="3" class="form-textarea"
            placeholder="Let us know why you're withdrawing..."></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" (click)="cancelWithdraw()">Cancel</button>
          <button class="btn-confirm-withdraw" (click)="confirmWithdraw()">Confirm Withdraw</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .apps-page { min-height: 100vh; background: var(--bg-secondary); padding: 32px 24px; }
    .apps-container { max-width: 900px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
    .page-header h1 { font-size: 28px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px; }
    .page-header p { color: var(--text-secondary); font-size: 15px; margin: 0; }
    .filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
    .filter-tab {
      padding: 7px 16px; border: 1.5px solid var(--border-color);
      background: var(--bg-primary); border-radius: 20px; font-size: 13px;
      font-weight: 600; cursor: pointer; color: var(--text-secondary); transition: all 0.2s;
    }
    .filter-tab.active { background: var(--accent-primary); color: white; border-color: var(--accent-primary); }
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
    .empty-state p { color: var(--text-secondary); }
    .app-list { display: flex; flex-direction: column; gap: 16px; }
    .app-card {
      background: var(--bg-primary); border-radius: 16px; padding: 24px;
      border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);
    }
    .app-card-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
    .company-logo {
      width: 52px; height: 52px; background: linear-gradient(135deg, #1e40af, #3b82f6);
      border-radius: 12px; display: flex; align-items: center; justify-content: center;
      font-size: 20px; font-weight: 800; color: white; flex-shrink: 0;
    }
    .app-main-info { flex: 1; }
    .app-main-info h3 { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
    .company { font-size: 13px; color: var(--text-secondary); margin: 0 0 4px; }
    .applied-date { font-size: 12px; color: var(--text-tertiary); margin: 0; }
    .status-badge { padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; white-space: nowrap; }
    .status-applied { background: #eff6ff; color: #1e40af; }
    .status-under_review { background: #fefce8; color: #ca8a04; }
    .status-shortlisted { background: #f0fdf4; color: #16a34a; }
    .status-rejected { background: #fef2f2; color: #dc2626; }
    .status-withdrawn { background: #f1f5f9; color: #64748b; }
    .cover-letter, .employer-note {
      background: var(--bg-secondary); border-radius: 10px; padding: 14px;
      margin-bottom: 14px; border-left: 3px solid var(--accent-primary);
    }
    .cover-letter h4, .employer-note h4 { font-size: 12px; font-weight: 700; color: var(--text-secondary); margin: 0 0 6px; text-transform: uppercase; }
    .cover-letter p, .employer-note p { font-size: 14px; color: var(--text-primary); margin: 0; line-height: 1.6; }
    .employer-note { border-left-color: #f59e0b; }
    .app-card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--border-color); }
    .updated-at { font-size: 12px; color: var(--text-tertiary); }
    .btn-withdraw {
      padding: 7px 16px; background: transparent; color: #ef4444;
      border: 1.5px solid #fecaca; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
    }
    .btn-withdraw:hover { background: #fef2f2; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 2000; }
    .modal { background: var(--bg-primary); border-radius: 16px; padding: 28px; width: 440px; max-width: 90vw; }
    .modal h3 { font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0 0 12px; }
    .modal p { font-size: 14px; color: var(--text-secondary); margin-bottom: 20px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; }
    .form-textarea {
      width: 100%; padding: 11px 14px; border: 1.5px solid var(--border-color);
      border-radius: 10px; font-size: 14px; color: var(--text-primary);
      background: var(--bg-secondary); resize: vertical; box-sizing: border-box; font-family: inherit;
    }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .btn-cancel {
      padding: 10px 20px; background: var(--bg-secondary); color: var(--text-secondary);
      border: 1px solid var(--border-color); border-radius: 9px; font-weight: 600; cursor: pointer;
    }
    .btn-confirm-withdraw {
      padding: 10px 20px; background: #ef4444; color: white;
      border: none; border-radius: 9px; font-weight: 700; cursor: pointer;
    }
  `]
})
export class SeekerApplicationsComponent implements OnInit {
  applications: any[] = [];
  loading = true;
  activeFilter = 'All';
  filters = ['All', 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN'];
  withdrawApp: any = null;
  withdrawReason = '';

  constructor(private applicationService: ApplicationService) {}

  ngOnInit() {
    this.applicationService.getMyApplications().subscribe({
      next: (apps) => { this.applications = apps; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get filteredApps(): any[] {
    if (this.activeFilter === 'All') return this.applications;
    return this.applications.filter(a => a.status === this.activeFilter);
  }

  formatStatus(status: string): string {
    return status ? status.replace(/_/g, ' ') : '';
  }

  showWithdrawDialog(app: any) {
    this.withdrawApp = app;
    this.withdrawReason = '';
  }

  cancelWithdraw() {
    this.withdrawApp = null;
  }

  confirmWithdraw() {
    if (!this.withdrawApp) return;
    this.applicationService.withdraw(this.withdrawApp.id, this.withdrawReason).subscribe({
      next: () => {
        const app = this.applications.find(a => a.id === this.withdrawApp.id);
        if (app) app.status = 'WITHDRAWN';
        this.withdrawApp = null;
      },
      error: (err) => alert(err.error?.error || 'Failed to withdraw')
    });
  }
}
