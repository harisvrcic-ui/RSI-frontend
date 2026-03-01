import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ReservationTypeGetAllEndpointService, ReservationTypeGetAllResponse, ReservationTypeGetAllRequest } from '../../../endpoints/reservation-types-endpoints/reservation-type-get-all-endpoint.service';
import { ReservationTypeUpdateOrInsertEndpointService, ReservationTypeUpdateOrInsertRequest } from '../../../endpoints/reservation-types-endpoints/reservation-type-update-or-insert-endpoint.service';
import { ReservationTypeDeleteEndpointService } from '../../../endpoints/reservation-types-endpoints/reservation-type-delete-endpoint.service';
import { MyDialogConfirmComponent } from '../../shared/dialogs/my-dialog-confirm/my-dialog-confirm.component';

@Component({
  selector: 'app-reservation-type',
  templateUrl: './reservation-type.component.html',
  styleUrls: ['./reservation-type.component.css'],
  standalone: false
})
export class ReservationTypeComponent implements OnInit {
  reservationTypes: ReservationTypeGetAllResponse[] = [];
  reservationTypeForm: FormGroup;
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
    private getAllService: ReservationTypeGetAllEndpointService,
    private saveService: ReservationTypeUpdateOrInsertEndpointService,
    private deleteService: ReservationTypeDeleteEndpointService,
    private dialog: MatDialog
  ) {
    this.reservationTypeForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],

    });
  }

  ngOnInit(): void {
    this.loadReservationTypes();
  }

  loadReservationTypes(page: number = 1, pageSize: number = this.pageSize): void {
    const request: ReservationTypeGetAllRequest = {
      pageNumber: page,
      pageSize: pageSize,
      q: this.searchQuery || undefined
    };
    this.isLoading = true;
    this.getAllService.handleAsync(request).subscribe({
      next: (res) => {
        this.reservationTypes = res.dataItems ?? [];
        this.totalCount = res.totalCount;
        this.currentPage = res.currentPage ?? page;
        this.pageSize = res.pageSize ?? pageSize;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize) || 1;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  refreshReservationTypes(): void {
    this.loadReservationTypes(this.currentPage, this.pageSize);
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.loadReservationTypes(1, this.pageSize);
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadReservationTypes(page, this.pageSize);
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

  // CRUD operations
  editReservationType(id: number) {
    const type = this.reservationTypes.find(t => t.id === id);
    if (!type) return;

    this.editId = type.id;
    this.reservationTypeForm.patchValue({
      name: type.name,
      price: type.price,

    });
  }

  saveReservationType() {
    if (this.reservationTypeForm.invalid) return;

    const request: ReservationTypeUpdateOrInsertRequest = {
      id: this.editId || undefined,
      ...this.reservationTypeForm.value
    };

    this.saveService.handleAsync(request).subscribe({
      next: () => {
        this.reservationTypeForm.reset({ name: '', price: 0 });
        this.editId = null;
        this.loadReservationTypes(this.currentPage, this.pageSize);
      },
      error: (err) => {
        console.error('Error saving reservation type:', err);
      }
    });
  }

  deleteReservationType(id: number): void {
    this.deleteService.handleAsync(id).subscribe({
      next: () => {
        if (this.reservationTypes.length === 1 && this.currentPage > 1) this.currentPage--;
        this.loadReservationTypes(this.currentPage, this.pageSize);
      },
      error: () => {}
    });
  }

  cancelEdit(): void {
    this.reservationTypeForm.reset({ name: '', price: 0 });
    this.editId = null;
  }

  applyFilter(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value.trim();
    this.currentPage = 1;
    this.loadReservationTypes(1, this.pageSize);
  }

  openDeleteConfirmDialog(id: number): void {
    const dialogRef = this.dialog.open(MyDialogConfirmComponent, {
      width: '450px',
      data: { title: 'Confirm Delete', message: 'Are you sure you want to delete this reservation type?', confirmButtonText: 'Delete' }
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.deleteReservationType(id); });
  }
}
