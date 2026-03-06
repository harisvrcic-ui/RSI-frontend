import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MyAuthService } from '../../../services/auth-services/my-auth.service';
import { AuthLogoutEndpointService } from '../../../endpoints/auth-endpoints/auth-logout-endpoint.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
  standalone: false
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  isHandset = false;
  sidebarOpen = true;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: MyAuthService,
    private authLogoutEndpoint: AuthLogoutEndpointService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.isHandset = this.breakpointObserver.isMatched(Breakpoints.Handset);
        if (this.isHandset) this.sidebarOpen = false;
        else this.sidebarOpen = true;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  getUserDisplayName(): string {
    const authInfo = this.authService.getMyAuthInfo();
    if (!authInfo) return '';

    return authInfo.firstName || authInfo.username || '';
  }

  navigateToHome(): void {
    this.router.navigate(['/public/home']);
  }

  logout(): void {
    this.authLogoutEndpoint.handleAsync().subscribe({
      next: () => {
        this.authService.setLoggedInUser(null);
        this.router.navigate(['/public/home']);
      },
      error: () => {
        // Even if logout fails on server, clear local storage (error shown by HTTP interceptor)
        this.authService.setLoggedInUser(null);
        this.router.navigate(['/public/home']);
      }
    });
  }
}
