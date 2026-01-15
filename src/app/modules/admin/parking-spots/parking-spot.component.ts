import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ParkingSpotsGetAllEndpointService,
  ParkingSpotsGetAllRequest,
  ParkingSpotsGetAllResponse
} from '../../../endpoints/parking-spot-endpoints/parking-spot-get-all-endpoint.service';
import { ParkingSpotsGetByIdEndpointService } from '../../../endpoints/parking-spot-endpoints/parking-spot-get-by-id-endpoint.service';
import { ParkingSpotsUpdateOrInsertEndpointService, ParkingSpotsUpdateOrInsertRequest } from '../../../endpoints/parking-spot-endpoints/parking-spot-update-or-insert-endpoint.service';
import { ParkingSpotsDeleteEndpointService } from '../../../endpoints/parking-spot-endpoints/parking-spot-delete-endpoint.service';

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

  // 🔹 Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  constructor(
    private fb: FormBuilder,
    private getAllService: ParkingSpotsGetAllEndpointService,
    private getByIdService: ParkingSpotsGetByIdEndpointService,
    private saveService: ParkingSpotsUpdateOrInsertEndpointService,
    private deleteService: ParkingSpotsDeleteEndpointService
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

  loadSpots(page: number = 1, pageSize: number = this.pageSize, filter: string = '') {
    const request: ParkingSpotsGetAllRequest = {
      pageNumber: page,
      pageSize: pageSize,
      q: filter
    };

    this.getAllService.handleAsync(request).subscribe(res => {
      this.spots = res.dataItems;       // Array of spots
      this.totalCount = res.totalCount;
      this.currentPage = res.currentPage;
      this.pageSize = res.pageSize;
      this.totalPages = res.totalPages;
    });
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

  deleteSpot(id: number) {
    if (!confirm('Are you sure you want to delete this parking spot?')) return;

    this.deleteService.handleAsync(id).subscribe(() => {
      // Ako smo na zadnjoj stranici i obrišemo zadnji element, spusti stranicu
      if (this.spots.length === 1 && this.currentPage > 1) {
        this.currentPage--;
      }
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
  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim();
    this.currentPage = 1;
    this.loadSpots(1, this.pageSize, value);
  }
  currentSpotIndex = 0;

  getCurrentSpot() {
    return this.spots[this.currentSpotIndex];
  }

  previousSpot() {
    if (this.currentSpotIndex > 0) this.currentSpotIndex--;
  }

  nextSpot() {
    if (this.currentSpotIndex < this.spots.length - 1) this.currentSpotIndex++;
  }

  goToSpot(i: number) {
    if (i >= 0 && i < this.spots.length) this.currentSpotIndex = i;
  }

}




