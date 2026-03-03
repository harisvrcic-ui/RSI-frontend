import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MyAuthService } from '../../../services/auth-services/my-auth.service';
import {
  ReservationsGetAllEndpointService,
  ReservationsGetAllResponse
} from '../../../endpoints/reservation-endpoints/reservation-get-all-endpoint.service';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: false
})
export class ClientDashboardComponent implements OnInit {
  reservations: ReservationsGetAllResponse[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    public translate: TranslateService,
    private authService: MyAuthService,
    private reservationsService: ReservationsGetAllEndpointService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadMyActiveReservations();
  }

  private loadMyActiveReservations(): void {
    const userId = this.authService.getMyAuthInfo()?.userId;
    if (userId == null) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    this.reservationsService
      .handleAsync({
        pageNumber: 1,
        pageSize: 100,
        userId
        // onlyActive: false = dohvatimo sve rezervacije korisnika (aktivne i prošle)
      })
      .subscribe({
        next: (res) => {
          const raw = res as { dataItems?: ReservationsGetAllResponse[]; DataItems?: ReservationsGetAllResponse[] };
          this.reservations = raw.dataItems ?? raw.DataItems ?? [];
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'CLIENT.DASHBOARD_LOAD_ERROR';
          this.isLoading = false;
        }
      });
  }

  formatDate(value: string): string {
    if (!value) return '';
    const d = new Date(value);
    return d.toLocaleString(this.translate.currentLang || 'en', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  }

  /** Rezervacija je aktivna ako joj kraj (endDate) još nije prošao */
  isActiveReservation(r: ReservationsGetAllResponse): boolean {
    if (!r?.endDate) return false;
    return new Date(r.endDate) >= new Date();
  }

  goToNewReservation(): void {
    this.router.navigate(['/client/reservation']);
  }
}
