import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MyAuthService } from '../../../services/auth-services/my-auth.service';
import { ParkingSpotsGetAllEndpointService, ParkingSpotsGetAllResponse } from '../../../endpoints/parking-spot-endpoints/parking-spot-get-all-endpoint.service';
import { ReservationTypeGetAllEndpointService, ReservationTypeGetAllResponse } from '../../../endpoints/reservation-types-endpoints/reservation-type-get-all-endpoint.service';
import { CarsGetAllEndpointService, CarsGetAllResponse } from '../../../endpoints/car-endpoints/car-get-all-endpoint.service';
import {
  ReservationsUpdateOrInsertEndpointService,
  ReservationsUpdateOrInsertRequest
} from '../../../endpoints/reservation-endpoints/reservation-update-or-insert-endpoint.service';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.css',
  standalone: false
})
export class ReservationComponent implements OnInit {
  form: FormGroup;
  cars: CarsGetAllResponse[] = [];
  parkingSpots: ParkingSpotsGetAllResponse[] = [];
  reservationTypes: ReservationTypeGetAllResponse[] = [];
  isLoading = false;
  isLoadingSubmit = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  /** True when opened from admin reservations (Add new reservation); Back/Cancel should return to admin. */
  private fromAdmin = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: MyAuthService,
    private carsService: CarsGetAllEndpointService,
    private parkingSpotsService: ParkingSpotsGetAllEndpointService,
    private reservationTypesService: ReservationTypeGetAllEndpointService,
    private reservationSaveService: ReservationsUpdateOrInsertEndpointService
  ) {
    const nav = this.router.getCurrentNavigation();
    this.fromAdmin = (nav?.extras?.state as { fromAdmin?: boolean })?.fromAdmin === true;
    const now = new Date();
    const startStr = ReservationComponent.toDatetimeLocal(now);
    const endDefault = new Date(now.getTime() + 60 * 60 * 1000);
    const endStr = ReservationComponent.toDatetimeLocal(endDefault);
    this.form = this.fb.group({
      carID: [null as number | null, Validators.required],
      parkingSpotID: [null as number | null, Validators.required],
      reservationTypeID: [null as number | null, Validators.required],
      startDate: [startStr, Validators.required],
      endDate: [endStr, Validators.required],
      finalPrice: [0, [Validators.required, Validators.min(0)]]
    });
  }

  /** Format za input type="datetime-local": yyyy-MM-ddTHH:mm */
  private static toDatetimeLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${h}:${min}`;
  }

  ngOnInit(): void {
    this.loadCars();
    this.loadParkingSpots();
    this.loadReservationTypes();
    this.setupPriceCalculation();
  }

  private loadCars(): void {
    const userId = this.authService.getMyAuthInfo()?.userId;
    this.carsService.handleAsync({
      pageNumber: 1,
      pageSize: 200,
      isActive: true,
      ...(userId != null ? { userId } : {})
    }).subscribe({
      next: (res) => {
        this.cars = res.dataItems ?? [];
      },
      error: () => {
        this.cars = [];
      }
    });
  }

  private loadParkingSpots(): void {
    this.parkingSpotsService.handleAsync({ pageNumber: 1, pageSize: 500, isActive: true }).subscribe({
      next: (res) => {
        this.parkingSpots = res.dataItems ?? [];
      },
      error: () => {
        this.parkingSpots = [];
      }
    });
  }

  private loadReservationTypes(): void {
    this.reservationTypesService.handleAsync({ pageNumber: 1, pageSize: 50 }).subscribe({
      next: (res) => {
        this.reservationTypes = res.dataItems ?? [];
      },
      error: () => {
        this.reservationTypes = [];
      }
    });
  }

  private setupPriceCalculation(): void {
    const typeControl = this.form.get('reservationTypeID');
    const startControl = this.form.get('startDate');
    const endControl = this.form.get('endDate');

    const updatePrice = () => {
      const typeId = typeControl?.value;
      const start = startControl?.value;
      const end = endControl?.value;
      if (!typeId || !start || !end) return;
      const type = this.reservationTypes.find(t => t.id === typeId);
      if (!type) return;
      const startDate = new Date(start);
      const endDate = new Date(end);
      const hours = Math.max(0, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
      const price = type.price * Math.ceil(hours) || type.price;
      this.form.patchValue({ finalPrice: price }, { emitEvent: false });
    };

    typeControl?.valueChanges.subscribe(updatePrice);
    startControl?.valueChanges.subscribe(updatePrice);
    endControl?.valueChanges.subscribe(updatePrice);
  }

  onSubmit(): void {
    if (this.form.invalid || this.isLoadingSubmit) return;
    this.errorMessage = null;
    this.successMessage = null;
    this.isLoadingSubmit = true;

    const v = this.form.value;
    const request: ReservationsUpdateOrInsertRequest = {
      carID: v.carID,
      parkingSpotID: v.parkingSpotID,
      reservationTypeID: v.reservationTypeID,
      startDate: new Date(v.startDate).toISOString(),
      endDate: new Date(v.endDate).toISOString(),
      finalPrice: Number(v.finalPrice)
    };

    this.reservationSaveService.handleAsync(request).subscribe({
      next: () => {
        this.successMessage = 'CLIENT.RESERVATION_SUCCESS';
        const now = new Date();
this.form.reset({
  carID: null,
  parkingSpotID: null,
  reservationTypeID: null,
  startDate: ReservationComponent.toDatetimeLocal(now),
  endDate: ReservationComponent.toDatetimeLocal(new Date(now.getTime() + 60 * 60 * 1000)),
  finalPrice: 0
});
        this.isLoadingSubmit = false;
        this.router.navigate(this.fromAdmin ? ['/admin/reservations'] : ['/client/dashboard']);
      },
      error: (err) => {
        const body = err.error;
        const msg = body?.message
          || (Array.isArray(body?.errors) ? body.errors.join(' ') : null)
          || (typeof body?.title === 'string' ? body.title : null)
          || err.message
          || 'CLIENT.RESERVATION_ERROR';
        this.errorMessage = msg;
        this.isLoadingSubmit = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(this.fromAdmin ? ['/admin/reservations'] : ['/']);
  }

  /** Display in select: DisplayName (e.g. Aria mall, Vijećnica, Baščaršija) or fallback to #number (Zone id). */
  getParkingSpotLabel(spot: ParkingSpotsGetAllResponse): string {
    const name = spot.displayName?.trim() || spot.zoneName?.trim();
    if (name) return name;
    return `#${spot.parkingNumber} (Zone ${spot.zoneId})`;
  }
}
