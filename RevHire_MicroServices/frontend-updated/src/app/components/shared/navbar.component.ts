import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="nav-brand">
          <span class="brand-icon">⚡</span>
          <span class="brand-text">Rev<span class="brand-accent">Hire</span></span>
        </a>

        <div class="nav-links">
          <a routerLink="/jobs" routerLinkActive="active" class="nav-link">Find Jobs</a>

          <ng-container *ngIf="isJobSeeker">
            <a routerLink="/seeker/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
            <a routerLink="/seeker/applications" routerLinkActive="active" class="nav-link">Applications</a>
            <a routerLink="/seeker/saved-jobs" routerLinkActive="active" class="nav-link">Saved Jobs</a>
          </ng-container>

          <ng-container *ngIf="isEmployer">
            <a routerLink="/employer/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
            <a routerLink="/employer/jobs" routerLinkActive="active" class="nav-link">My Jobs</a>
            <a routerLink="/employer/post-job" routerLinkActive="active" class="nav-link btn-post">+ Post Job</a>
          </ng-container>
        </div>

        <div class="nav-actions">
          <ng-container *ngIf="isLoggedIn; else guestNav">
            <div class="notification-btn" (click)="toggleNotifications()">
              <span class="bell-icon">🔔</span>
              <span *ngIf="unreadCount > 0" class="badge">{{unreadCount}}</span>
            </div>

            <div class="user-menu" (click)="toggleUserMenu()">
              <div class="avatar">{{userInitial}}</div>
              <span class="user-name">{{userName}}</span>
              <span class="chevron">▾</span>
            </div>

            <div *ngIf="showUserMenu" class="dropdown">
              <a *ngIf="isJobSeeker" routerLink="/seeker/profile" class="dropdown-item" (click)="showUserMenu=false">👤 My Profile</a>
              <a *ngIf="isEmployer" routerLink="/employer/company" class="dropdown-item" (click)="showUserMenu=false">🏢 Company Profile</a>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item text-danger" (click)="logout()">🚪 Logout</button>
            </div>

            <div *ngIf="showNotifications" class="notifications-panel">
              <div class="notif-header">
                <span>Notifications</span>
                <button (click)="markAllRead()" class="mark-read-btn">Mark all read</button>
              </div>
              <div class="notif-list">
                <div *ngFor="let n of notifications"
                     class="notif-item"
                     [class.unread]="!n.read"
                     (click)="markRead(n)">
                  <div class="notif-title">{{n.title}}</div>
                  <div class="notif-msg">{{n.message}}</div>
                  <div class="notif-time">{{n.createdAt | date:'short'}}</div>
                </div>
                <div *ngIf="notifications.length === 0" class="notif-empty">No notifications</div>
              </div>
            </div>
          </ng-container>

          <ng-template #guestNav>
            <a routerLink="/login" class="btn btn-outline">Login</a>
            <a routerLink="/register" class="btn btn-primary">Sign Up</a>
          </ng-template>
        </div>
      </div>
    </nav>
    <div *ngIf="showNotifications || showUserMenu" class="overlay" (click)="closeAll()"></div>
  `,
  styles: [`
    .navbar {
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-color);
      height: 70px;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }
    .nav-container {
      max-width: 1300px;
      margin: 0 auto;
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 24px;
      gap: 32px;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      font-size: 22px;
      font-weight: 800;
      color: var(--text-primary);
    }
    .brand-icon { font-size: 20px; }
    .brand-accent { color: var(--accent-primary); }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
    }
    .nav-link {
      padding: 8px 14px;
      border-radius: 8px;
      text-decoration: none;
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s;
    }
    .nav-link:hover, .nav-link.active { background: var(--bg-secondary); color: var(--accent-primary); }
    .btn-post {
      background: var(--accent-primary);
      color: white !important;
      padding: 8px 16px;
      border-radius: 8px;
    }
    .btn-post:hover { background: var(--accent-dark); color: white !important; }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
    }
    .notification-btn {
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      cursor: pointer;
      background: var(--bg-secondary);
      font-size: 18px;
    }
    .notification-btn:hover { background: var(--border-color); }
    .badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background: #ef4444;
      color: white;
      border-radius: 10px;
      font-size: 10px;
      min-width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      padding: 0 3px;
    }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
    }
    .user-menu:hover { background: var(--bg-secondary); }
    .avatar {
      width: 32px;
      height: 32px;
      background: var(--accent-primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
    }
    .user-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
    .chevron { font-size: 10px; color: var(--text-secondary); }
    .dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 8px;
      min-width: 180px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      z-index: 1001;
    }
    .dropdown-item {
      display: block;
      padding: 10px 12px;
      border-radius: 8px;
      text-decoration: none;
      color: var(--text-primary);
      font-size: 14px;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
    }
    .dropdown-item:hover { background: var(--bg-secondary); }
    .dropdown-divider { border: none; border-top: 1px solid var(--border-color); margin: 6px 0; }
    .text-danger { color: #ef4444 !important; }
    .notifications-panel {
      position: absolute;
      top: calc(100% + 8px);
      right: 50px;
      width: 360px;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
      z-index: 1001;
      overflow: hidden;
    }
    .notif-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
      font-weight: 700;
      font-size: 15px;
    }
    .mark-read-btn {
      background: none;
      border: none;
      color: var(--accent-primary);
      font-size: 13px;
      cursor: pointer;
      font-weight: 500;
    }
    .notif-list { max-height: 400px; overflow-y: auto; }
    .notif-item {
      padding: 14px 20px;
      border-bottom: 1px solid var(--border-color);
      cursor: pointer;
      transition: background 0.15s;
    }
    .notif-item:hover { background: var(--bg-secondary); }
    .notif-item.unread { background: rgba(59, 130, 246, 0.05); border-left: 3px solid var(--accent-primary); }
    .notif-title { font-weight: 600; font-size: 13px; color: var(--text-primary); margin-bottom: 4px; }
    .notif-msg { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
    .notif-time { font-size: 11px; color: var(--text-tertiary); }
    .notif-empty { padding: 30px; text-align: center; color: var(--text-secondary); font-size: 14px; }
    .overlay {
      position: fixed;
      inset: 0;
      z-index: 999;
    }
    .btn { padding: 9px 20px; border-radius: 9px; font-size: 14px; font-weight: 600; text-decoration: none; cursor: pointer; }
    .btn-outline { border: 1.5px solid var(--border-color); color: var(--text-primary); }
    .btn-outline:hover { border-color: var(--accent-primary); color: var(--accent-primary); }
    .btn-primary { background: var(--accent-primary); color: white; border: none; }
    .btn-primary:hover { background: var(--accent-dark); }
  `]
})
export class NavbarComponent implements OnInit {
  showUserMenu = false;
  showNotifications = false;
  notifications: any[] = [];
  unreadCount = 0;

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.isLoggedIn) {
      this.loadNotifications();
    }
  }

  get isLoggedIn() { return this.authService.isLoggedIn(); }
  get isJobSeeker() { return this.authService.isJobSeeker(); }
  get isEmployer() { return this.authService.isEmployer(); }
  get userName() { return this.authService.currentUser?.name || ''; }
  get userInitial() { return this.userName.charAt(0).toUpperCase(); }

  loadNotifications() {
    this.notificationService.getNotifications().subscribe(n => {
      this.notifications = n;
       console.log("RAW NOTIFICATIONS RESPONSE:", n);
      this.unreadCount = n.filter(x => !x.read).length;
    });
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
    if (this.showNotifications) this.loadNotifications();
  }

  closeAll() {
    this.showUserMenu = false;
    this.showNotifications = false;
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe(() => this.loadNotifications());
  }

  markRead(n: any) {
    if (!n.read) {
      this.notificationService.markAsRead(n.id).subscribe(() => {
        n.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      });
    }
  }

  logout() {
    this.authService.logout();
    this.showUserMenu = false;
  }
}
