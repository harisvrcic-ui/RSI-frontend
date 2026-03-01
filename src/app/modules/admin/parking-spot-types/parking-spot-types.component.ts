import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  ParkingSpotTypeGetAllEndpointService,
  ParkingSpotTypeGetAllRequest,
  ParkingSpotTypeGetAllResponse
} from '../../../endpoints/parking-spot-types-endpoints/parking-spot-types-get-all-endpoint.service';
import { ParkingSpotTypeGetByIdEndpointService } from '../../../endpoints/parking-spot-types-endpoints/parking-spot-types-get-by-id-endpoint.service';
import { ParkingSpotTypeUpdateOrInsertEndpointService, ParkingSpotTypeUpdateOrInsertRequest } from '../../../endpoints/parking-spot-types-endpoints/parking-spot-types-update-or-insert-endpoint.service';
import { ParkingSpotTypeDeleteEndpointService } from '../../../endpoints/parking-spot-types-endpoints/parking-spot-types-delete-endpoint.service';
import { MyDialogConfirmComponent } from '../../shared/dialogs/my-dialog-confirm/my-dialog-confirm.component';

@Component({
  selector: 'app-parking-spot-type',
  templateUrl: './parking-spot-types.component.html',
  styleUrls: ['./parking-spot-types.component.css'],
  standalone: false
})
export class ParkingSpotTypeComponent implements OnInit {
  spotTypes: ParkingSpotTypeGetAllResponse[] = [];
  spotTypeForm: FormGroup;
  editId: number | null = null;

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  searchQuery = '';
  isLoading = false;
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private getAllService: ParkingSpotTypeGetAllEndpointService,
    private getByIdService: ParkingSpotTypeGetByIdEndpointService,
    private saveService: ParkingSpotTypeUpdateOrInsertEndpointService,
    private deleteService: ParkingSpotTypeDeleteEndpointService,
    private dialog: MatDialog
  ) {
    this.spotTypeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      priceMultiplier: [1, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadSpotTypes();
  }

  loadSpotTypes(page: number = 1, pageSize: number = this.pageSize): void {
    this.isLoading = true;
    const request: ParkingSpotTypeGetAllRequest = {
      pageNumber: page,
      pageSize: pageSize,
      q: this.searchQuery || undefined
    };
    this.getAllService.handleAsync(request).subscribe({
      next: res => {
        this.spotTypes = res.dataItems ?? [];
        this.totalCount = res.totalCount;
        this.currentPage = res.currentPage ?? page;
        this.pageSize = res.pageSize ?? pageSize;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize) || 1;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  refreshSpotTypes(): void {
    this.loadSpotTypes(this.currentPage, this.pageSize);
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.loadSpotTypes(1, this.pageSize);
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.loadSpotTypes(page, this.pageSize);
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
  editSpotType(id: number) {
    this.getByIdService.handleAsync(id).subscribe(res => {
      this.editId = res.id;
      this.spotTypeForm.patchValue({
        name: res.name,
        description: res.description,
        priceMultiplier: res.priceMultiplier
      });
    });
  }

  saveSpotType() {
    if (this.spotTypeForm.invalid) return;

    const request: ParkingSpotTypeUpdateOrInsertRequest = {
      id: this.editId || undefined,
      ...this.spotTypeForm.value
    };

    this.saveService.handleAsync(request).subscribe(() => {
      this.spotTypeForm.reset({ priceMultiplier: 1 });
      this.editId = null;
      this.loadSpotTypes(this.currentPage, this.pageSize);
    });
  }

  deleteSpotType(id: number): void {
    this.deleteService.handleAsync(id).subscribe(() => {
      if (this.spotTypes.length === 1 && this.currentPage > 1) this.currentPage--;
      this.loadSpotTypes(this.currentPage, this.pageSize);
    });
  }

  cancelEdit(): void {
    this.spotTypeForm.reset({ priceMultiplier: 1 });
    this.editId = null;
  }

  applyFilter(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value.trim();
    this.currentPage = 1;
    this.loadSpotTypes(1, this.pageSize);
  }

  openDeleteConfirmDialog(id: number): void {
    const dialogRef = this.dialog.open(MyDialogConfirmComponent, {
      width: '450px',
      data: { title: 'Confirm Delete', message: 'Are you sure you want to delete this parking spot type?', confirmButtonText: 'Delete' }
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.deleteSpotType(id); });
  }
}
