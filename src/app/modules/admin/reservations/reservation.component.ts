import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ReservationsGetAllEndpointService, ReservationsGetAllResponse, ReservationsGetAllRequest } from '../../../endpoints/reservation-endpoints/reservation-get-all-endpoint.service';
import { ReservationsGetByIdEndpointService } from '../../../endpoints/reservation-endpoints/reservation-get-by-id-endpoint.service';
import { ReservationsUpdateOrInsertEndpointService, ReservationsUpdateOrInsertRequest } from '../../../endpoints/reservation-endpoints/reservation-update-or-insert-endpoint.service';
import { ReservationsDeleteEndpointService } from '../../../endpoints/reservation-endpoints/reservation-delete-endpoint.service';
import { MyDialogConfirmComponent } from '../../shared/dialogs/my-dialog-confirm/my-dialog-confirm.component';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css'],
  standalone: false
})
export class ReservationsComponent implements OnInit {
  reservations: ReservationsGetAllResponse[] = [];
  reservationForm: FormGroup;
  editId: number | null = null;

  currentPage = 1;
  pageSize = 25;
  totalCount = 0;
  totalPages = 0;
  searchQuery = '';
  isLoading = false;
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private getAllService: ReservationsGetAllEndpointService,
    private getByIdService: ReservationsGetByIdEndpointService,
    private saveService: ReservationsUpdateOrInsertEndpointService,
    private deleteService: ReservationsDeleteEndpointService,
    private dialog: MatDialog
  ) {
    this.reservationForm = this.fb.group({
      carID: [1, Validators.required],
      parkingSpotID: [1, Validators.required],
      reservationTypeID: [1, Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      finalPrice: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(page: number = 1, pageSize: number = this.pageSize): void {
    this.isLoading = true;
    const request: ReservationsGetAllRequest = {
      pageNumber: page,
      pageSize: pageSize,
      q: this.searchQuery || undefined
    };
    this.getAllService.handleAsync(request).subscribe({
      next: res => {
        this.reservations = res.dataItems ?? [];
        this.totalCount = res.totalCount;
        this.currentPage = res.currentPage ?? page;
        this.pageSize = res.pageSize ?? pageSize;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize) || 1;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  refreshReservations(): void {
    this.loadReservations(this.currentPage, this.pageSize);
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.loadReservations(1, this.pageSize);
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.loadReservations(page, this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(5, this.totalPages);
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));

    if (startPage + maxPages - 1 > this.totalPages) {
      startPage = Math.max(1, this.totalPages - maxPages + 1);
    }

    for (let i = 0; i < maxPages && startPage + i <= this.totalPages; i++) {
      pages.push(startPage + i);
    }

    return pages;
  }

  // CRUD
  editReservation(id: number) {
    this.getByIdService.handleAsync(id).subscribe(res => {
      this.editId = res.id;
      this.reservationForm.patchValue({
        carID: res.carID,
        parkingSpotID: res.parkingSpotID,
        reservationTypeID: res.reservationTypeID,
        startDate: res.startDate,
        endDate: res.endDate,
        finalPrice: res.finalPrice
      });
    });
  }

  saveReservation() {
    if (this.reservationForm.invalid) return;

    const request: ReservationsUpdateOrInsertRequest = {
      id: this.editId || undefined,
      ...this.reservationForm.value
    };

    this.saveService.handleAsync(request).subscribe(() => {
      this.reservationForm.reset({ carID: 1, parkingSpotID: 1, reservationTypeID: 1, finalPrice: 0 });
      this.editId = null;
      this.loadReservations(this.currentPage, this.pageSize);
    });
  }

  deleteReservation(id: number): void {
    this.deleteService.handleAsync(id).subscribe(() => {
      if (this.reservations.length === 1 && this.currentPage > 1) this.currentPage--;
      this.loadReservations(this.currentPage, this.pageSize);
    });
  }

  cancelEdit(): void {
    this.reservationForm.reset({ carID: 1, parkingSpotID: 1, reservationTypeID: 1, finalPrice: 0 });
    this.editId = null;
  }

  applyFilter(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value.trim();
    this.currentPage = 1;
    this.loadReservations(1, this.pageSize);
  }

  openDeleteConfirmDialog(id: number): void {
    const dialogRef = this.dialog.open(MyDialogConfirmComponent, {
      width: '450px',
      data: { title: 'Confirm Delete', message: 'Are you sure you want to delete this reservation?', confirmButtonText: 'Delete' }
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.deleteReservation(id); });
  }
}
