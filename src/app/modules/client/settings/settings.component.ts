import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MyAuthService } from '../../../services/auth-services/my-auth.service';

@Component({
  selector: 'app-client-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
  standalone: false
})
export class ClientSettingsComponent {
  constructor(
    public translate: TranslateService,
    public authService: MyAuthService
  ) {}

  getDisplayName(): string {
    const info = this.authService.getMyAuthInfo();
    if (!info) return '';
    return [info.firstName, info.lastName].filter(Boolean).join(' ') || info.username;
  }

  getUsername(): string {
    return this.authService.getMyAuthInfo()?.username ?? '';
  }

  getRole(): string {
    const info = this.authService.getMyAuthInfo();
    if (!info) return '';
    if (info.isAdmin) return 'Admin';
    if (info.isUser) return 'User';
    return '';
  }

  setLanguage(lang: string): void {
    this.translate.use(lang);
  }

  getCurrentLang(): string {
    return this.translate.currentLang || 'en';
  }
}
