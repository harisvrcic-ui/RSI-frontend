import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthLoginEndpointService} from '../../../endpoints/auth-endpoints/auth-login-endpoint.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MyInputTextType} from '../../shared/my-reactive-forms/my-input-text/my-input-text.component';
import {MyAuthService} from '../../../services/auth-services/my-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false,
})
export class LoginComponent {
  form: FormGroup;
  protected readonly MyInputTextType = MyInputTextType;

  constructor(
    private fb: FormBuilder, 
    private authLoginService: AuthLoginEndpointService, 
    private router: Router,
    private authService: MyAuthService
  ) {
    this.form = this.fb.group({
      username: ['admin', [Validators.required, Validators.min(2), Validators.max(15)]],
      password: ['admin', [Validators.required, Validators.min(2), Validators.max(30)]],
    });
  }

  onLogin(): void {
    if (this.form.invalid) return;

    this.authLoginService.handleAsync(this.form.value).subscribe({
      next: (response) => {
        // Store the login token
        this.authService.setLoggedInUser(response);
        // Redirect to home page
        this.router.navigate(['/public/home']);
      },
      error: () => {
        // Error shown by HTTP interceptor
      }
    });
  }
}
