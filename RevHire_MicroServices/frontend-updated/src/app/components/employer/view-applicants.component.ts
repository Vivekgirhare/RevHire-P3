import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService, JobService } from '../../services/api.service';

@Component({
  selector: 'app-view-applicants',
  template: `
    <div class="applicants-page">
      <div class="applicants-container">
        <div class="page-header">
          <button class="back-btn" (click)="router.navigate(['/employer/jobs'])">← Back to Jobs</button>
          <div>
            <h1>Applicants for: {{jobTitle}}</h1>
            <p>{{applications.length}} total applications</p>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="filter-bar">
          <div class="status-tabs">
            <button *ngFor="let f of filters" class="filter-tab" [class.active]="activeFilter === f.value"
                    (click)="activeFilter = f.value">
              {{f.label}} ({{getFilterCount(f.value)}})
            </button>
          </div>
          <div class="search-box">
            <input [(ngModel)]="searchQuery" placeholder="Search by name or skills..." class="search-input">
          </div>
        </div>

        <div *ngIf="loading" class="loading-state"><div class="spinner"></div></div>

        <div *ngIf="!loading && filteredApps.length === 0" class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>No applicants found</h3>
        </div>

        <div class="applicants-list">
          <div *ngFor="let app of filteredApps" class="applicant-card">
            <div class="applicant-header">
              <div class="applicant-avatar">{{app.applicantName?.charAt(0) || 'A'}}</div>
              <div class="applicant-info">
                <h3>{{app.applicantName}}</h3>
                <div class="applicant-meta">
                  <span>📧 {{app.applicantEmail}}</span>
                  <span *ngIf="app.applicantPhone">📞 {{app.applicantPhone}}</span>
                  <span *ngIf="app.applicantLocation">📍 {{app.applicantLocation}}</span>
                </div>
                <div class="applicant-sub-meta">
                  <span *ngIf="app.currentJobTitle">💼 {{app.currentJobTitle}}</span>
                  <span *ngIf="app.totalExperienceYears !== null">📅 {{app.totalExperienceYears}} yrs exp</span>
                </div>
              </div>
              <div class="applicant-right">
                <span class="status-badge" [class]="'status-' + app.status?.toLowerCase()">{{formatStatus(app.status)}}</span>
                <div class="applied-date">Applied {{app.appliedAt | date:'MMM dd, yyyy'}}</div>
              </div>
            </div>

            <!-- Resume Details -->
            <div class="resume-section" *ngIf="app.objective || app.skills">
              <div class="resume-tabs">
                <button class="rtab" [class.active]="activeResumeTab[app.id] === 'summary'"
                        (click)="setTab(app.id, 'summary')">Summary</button>
                <button *ngIf="app.experience" class="rtab" [class.active]="activeResumeTab[app.id] === 'experience'"
                        (click)="setTab(app.id, 'experience')">Experience</button>
                <button *ngIf="app.skills" class="rtab" [class.active]="activeResumeTab[app.id] === 'skills'"
                        (click)="setTab(app.id, 'skills')">Skills</button>
                <button *ngIf="app.coverLetter" class="rtab" [class.active]="activeResumeTab[app.id] === 'cover'"
                        (click)="setTab(app.id, 'cover')">Cover Letter</button>
              </div>

              <div class="tab-content">
                <div *ngIf="!activeResumeTab[app.id] || activeResumeTab[app.id] === 'summary'">
                  <p *ngIf="app.objective" class="text-content">{{app.objective}}</p>
                  <p *ngIf="app.education" class="text-content"><strong>Education:</strong> {{app.education}}</p>
                </div>
                <div *ngIf="activeResumeTab[app.id] === 'experience'">
                  <p class="text-content">{{app.experience}}</p>
                </div>
                <div *ngIf="activeResumeTab[app.id] === 'skills'">
                  <div class="skills-row">
                    <span *ngFor="let s of getSkills(app.skills)" class="skill-chip">{{s}}</span>
                  </div>
                </div>
                <div *ngIf="activeResumeTab[app.id] === 'cover'">
                  <p class="text-content">{{app.coverLetter}}</p>
                </div>
              </div>
            </div>

            <!-- Employer Note -->
            <div *ngIf="noteEditing[app.id]" class="note-editor">
              <textarea [(ngModel)]="editingNotes[app.id]" rows="2" class="note-textarea"
                placeholder="Add an internal note..."></textarea>
              <button class="btn-save-note" (click)="saveNote(app)">Save Note</button>
              <button class="btn-cancel-note" (click)="noteEditing[app.id] = false">Cancel</button>
            </div>

            <div *ngIf="!noteEditing[app.id] && app.employerNote" class="employer-note">
              <strong>📝 Note:</strong> {{app.employerNote}}
              <button class="edit-note-btn" (click)="startEditNote(app)">Edit</button>
            </div>

            <!-- Actions -->
            <div class="action-bar">
              <div class="status-actions">
                <button *ngIf="app.status !== 'SHORTLISTED'" class="btn-shortlist" (click)="updateStatus(app, 'SHORTLISTED')">✅ Shortlist</button>
                <button *ngIf="app.status !== 'REJECTED'" class="btn-reject" (click)="updateStatus(app, 'REJECTED')">❌ Reject</button>
                <button *ngIf="app.status === 'APPLIED'" class="btn-review" (click)="updateStatus(app, 'UNDER_REVIEW')">🔍 Mark Under Review</button>
              </div>
              <button class="btn-add-note" (click)="startEditNote(app)">+ Note</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .applicants-page { min-height: 100vh; background: var(--bg-secondary); padding: 32px 24px; }
    .applicants-container { max-width: 1000px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; }
    .back-btn { background: none; border: none; color: var(--accent-primary); font-size: 14px; font-weight: 600; cursor: pointer; padding: 0; margin-bottom: 10px; }
    .page-header h1 { font-size: 26px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px; }
    .page-header p { color: var(--text-secondary); margin: 0; }
    .filter-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .status-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
    .filter-tab {
      padding: 7px 14px; border: 1.5px solid var(--border-color); background: var(--bg-primary);
      border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; color: var(--text-secondary);
    }
    .filter-tab.active { background: var(--accent-primary); color: white; border-color: var(--accent-primary); }
    .search-input {
      padding: 9px 14px; border: 1.5px solid var(--border-color); border-radius: 9px;
      font-size: 13px; color: var(--text-primary); background: var(--bg-primary); width: 220px;
    }
    .loading-state { text-align: center; padding: 60px; }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--border-color); border-top-color: var(--accent-primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { text-align: center; padding: 80px; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }
    .empty-state h3 { font-size: 20px; font-weight: 700; color: var(--text-primary); }
    .applicants-list { display: flex; flex-direction: column; gap: 20px; }
    .applicant-card {
      background: var(--bg-primary); border-radius: 16px; padding: 24px;
      border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);
    }
    .applicant-header { display: flex; gap: 16px; margin-bottom: 16px; align-items: flex-start; }
    .applicant-avatar {
      width: 52px; height: 52px; background: linear-gradient(135deg, #1e40af, #3b82f6);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 20px; font-weight: 800; color: white; flex-shrink: 0;
    }
    .applicant-info { flex: 1; }
    .applicant-info h3 { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px; }
    .applicant-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 13px; color: var(--text-secondary); margin-bottom: 4px; }
    .applicant-sub-meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-tertiary); }
    .applicant-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .status-badge { padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .status-applied { background: #eff6ff; color: #1e40af; }
    .status-under_review { background: #fefce8; color: #ca8a04; }
    .status-shortlisted { background: #f0fdf4; color: #16a34a; }
    .status-rejected { background: #fef2f2; color: #dc2626; }
    .status-withdrawn { background: #f1f5f9; color: #64748b; }
    .applied-date { font-size: 11px; color: var(--text-tertiary); }
    .resume-section { background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 14px; border: 1px solid var(--border-color); }
    .resume-tabs { display: flex; gap: 4px; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; }
    .rtab {
      padding: 5px 12px; border: none; background: transparent; border-radius: 6px;
      font-size: 12px; font-weight: 600; cursor: pointer; color: var(--text-secondary);
    }
    .rtab.active { background: var(--accent-primary); color: white; }
    .text-content { font-size: 13px; color: var(--text-secondary); line-height: 1.7; white-space: pre-wrap; margin: 0; }
    .skills-row { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-chip { padding: 4px 10px; background: #eff6ff; color: #1e40af; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .note-editor { margin-bottom: 12px; }
    .note-textarea {
      width: 100%; padding: 10px; border: 1.5px solid var(--border-color); border-radius: 8px;
      font-size: 13px; color: var(--text-primary); background: var(--bg-secondary); resize: vertical; box-sizing: border-box; margin-bottom: 8px; font-family: inherit;
    }
    .btn-save-note { padding: 7px 14px; background: var(--accent-primary); color: white; border: none; border-radius: 7px; font-size: 12px; font-weight: 700; cursor: pointer; margin-right: 6px; }
    .btn-cancel-note { padding: 7px 14px; background: transparent; border: 1px solid var(--border-color); border-radius: 7px; font-size: 12px; cursor: pointer; color: var(--text-secondary); }
    .employer-note { background: #fffbeb; border-left: 3px solid #f59e0b; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .edit-note-btn { background: none; border: none; color: var(--accent-primary); font-size: 12px; cursor: pointer; margin-left: auto; font-weight: 600; }
    .action-bar { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--border-color); flex-wrap: wrap; gap: 8px; }
    .status-actions { display: flex; gap: 8px; }
    .btn-shortlist { padding: 8px 14px; background: #f0fdf4; color: #16a34a; border: 1.5px solid #bbf7d0; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-reject { padding: 8px 14px; background: #fef2f2; color: #dc2626; border: 1.5px solid #fecaca; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-review { padding: 8px 14px; background: #fefce8; color: #ca8a04; border: 1.5px solid #fef08a; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-add-note { padding: 8px 14px; background: transparent; border: 1.5px solid var(--border-color); border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; color: var(--text-primary); }
  `]
})
export class ViewApplicantsComponent implements OnInit {
  applications: any[] = [];
  loading = true;
  jobTitle = '';
  jobId: number = 0;
  activeFilter = 'ALL';
  searchQuery = '';
  activeResumeTab: Record<number, string> = {};
  noteEditing: Record<number, boolean> = {};
  editingNotes: Record<number, string> = {};

