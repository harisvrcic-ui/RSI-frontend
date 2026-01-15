import {Component} from '@angular/core';
import {Location} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-admin-error-page',
  templateUrl: './admin-error-page.component.html',
  styleUrl: './admin-error-page.component.css',
  standalone: false
})
export class AdminErrorPageComponent {

  constructor(
    private location: Location,
    private router: Router
  ) {}

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  goBack(): void {
    this.location.back();
  }
}
