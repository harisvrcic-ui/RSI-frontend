import {Component, HostListener} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {MyAuthService} from './services/auth-services/my-auth.service';
import {AuthLoginEndpointService} from './endpoints/auth-endpoints/auth-login-endpoint.service';
import {AuthLogoutEndpointService} from './endpoints/auth-endpoints/auth-logout-endpoint.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: false
})
export class AppComponent {
  title = 'eParking';

  languages = [
    {code: 'en', label: 'English', icon: 'usa.png'},
    {code: 'bs', label: 'Bosanski', icon: 'bih.png'},
    {code: 'sp', label: 'Español', icon: 'spa.png'}
  ];

  currentLanguage = 'en';
  isLanguageDropdownOpen = false;
  isUserDropdownOpen = false;

  constructor(
    private translate: TranslateService,
    private router: Router,
    public authService: MyAuthService,
    private authLoginEndpoint: AuthLoginEndpointService,
    private authLogoutEndpoint: AuthLogoutEndpointService
  ) {
    // Set default language to English
    this.translate.setDefaultLang('en');
    this.translate.use('en');
    this.currentLanguage = 'en';
  }

  changeLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLanguage = lang;
    this.isLanguageDropdownOpen = false;
  }

  selectLanguage(lang: string): void {
    this.changeLanguage(lang);
  }

  toggleLanguageDropdown(): void {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  getCurrentLanguageIcon(): string {
    const lang = this.languages.find(l => l.code === this.currentLanguage);
    return lang ? lang.icon : 'usa.png';
  }

  getCurrentLanguageLabel(): string {
    const lang = this.languages.find(l => l.code === this.currentLanguage);
    return lang ? lang.label : 'English';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.language-selector')) {
      this.isLanguageDropdownOpen = false;
    }
    if (!target.closest('.auth-section')) {
      this.isUserDropdownOpen = false;
    }
  }

  // Authentication Methods
  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  getUserInitials(): string {
    const authInfo = this.authService.getMyAuthInfo();
    if (!authInfo) return '';

    const firstName = authInfo.firstName || '';
    const lastName = authInfo.lastName || '';

    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getUserDisplayName(): string {
    const authInfo = this.authService.getMyAuthInfo();
    if (!authInfo) return '';

    return authInfo.firstName || authInfo.username || '';
  }

  getUserFullName(): string {
    const authInfo = this.authService.getMyAuthInfo();
    if (!authInfo) return '';

    return `${authInfo.firstName} ${authInfo.lastName}`.trim() || authInfo.username;
  }

  getUserRole(): string {
    const authInfo = this.authService.getMyAuthInfo();
    if (!authInfo) return '';

    if (authInfo.isAdmin) {
      return 'Admin';
    } else if (authInfo.isUser) {
      return 'User';
    }
    return 'Guest';
  }

  isAdmin(): boolean {
    const authInfo = this.authService.getMyAuthInfo();
    return authInfo?.isAdmin || false;
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
    this.isUserDropdownOpen = false;
  }

  logout(): void {
    this.authLogoutEndpoint.handleAsync().subscribe({
      next: () => {
        this.authService.setLoggedInUser(null);
        this.isUserDropdownOpen = false;
        this.router.navigate(['/public/home']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout fails on server, clear local storage
        this.authService.setLoggedInUser(null);
        this.isUserDropdownOpen = false;
        this.router.navigate(['/public/home']);
      }
    });
  }
}
