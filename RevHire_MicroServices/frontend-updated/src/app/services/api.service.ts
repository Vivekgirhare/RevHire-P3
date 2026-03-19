import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Job, Application, Profile, Company, Notification } from '../models/models';

const BASE = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class JobService {
  constructor(private http: HttpClient) {}

  searchJobs(params: any): Observable<Job[]> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(k => {
      if (params[k]) httpParams = httpParams.set(k, params[k]);
    });
    return this.http.get<Job[]>(`${BASE}/jobs/search`, { params: httpParams });
  }

  getJobById(id: number): Observable<Job> {
    return this.http.get<Job>(`${BASE}/jobs/${id}`);
  }

  // FIX 1: /employer → /employer/create
  createJob(data: any): Observable<Job> {
    return this.http.post<Job>(`${BASE}/jobs/employer/create`, data);
  }

  getMyJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${BASE}/jobs/employer/my-jobs`);
  }

  updateJob(id: number, data: any): Observable<Job> {
    return this.http.put<Job>(`${BASE}/jobs/employer/${id}`, data);
  }

  updateJobStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${BASE}/jobs/employer/${id}/status`, { status });
  }

  deleteJob(id: number): Observable<any> {
    return this.http.delete(`${BASE}/jobs/employer/${id}`);
  }

  // FIX 2: saved jobs moved to profile-service path
  getSavedJobs(): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/profile/seeker/saved-jobs`);
  }

  // FIX 3: saved jobs path + body with job metadata required by backend
  saveJob(id: number, job: Job): Observable<any> {
    return this.http.post(`${BASE}/profile/seeker/saved-jobs/${id}`, {
      jobTitle:    job.title,
      companyName: job.companyName,
      jobLocation: job.companyLocation,
      jobType:     job.jobType
    });
  }

  // FIX 4: saved jobs delete path
  unsaveJob(id: number): Observable<any> {
    return this.http.delete(`${BASE}/profile/seeker/saved-jobs/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  constructor(private http: HttpClient) {}

  apply(jobId: number, coverLetter: string): Observable<Application> {
    return this.http.post<Application>(`${BASE}/applications/seeker/apply`, { jobId, coverLetter });
  }

  getMyApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(`${BASE}/applications/seeker/my-applications`);
  }

  withdraw(id: number, reason: string): Observable<any> {
    return this.http.patch(`${BASE}/applications/seeker/${id}/withdraw`, { reason });
  }

  getJobApplications(jobId: number): Observable<Application[]> {
    return this.http.get<Application[]>(`${BASE}/applications/employer/job/${jobId}`);
  }

  updateStatus(id: number, status: string, note: string): Observable<Application> {
    return this.http.patch<Application>(`${BASE}/applications/employer/${id}/status`, { status, note });
  }
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private http: HttpClient) {}

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${BASE}/profile`);
  }

  updateProfile(data: any): Observable<Profile> {
    return this.http.put<Profile>(`${BASE}/profile`, data);
  }

  uploadResume(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${BASE}/profile/resume`, formData);
  }
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
  constructor(private http: HttpClient) {}

  getCompany(): Observable<Company> {
    return this.http.get<Company>(`${BASE}/company`);
  }

  updateCompany(data: any): Observable<Company> {
    return this.http.put<Company>(`${BASE}/company`, data);
  }

  // FIX 5: /company/dashboard → /company (dashboard endpoint doesn't exist)
  getDashboard(): Observable<Company> {
    return this.http.get<Company>(`${BASE}/company`);
  }
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${BASE}/notifications`);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${BASE}/notifications/unread-count`);
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch(`${BASE}/notifications/mark-all-read`, {});
  }

  markAsRead(id: number): Observable<any> {
    return this.http.patch(`${BASE}/notifications/${id}/read`, {});
  }
}
