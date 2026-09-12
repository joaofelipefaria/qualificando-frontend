import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { PartnersSplashComponent } from './features/marketing/partners-splash/partners-splash.component';

const SPLASH_SESSION_KEY = 'qualificando.partnersSplashShown';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, RouterOutlet, PartnersSplashComponent],
  template: `
    <app-partners-splash *ngIf="showSplash()" (closed)="dismissSplash()"></app-partners-splash>
    <router-outlet *ngIf="!showSplash()"></router-outlet>
  `
})
export class AppComponent implements OnInit {
  private titleService = inject(Title);
  private translate = inject(TranslateService);

  // Shown once per browser session, right when the app opens, before
  // anything else (dashboard/talentos/courses) is rendered underneath it.
  showSplash = signal(!sessionStorage.getItem(SPLASH_SESSION_KEY));

  ngOnInit(): void {
    this.translate.get('app.title').subscribe(title => this.titleService.setTitle(title));
  }

  dismissSplash(): void {
    sessionStorage.setItem(SPLASH_SESSION_KEY, '1');
    this.showSplash.set(false);
  }
}
