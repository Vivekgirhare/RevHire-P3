import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .main-content {
      min-height: calc(100vh - 70px);
      background: var(--bg-secondary);
    }
  `]
})
export class AppComponent {
  title = 'RevHire';
}
