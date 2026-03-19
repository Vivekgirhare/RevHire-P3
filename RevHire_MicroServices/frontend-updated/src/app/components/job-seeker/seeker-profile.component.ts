import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../services/api.service';

@Component({
  selector: 'app-seeker-profile',
  template: `
    <div class="profile-page">
      <div class="profile-container">
        <div class="page-header">
          <h1>My Profile</h1>
          <p>Manage your professional information and resume</p>
        </div>

        <div class="profile-layout">
          <!-- Left: Form -->
          <div class="profile-form-section">
            <!-- Basic Info -->
            <div class="form-card">
              <div class="card-title-row">
                <h2>📝 Basic Information</h2>
              </div>
              <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                <div class="form-row">
                  <div class="form-group">
                    <label>Current Job Title</label>
                    <input formControlName="currentJobTitle" type="text" placeholder="e.g. Software Engineer" class="form-input">
                  </div>
                  <div class="form-group">
                    <label>Total Experience (Years)</label>
                    <input formControlName="totalExperienceYears" type="number" placeholder="0" class="form-input">
                  </div>
                </div>
                <div class="form-group">
                  <label>Professional Objective</label>
                  <textarea formControlName="objective" rows="3" class="form-textarea"
                    placeholder="Write a brief professional summary..."></textarea>
                </div>
                <div class="form-group">
                  <label>Skills (comma separated)</label>
                  <input formControlName="skills" type="text" placeholder="Java, Spring Boot, Angular, MySQL..." class="form-input">
                  <div class="skills-preview" *ngIf="profileForm.get('skills')?.value">
                    <span *ngFor="let s of getSkillsList(profileForm.get('skills')?.value)" class="skill-chip">{{s}}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>Education</label>
                  <textarea formControlName="education" rows="3" class="form-textarea"
                    placeholder="B.Tech Computer Science - XYZ University, 2020&#10;Higher Secondary - ABC School, 2016"></textarea>
                </div>
                <div class="form-group">
                  <label>Work Experience</label>
                  <textarea formControlName="experience" rows="4" class="form-textarea"
                    placeholder="Software Engineer at ABC Corp (2020-2023)&#10;- Developed REST APIs using Spring Boot&#10;- Led team of 3 developers"></textarea>
                </div>
                <div class="form-group">
                  <label>Projects</label>
                  <textarea formControlName="projects" rows="3" class="form-textarea"
                    placeholder="RevHire - Job Portal Application&#10;- Tech: Java, Spring Boot, Angular, MySQL"></textarea>
                </div>
                <div class="form-group">
                  <label>Certifications</label>
                  <textarea formControlName="certifications" rows="2" class="form-textarea"
                    placeholder="AWS Certified Solutions Architect - 2023&#10;Oracle Java SE 11 Developer - 2022"></textarea>
                </div>

                <div *ngIf="saveSuccess" class="alert-success">✓ Profile saved successfully!</div>
                <div *ngIf="saveError" class="alert-error">{{saveError}}</div>

                <button type="submit" class="btn-primary" [disabled]="saving">
                  <span *ngIf="saving" class="spinner"></span>
                  {{saving ? 'Saving...' : '💾 Save Profile'}}
                </button>
              </form>
            </div>
          </div>

          <!-- Right: Resume Upload + Preview -->
          <div class="profile-sidebar">
            <div class="form-card">
              <h2>📄 Resume Upload</h2>
              <p class="upload-hint">Upload your resume in PDF or DOCX format (max 2MB)</p>

              <div class="upload-area" (click)="fileInput.click()" [class.has-file]="selectedFile">
                <input #fileInput type="file" accept=".pdf,.docx" (change)="onFileSelect($event)" style="display:none">
                <div *ngIf="!selectedFile && !currentResume">
                  <div class="upload-icon">📁</div>
                  <p>Click to upload or drag & drop</p>
                  <small>PDF, DOCX up to 2MB</small>
                </div>
                <div *ngIf="selectedFile || currentResume" class="file-selected">
                  <div class="file-icon">📄</div>
                  <span>{{selectedFile?.name || currentResume}}</span>
                </div>
              </div>

              <div *ngIf="uploadError" class="alert-error">{{uploadError}}</div>
              <div *ngIf="uploadSuccess" class="alert-success">{{uploadSuccess}}</div>

              <button *ngIf="selectedFile" class="btn-upload" (click)="uploadResume()" [disabled]="uploading">
                {{uploading ? 'Uploading...' : '⬆️ Upload Resume'}}
              </button>

              <div *ngIf="currentResume" class="current-resume">
                <p class="current-label">Current Resume:</p>
                <div class="resume-file">
                  <span>📄 {{currentResume}}</span>
                </div>
              </div>
            </div>

            <div class="form-card profile-tips">
              <h3>💡 Profile Tips</h3>
              <ul>
                <li>Add specific skills employers look for</li>
                <li>Include quantified achievements in experience</li>
                <li>Keep your resume up to date</li>
                <li>Write a compelling objective</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { min-height: 100vh; background: var(--bg-secondary); padding: 32px 24px; }
    .profile-container { max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 28px; }
    .page-header h1 { font-size: 28px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px; }
    .page-header p { color: var(--text-secondary); font-size: 15px; margin: 0; }
    .profile-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
    .profile-form-section { display: flex; flex-direction: column; gap: 20px; }
    .profile-sidebar { display: flex; flex-direction: column; gap: 20px; }
    .form-card {
      background: var(--bg-primary);
      border-radius: 16px; padding: 24px;
      border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);
    }
    .card-title-row { margin-bottom: 20px; }
    .form-card h2 { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.4px; }
    .form-input, .form-textarea, .form-select {
      width: 100%; padding: 11px 14px;
      border: 1.5px solid var(--border-color);
      border-radius: 10px; font-size: 14px;
      color: var(--text-primary); background: var(--bg-secondary);
      box-sizing: border-box;
    }
    .form-textarea { resize: vertical; font-family: inherit; }
    .form-input:focus, .form-textarea:focus { border-color: var(--accent-primary); outline: none; background: var(--bg-primary); }
    .skills-preview { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .skill-chip { padding: 4px 10px; background: #eff6ff; color: #1e40af; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .btn-primary {
      padding: 12px 24px; background: var(--accent-primary); color: white;
      border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; gap: 8px;
    }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.7s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 14px; }
    .alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 14px; }
    .upload-hint { font-size: 13px; color: var(--text-secondary); margin-bottom: 14px; }
    .upload-area {
      border: 2px dashed var(--border-color); border-radius: 12px;
      padding: 32px; text-align: center; cursor: pointer; transition: all 0.2s; margin-bottom: 14px;
    }
    .upload-area:hover, .upload-area.has-file { border-color: var(--accent-primary); background: #eff6ff; }
    .upload-icon { font-size: 32px; margin-bottom: 8px; }
    .upload-area p { font-size: 14px; color: var(--text-secondary); margin: 0 0 4px; font-weight: 600; }
    .upload-area small { font-size: 12px; color: var(--text-tertiary); }
    .file-selected { display: flex; align-items: center; gap: 10px; justify-content: center; }
    .file-icon { font-size: 28px; }
    .file-selected span { font-size: 13px; font-weight: 600; color: var(--accent-primary); }
    .btn-upload {
      width: 100%; padding: 11px; background: var(--accent-primary); color: white;
      border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; margin-bottom: 10px;
    }
    .current-label { font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase; }
    .resume-file {
      padding: 10px 14px; background: var(--bg-secondary);
      border-radius: 8px; font-size: 13px; color: var(--text-primary);
    }
    .profile-tips { }
    .profile-tips h3 { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0 0 12px; }
    .profile-tips ul { padding-left: 18px; margin: 0; }
    .profile-tips li { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; line-height: 1.5; }
    @media (max-width: 900px) { .profile-layout { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class SeekerProfileComponent implements OnInit {
  profileForm: FormGroup;
  saving = false;
  saveSuccess = false;
  saveError = '';
  selectedFile: File | null = null;
  uploading = false;
  uploadError = '';
  uploadSuccess = '';
  currentResume = '';

  constructor(private fb: FormBuilder, private profileService: ProfileService) {
    this.profileForm = this.fb.group({
      currentJobTitle: [''],
      totalExperienceYears: [0],
      objective: [''],
      skills: [''],
      education: [''],
      experience: [''],
      projects: [''],
      certifications: ['']
    });
  }

  ngOnInit() {
    this.profileService.getProfile().subscribe(profile => {
      if (profile) {
        this.profileForm.patchValue(profile);
        this.currentResume = (profile as any).resumeFileName || '';
      }
    });
  }

  getSkillsList(skills: string): string[] {
    return skills ? skills.split(',').map(s => s.trim()).filter(s => s) : [];
  }

  saveProfile() {
    this.saving = true;
    this.saveError = '';
    this.saveSuccess = false;
    this.profileService.updateProfile(this.profileForm.value).subscribe({
      next: () => { this.saving = false; this.saveSuccess = true; setTimeout(() => this.saveSuccess = false, 3000); },
      error: (err) => { this.saving = false; this.saveError = err.error?.error || 'Failed to save profile.'; }
    });
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { this.uploadError = 'File too large. Max 2MB allowed.'; return; }
    this.selectedFile = file;
    this.uploadError = '';
  }

  uploadResume() {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.uploadError = '';
    this.profileService.uploadResume(this.selectedFile).subscribe({
      next: (res: any) => {
        this.uploading = false;
        this.uploadSuccess = 'Resume uploaded successfully!';
        this.currentResume = res.fileName || this.selectedFile!.name;
        this.selectedFile = null;
        setTimeout(() => this.uploadSuccess = '', 3000);
      },
      error: (err) => {
        this.uploading = false;
        this.uploadError = err.error?.error || 'Failed to upload resume.';
      }
    });
  }
}
