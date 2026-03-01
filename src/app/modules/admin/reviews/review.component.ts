import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ReviewsGetAllEndpointService, ReviewsGetAllResponse, ReviewsGetAllRequest } from '../../../endpoints/review-endpoints/review-get-all-endpoint.service';
import { ReviewsGetByIdEndpointService } from '../../../endpoints/review-endpoints/review-get-by-id-endpoint.service';
import { ReviewsUpdateOrInsertEndpointService, ReviewsUpdateOrInsertRequest } from '../../../endpoints/review-endpoints/review-update-or-insert-endpoint.service';
import { ReviewsDeleteEndpointService } from '../../../endpoints/review-endpoints/review-delete-endpoint.service';
import { MyDialogConfirmComponent } from '../../shared/dialogs/my-dialog-confirm/my-dialog-confirm.component';

@Component({
  selector: 'app-reviews',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css'],
  standalone: false
})
export class ReviewsComponent implements OnInit {
  reviews: ReviewsGetAllResponse[] = [];
  reviewForm: FormGroup;
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
    private getAllService: ReviewsGetAllEndpointService,
    private getByIdService: ReviewsGetByIdEndpointService,
    private saveService: ReviewsUpdateOrInsertEndpointService,
    private deleteService: ReviewsDeleteEndpointService,
    private dialog: MatDialog
  ) {
    this.reviewForm = this.fb.group({
      userId: [1, Validators.required],
      reservationId: [1, Validators.required],
      rating: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(page: number = 1, pageSize: number = this.pageSize): void {
    this.isLoading = true;
    const request: ReviewsGetAllRequest = {
      pageNumber: page,
      pageSize: pageSize,
      q: this.searchQuery || undefined
    };
    this.getAllService.handleAsync(request).subscribe({
      next: res => {
        this.reviews = res.dataItems ?? [];
        this.totalCount = res.totalCount;
        this.currentPage = res.currentPage ?? page;
        this.pageSize = res.pageSize ?? pageSize;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize) || 1;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  refreshReviews(): void {
    this.loadReviews(this.currentPage, this.pageSize);
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.loadReviews(1, this.pageSize);
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.loadReviews(page, this.pageSize);
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
  editReview(id: number) {
    this.getByIdService.handleAsync(id).subscribe(res => {
      this.editId = res.id;
      this.reviewForm.patchValue({
        userId: res.userId,
        reservationId: res.reservationId,
        rating: res.rating,
        comment: res.comment
      });
    });
  }

  saveReview() {
    if (this.reviewForm.invalid) return;

    const request: ReviewsUpdateOrInsertRequest = {
      id: this.editId || undefined,
      ...this.reviewForm.value
    };

    this.saveService.handleAsync(request).subscribe(() => {
      this.reviewForm.reset({ userId: 1, reservationId: 1, rating: 1, comment: '' });
      this.editId = null;
      this.loadReviews(this.currentPage, this.pageSize);
    });
  }

  deleteReview(id: number): void {
    this.deleteService.handleAsync(id).subscribe(() => {
      if (this.reviews.length === 1 && this.currentPage > 1) this.currentPage--;
      this.loadReviews(this.currentPage, this.pageSize);
    });
  }

  cancelEdit(): void {
    this.reviewForm.reset({ userId: 1, reservationId: 1, rating: 1, comment: '' });
    this.editId = null;
  }

  applyFilter(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value.trim();
    this.currentPage = 1;
    this.loadReviews(1, this.pageSize);
  }

  openDeleteConfirmDialog(id: number): void {
    const dialogRef = this.dialog.open(MyDialogConfirmComponent, {
      width: '450px',
      data: { title: 'Confirm Delete', message: 'Are you sure you want to delete this review?', confirmButtonText: 'Delete' }
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.deleteReview(id); });
  }
}
