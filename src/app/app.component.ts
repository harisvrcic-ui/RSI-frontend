import {Component, HostListener, OnInit, OnDestroy} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Router, NavigationEnd} from '@angular/router';
import {filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {MyAuthService} from './services/auth-services/my-auth.service';
import {AuthLoginEndpointService} from './endpoints/auth-endpoints/auth-login-endpoint.service';
import {AuthLogoutEndpointService} from './endpoints/auth-endpoints/auth-logout-endpoint.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'eParking';

  /** Sakriva navigaciju na login i ostalim auth stranicama */
  showNavigation = true;
  private routerSub?: Subscription;

  languages = [
    {code: 'en', label: 'English', icon: 'usa.png'},
    {code: 'bs', label: 'Bosanski', icon: 'bih.png'},
    {code: 'sp', label: 'Español', icon: 'spa.png'}
  ];

  currentLanguage = 'en';
  isLanguageDropdownOpen = false;
  isUserDropdownOpen = false;
  mobileMenuOpen = false;

  constructor(
    private translate: TranslateService,
    private router: Router,
    public authService: MyAuthService,
    private authLoginEndpoint: AuthLoginEndpointService,
    private authLogoutEndpoint: AuthLogoutEndpointService
  ) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
    this.currentLanguage = 'en';
  }

  ngOnInit(): void {
    this.updateShowNavigation(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.updateShowNavigation(e.url));
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private updateShowNavigation(url: string): void {
    this.showNavigation = !url.startsWith('/auth');
  }

  changeLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLanguage = lang;
    this.isLanguageDropdownOpen = false;
  }

  selectLanguage(lang: string): void {
    this.changeLanguage(lang);
    this.closeMobileMenu();
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
    if (!target.closest('.navbar') || target.closest('.nav-mobile-close')) {
      this.mobileMenuOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.updateBodyScrollLock();
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    this.updateBodyScrollLock();
  }

  private updateBodyScrollLock(): void {
    if (this.mobileMenuOpen) {
      document.body.classList.add('nav-mobile-open');
    } else {
      document.body.classList.remove('nav-mobile-open');
    }
  }

  // Authentication Methods
  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
    this.closeMobileMenu();
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
    this.closeMobileMenu();
  }

  logout(): void {
    this.closeMobileMenu();
    this.authLogoutEndpoint.handleAsync().subscribe({
      next: () => {
        this.authService.setLoggedInUser(null);
        this.isUserDropdownOpen = false;
        this.router.navigate(['/public/home']);
      },
      error: () => {
        // Even if logout fails on server, clear local storage (error shown by HTTP interceptor)
        this.authService.setLoggedInUser(null);
        this.isUserDropdownOpen = false;
        this.router.navigate(['/public/home']);
      }
    });
  }
}
