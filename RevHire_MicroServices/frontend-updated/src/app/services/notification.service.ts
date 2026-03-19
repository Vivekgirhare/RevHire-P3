import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private baseUrl = 'http://localhost:8080/api/notifications';

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.baseUrl).pipe(
      catchError(() => of([]))   // silently return empty on 401/503
    );
  }

  getUnreadCount(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/unread-count`).pipe(
      catchError(() => of({ count: 0 }))
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.baseUrl}/mark-all-read`, {}).pipe(
      catchError(() => of(null))
    );
  }

  markAsRead(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/read`, {}).pipe(
      catchError(() => of(null))
    );
  }
}
