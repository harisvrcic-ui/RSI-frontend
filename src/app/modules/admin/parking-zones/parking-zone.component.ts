import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ParkingZonesGetAllEndpointService, ParkingZonesGetAllResponse, ParkingZonesGetAllRequest } from '../../../endpoints/parking-zone-endpoints/parking-zone-get-all-endpoint.service';
import { ParkingZonesGetByIdEndpointService } from '../../../endpoints/parking-zone-endpoints/parking-zone-get-by-id-endpoint.service';
import { ParkingZonesUpdateOrInsertEndpointService, ParkingZonesUpdateOrInsertRequest } from '../../../endpoints/parking-zone-endpoints/parking-zone-update-or-insert-endpoint.service';
import { ParkingZonesDeleteEndpointService } from '../../../endpoints/parking-zone-endpoints/parking-zone-delete-endpoint.service';

@Component({
  selector: 'app-parking-zone',
  templateUrl: './parking-zone.component.html',
  styleUrls: ['./parking-zone.component.css'],
  standalone: false
})
export class ParkingZoneComponent implements OnInit {
  zones: ParkingZonesGetAllResponse[] = [];
  zoneForm: FormGroup;
  editId: number | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  searchQuery = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private getAllService: ParkingZonesGetAllEndpointService,
    private getByIdService: ParkingZonesGetByIdEndpointService,
    private saveService: ParkingZonesUpdateOrInsertEndpointService,
    private deleteService: ParkingZonesDeleteEndpointService
  ) {
    this.zoneForm = this.fb.group({
      name: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadZones();
  }

  loadZones(page: number = 1, pageSize: number = 10) {
    this.isLoading = true;
    const request: ParkingZonesGetAllRequest = {
      pageNumber: page,
      pageSize: pageSize,
      q: this.searchQuery
    };

    this.getAllService.handleAsync(request).subscribe(res => {
      this.zones = res.dataItems;
      this.totalCount = res.totalCount;
      this.currentPage = res.currentPage;
      this.pageSize = res.pageSize;
      this.totalPages = res.totalPages;
      this.isLoading = false;
    }, error => {
      console.error('Error loading zones:', error);
      this.isLoading = false;
    });
  }

  // Pagination
  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.loadZones(page, this.pageSize);
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
  editZone(id: number) {
    this.getByIdService.handleAsync(id).subscribe(res => {
      this.editId = res.id;
      this.zoneForm.patchValue({
        name: res.name,
        isActive: res.isActive
      });
    });
  }

  saveZone() {
    if (this.zoneForm.invalid) return;

    const request: ParkingZonesUpdateOrInsertRequest = {
      id: this.editId || undefined,
      ...this.zoneForm.value
    };

    this.saveService.handleAsync(request).subscribe(() => {
      this.zoneForm.reset({ isActive: true });
      this.editId = null;
      this.loadZones(this.currentPage, this.pageSize);
    });
  }

  deleteZone(id: number) {
    if (!confirm('Are you sure you want to delete this parking zone?')) return;

    this.deleteService.handleAsync(id).subscribe(() => {
      if (this.zones.length === 1 && this.currentPage > 1) {
        this.currentPage--;
      }
      this.loadZones(this.currentPage, this.pageSize);
    });
  }

  cancelEdit() {
    this.zoneForm.reset({ isActive: true });
    this.editId = null;
  }

  applyFilter(value: string) {
    this.searchQuery = value;
    this.currentPage = 1;
    this.loadZones();
  }
}
