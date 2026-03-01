import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  ParkingSpotsGetAllEndpointService,
  ParkingSpotsGetAllRequest,
  ParkingSpotsGetAllResponse
} from '../../../endpoints/parking-spot-endpoints/parking-spot-get-all-endpoint.service';
import { ParkingSpotsGetByIdEndpointService } from '../../../endpoints/parking-spot-endpoints/parking-spot-get-by-id-endpoint.service';
import { ParkingSpotsUpdateOrInsertEndpointService, ParkingSpotsUpdateOrInsertRequest } from '../../../endpoints/parking-spot-endpoints/parking-spot-update-or-insert-endpoint.service';
import { ParkingSpotsDeleteEndpointService } from '../../../endpoints/parking-spot-endpoints/parking-spot-delete-endpoint.service';
import { MyDialogConfirmComponent } from '../../shared/dialogs/my-dialog-confirm/my-dialog-confirm.component';

@Component({
  selector: 'app-parking-spots',
  templateUrl: './parking-spot.component.html',
  styleUrls: ['./parking-spot.component.css'],
  standalone: false
})
export class ParkingSpotsComponent implements OnInit {
  spots: ParkingSpotsGetAllResponse[] = [];
  spotForm: FormGroup;
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
    private getAllService: ParkingSpotsGetAllEndpointService,
    private getByIdService: ParkingSpotsGetByIdEndpointService,
    private saveService: ParkingSpotsUpdateOrInsertEndpointService,
    private deleteService: ParkingSpotsDeleteEndpointService,
    private dialog: MatDialog
  ) {
    this.spotForm = this.fb.group({
      parkingNumber: [1, [Validators.required, Validators.min(1)]],
      parkingSpotTypeId: [1, Validators.required],
      zoneId: [1, Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadSpots();
  }

  loadSpots(page: number = 1, pageSize: number = this.pageSize, filter: string = this.searchQuery) {
    this.isLoading = true;
    const request: ParkingSpotsGetAllRequest = {
      pageNumber: page,
      pageSize: pageSize,
      q: filter || undefined
    };

    this.getAllService.handleAsync(request).subscribe({
      next: res => {
        this.spots = res.dataItems ?? [];
        this.totalCount = res.totalCount;
        this.currentPage = res.currentPage ?? page;
        this.pageSize = res.pageSize ?? pageSize;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize) || 1;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  refreshSpots(): void {
    this.loadSpots(this.currentPage, this.pageSize);
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.loadSpots(1, this.pageSize);
  }
// ParkingSpotsComponent.ts (nastavak)
  saveSpot() {
    if (this.spotForm.invalid) return;

    const request: ParkingSpotsUpdateOrInsertRequest = {
      id: this.editId || undefined,
      ...this.spotForm.value
    };

    this.saveService.handleAsync(request).subscribe(() => {
      this.cancelEdit();
      this.loadSpots(this.currentPage, this.pageSize);
    });
  }

  editSpot(id: number) {
    this.getByIdService.handleAsync(id).subscribe(res => {
      this.editId = res.id;
      this.spotForm.patchValue({
        parkingNumber: res.parkingNumber,
        parkingSpotTypeId: res.parkingSpotTypeId,
        zoneId: res.zoneId,
        isActive: res.isActive
      });
    });
  }

  deleteSpot(id: number): void {
    this.deleteService.handleAsync(id).subscribe(() => {
      if (this.spots.length === 1 && this.currentPage > 1) this.currentPage--;
      this.loadSpots(this.currentPage, this.pageSize);
    });
  }

  cancelEdit() {
    this.editId = null;
    this.spotForm.reset({
      parkingNumber: 1,
      parkingSpotTypeId: 1,
      zoneId: 1,
      isActive: true
    });
  }

  // Dodaj paginacijske metode
  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.loadSpots(page, this.pageSize);
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

  applyFilter(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value.trim();
    this.currentPage = 1;
    this.loadSpots(1, this.pageSize);
  }

  openDeleteConfirmDialog(id: number): void {
    const dialogRef = this.dialog.open(MyDialogConfirmComponent, {
      width: '450px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this parking spot?',
        confirmButtonText: 'Delete'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.deleteSpot(id);
    });
  }
}




