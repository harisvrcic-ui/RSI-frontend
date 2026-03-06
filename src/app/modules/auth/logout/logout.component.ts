import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {MyConfig} from '../../../my-config';
import {MyAuthService} from '../../../services/auth-services/my-auth.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css'],
  standalone: false
})
export class LogoutComponent implements OnInit {
  private apiUrl = `${MyConfig.api_address}/auth/logout`;

  constructor(
    private httpClient: HttpClient,
    private authService: MyAuthService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.logout();
  }

  logout(): void {
    this.httpClient.post<void>(this.apiUrl, {}).subscribe({
      next: () => this.handleLogoutSuccessOrError(),
      error: () => {
        this.handleLogoutSuccessOrError();
      }
    });
  }

  // Shared method to clear token and redirect
  private handleLogoutSuccessOrError(): void {
    this.authService.setLoggedInUser(null);
    setTimeout(() => {
      this.router.navigate(['/auth/login']); // Redirect to login after 3 seconds
    }, 3000);
  }
}
