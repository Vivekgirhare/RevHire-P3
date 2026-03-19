import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, RoleGuard, GuestGuard } from './guards/auth.guard';

import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { JobListComponent } from './components/shared/job-list.component';
import { JobDetailComponent } from './components/shared/job-detail.component';

import { SeekerDashboardComponent } from './components/job-seeker/seeker-dashboard.component';
import { SeekerProfileComponent } from './components/job-seeker/seeker-profile.component';
import { SeekerApplicationsComponent } from './components/job-seeker/seeker-applications.component';
import { SavedJobsComponent } from './components/job-seeker/saved-jobs.component';

import { EmployerDashboardComponent } from './components/employer/employer-dashboard.component';
import { PostJobComponent } from './components/employer/post-job.component';
import { ManageJobsComponent } from './components/employer/manage-jobs.component';
import { ViewApplicantsComponent } from './components/employer/view-applicants.component';
import { CompanyProfileComponent } from './components/employer/company-profile.component';

const routes: Routes = [
  { path: '', redirectTo: '/jobs', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },
  { path: 'jobs', component: JobListComponent },
  { path: 'jobs/:id', component: JobDetailComponent },

  // Job Seeker routes
  {
    path: 'seeker',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'JOB_SEEKER' },
    children: [
      { path: 'dashboard', component: SeekerDashboardComponent },
      { path: 'profile', component: SeekerProfileComponent },
      { path: 'applications', component: SeekerApplicationsComponent },
      { path: 'saved-jobs', component: SavedJobsComponent },
    ]
  },

  // Employer routes
  {
    path: 'employer',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'EMPLOYER' },
    children: [
      { path: 'dashboard', component: EmployerDashboardComponent },
      { path: 'post-job', component: PostJobComponent },
      { path: 'jobs', component: ManageJobsComponent },
      { path: 'jobs/:id/applicants', component: ViewApplicantsComponent },
      { path: 'company', component: CompanyProfileComponent },
    ]
  },

  { path: '**', redirectTo: '/jobs' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
