import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';

import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { JobListComponent } from './components/shared/job-list.component';
import { JobDetailComponent } from './components/shared/job-detail.component';
import { NavbarComponent } from './components/shared/navbar.component';

import { SeekerDashboardComponent } from './components/job-seeker/seeker-dashboard.component';
import { SeekerProfileComponent } from './components/job-seeker/seeker-profile.component';
import { SeekerApplicationsComponent } from './components/job-seeker/seeker-applications.component';
import { SavedJobsComponent } from './components/job-seeker/saved-jobs.component';

import { EmployerDashboardComponent } from './components/employer/employer-dashboard.component';
import { PostJobComponent } from './components/employer/post-job.component';
import { ManageJobsComponent } from './components/employer/manage-jobs.component';
import { ViewApplicantsComponent } from './components/employer/view-applicants.component';
import { CompanyProfileComponent } from './components/employer/company-profile.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    JobListComponent,
    JobDetailComponent,
    NavbarComponent,
    SeekerDashboardComponent,
    SeekerProfileComponent,
    SeekerApplicationsComponent,
    SavedJobsComponent,
    EmployerDashboardComponent,
    PostJobComponent,
    ManageJobsComponent,
    ViewApplicantsComponent,
    CompanyProfileComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