  filters = [
    { label: 'All', value: 'ALL' },
    { label: 'Applied', value: 'APPLIED' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Shortlisted', value: 'SHORTLISTED' },
    { label: 'Rejected', value: 'REJECTED' }
  ];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private applicationService: ApplicationService,
    private jobService: JobService
  ) {}

  ngOnInit() {
    this.jobId = +this.route.snapshot.params['id'];
    this.jobService.getJobById(this.jobId).subscribe(job => this.jobTitle = (job as any).title || '');
    this.applicationService.getJobApplications(this.jobId).subscribe({
      next: (apps) => { this.applications = apps; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get filteredApps(): any[] {
    let apps = this.applications;
    if (this.activeFilter !== 'ALL') apps = apps.filter(a => a.status === this.activeFilter);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      apps = apps.filter(a =>
        a.applicantName?.toLowerCase().includes(q) ||
        a.skills?.toLowerCase().includes(q) ||
        a.currentJobTitle?.toLowerCase().includes(q)
      );
    }
    return apps;
  }

  getFilterCount(status: string): number {
    return status === 'ALL' ? this.applications.length : this.applications.filter(a => a.status === status).length;
  }

  updateStatus(app: any, status: string) {
    this.applicationService.updateStatus(app.id, status, this.editingNotes[app.id] || app.employerNote || '').subscribe(updated => {
      app.status = updated.status;
    });
  }

  startEditNote(app: any) {
    this.noteEditing[app.id] = true;
    this.editingNotes[app.id] = app.employerNote || '';
  }

  saveNote(app: any) {
    this.applicationService.updateStatus(app.id, app.status, this.editingNotes[app.id]).subscribe(updated => {
      app.employerNote = updated.employerNote;
      this.noteEditing[app.id] = false;
    });
  }

  setTab(appId: number, tab: string) {
    this.activeResumeTab[appId] = tab;
  }

  getSkills(skills: string): string[] {
    return skills ? skills.split(',').map(s => s.trim()) : [];
  }

  formatStatus(status: string): string {
    return status ? status.replace(/_/g, ' ') : '';
  }
}
