import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {MyAuthService} from '../../../services/auth-services/my-auth.service';
import {AuthLogoutEndpointService} from '../../../endpoints/auth-endpoints/auth-logout-endpoint.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
  standalone: false
})
export class AdminLayoutComponent {

  constructor(
    private router: Router,
    private authService: MyAuthService,
    private authLogoutEndpoint: AuthLogoutEndpointService
  ) {}

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
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout fails on server, clear local storage
        this.authService.setLoggedInUser(null);
        this.router.navigate(['/public/home']);
      }
    });
  }
}
