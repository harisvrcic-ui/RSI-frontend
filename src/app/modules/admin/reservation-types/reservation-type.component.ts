import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservationTypeGetAllEndpointService, ReservationTypeGetAllResponse } from '../../../endpoints/reservation-types-endpoints/reservation-type-get-all-endpoint.service';
import { ReservationTypeUpdateOrInsertEndpointService, ReservationTypeUpdateOrInsertRequest } from '../../../endpoints/reservation-types-endpoints/reservation-type-update-or-insert-endpoint.service';
import { ReservationTypeDeleteEndpointService } from '../../../endpoints/reservation-types-endpoints/reservation-type-delete-endpoint.service';
import { MyPagedRequest } from '../../../helper/my-paged-request';

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

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private getAllService: ReservationTypeGetAllEndpointService,
    private saveService: ReservationTypeUpdateOrInsertEndpointService,
    private deleteService: ReservationTypeDeleteEndpointService
  ) {
    this.reservationTypeForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],

    });
  }

  ngOnInit(): void {
    this.loadReservationTypes();
  }

  // Load paginated reservation types
  loadReservationTypes(page: number = 1, pageSize: number = 10) {
    const request: MyPagedRequest = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };
    this.isLoading = true;
    this.getAllService.handleAsync(request).subscribe({
      next: (res) => {
        this.reservationTypes = res.dataItems; // MyPagedList -> dataItems
        this.totalCount = res.totalCount;
        this.totalPages = res.totalPages;
        this.currentPage = res.currentPage;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading reservation types:', err);
        this.isLoading = false;
      }
    });
  }

  // Pagination helpers
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
        this.reservationTypeForm.reset({ isActive: true, price: 0 });
        this.editId = null;
        this.loadReservationTypes(this.currentPage, this.pageSize);
      },
      error: (err) => {
        console.error('Error saving reservation type:', err);
      }
    });
  }

  deleteReservationType(id: number) {
    if (!confirm('Are you sure you want to delete this reservation type?')) return;

    this.deleteService.handleAsync(id).subscribe({
      next: () => {
        if (this.reservationTypes.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.loadReservationTypes(this.currentPage, this.pageSize);
      },
      error: (err) => {
        console.error('Error deleting reservation type:', err);
      }
    });
  }

  cancelEdit() {
    this.reservationTypeForm.reset({ isActive: true, price: 0 });
    this.editId = null;
  }
}
