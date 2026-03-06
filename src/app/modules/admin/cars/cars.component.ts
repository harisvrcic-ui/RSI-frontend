import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CarsGetAllEndpointService, CarsGetAllResponse } from '../../../endpoints/car-endpoints/car-get-all-endpoint.service';
import { CarsDeleteEndpointService } from '../../../endpoints/car-endpoints/car-delete-endpoint.service';
import { MatDialog } from '@angular/material/dialog';
import { MyDialogConfirmComponent } from '../../shared/dialogs/my-dialog-confirm/my-dialog-confirm.component';
import { MyDialogExceptionComponent } from '../../shared/dialogs/my-dialog-exception/my-dialog-exception.component';
import { MyCacheService } from '../../../services/cache-service/my-cache.service';
import { Subject, debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { MyPagedList } from '../../../helper/my-paged-list';

@Component({
  selector: 'app-cars',
  standalone: false,
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['picture', 'brand', 'model', 'licensePlate', 'year', 'userId', 'isActive', 'actions'];
  cars: CarsGetAllResponse[] = [];

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;

  searchQuery = '';
  isLoading = false;

  Math = Math;
  private searchSubject: Subject<string> = new Subject();

  constructor(
    private carsGetService: CarsGetAllEndpointService,
    private carsDeleteService: CarsDeleteEndpointService,
    private router: Router,
    private dialog: MatDialog,
    private cacheService: MyCacheService
  ) {}

  ngOnInit(): void {
    this.initSearchListener();
    this.initRouteListener();
    this.fetchCars();
  }

  ngAfterViewInit(): void {}

  initSearchListener(): void {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(filterValue => {
      this.currentPage = 1;
      this.fetchCars(filterValue, this.currentPage, this.pageSize);
    });
  }

  initRouteListener(): void {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      if (event instanceof NavigationEnd && event.url === '/admin/cars') {
        setTimeout(() => {
          this.cacheService.clearCarsCache?.();
          this.fetchCars(this.searchQuery, this.currentPage, this.pageSize, false);
        }, 200);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim();
    this.searchQuery = filterValue;
    this.searchSubject.next(filterValue);
  }

  fetchCars(filter: string = '', page: number = 1, pageSize: number = 10, useCache: boolean = false): void {
    this.isLoading = true;
    // Admin: do not send userId to see all cars; cache disabled to always show up-to-date list
    this.carsGetService.handleAsync({ q: filter, pageNumber: page, pageSize: pageSize }, useCache, 300000)
      .subscribe({
        next: data => {
          const raw = data as { dataItems?: CarsGetAllResponse[]; DataItems?: CarsGetAllResponse[]; totalCount?: number; TotalCount?: number };
          this.cars = raw.dataItems ?? raw.DataItems ?? [];
          this.totalCount = raw.totalCount ?? raw.TotalCount ?? 0;
          this.currentPage = page;
          this.pageSize = pageSize;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.showExceptionDialog('Error Loading Cars', 'Failed to load cars.', err);
        }
      });
  }

  onPageChange(page: number): void { this.fetchCars(this.searchQuery, page, this.pageSize); }
  onPageSizeChange(pageSize: number): void { this.pageSize = pageSize; this.currentPage = 1; this.fetchCars(this.searchQuery, this.currentPage, this.pageSize); }
  //onPageSizeChange(value: string | number) {this.pageSize = Number(value);this.currentPage = 1;this.refreshCars();}


  get totalPages(): number { return Math.ceil(this.totalCount / this.pageSize); }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(5, this.totalPages);
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    if (startPage + maxPages - 1 > this.totalPages) startPage = Math.max(1, this.totalPages - maxPages + 1);
    for (let i = 0; i < maxPages && startPage + i <= this.totalPages; i++) pages.push(startPage + i);
    return pages;
  }

  addCar(): void {
    this.cacheService.clearCarsCache?.();
    this.router.navigate(['/admin/cars/edit/new']);
  }

  editCar(id: number): void {
    this.cacheService.clearCarsCache?.();
    this.router.navigate(['/admin/cars/edit', id]);
  }

  deleteCar(id: number): void {
    this.carsDeleteService.handleAsync(id).subscribe({
      next: () => {
        this.cacheService.clearCarsCache?.();
        if (this.cars.length === 1 && this.currentPage > 1) this.currentPage--;
        setTimeout(() => this.fetchCars(this.searchQuery, this.currentPage, this.pageSize, false), 100);
      },
      error: (err) => this.showExceptionDialog('Error Deleting Car', 'Failed to delete car.', err)
    });
  }

  openDeleteConfirmDialog(id: number): void {
    const dialogRef = this.dialog.open(MyDialogConfirmComponent, {
      width: '450px',
      maxWidth: '90vw',
      panelClass: 'modern-dialog',
      data: { title: 'Confirm Delete', message: 'Are you sure you want to delete this car?', confirmButtonText: 'Delete Car' }
    });

    dialogRef.afterClosed().subscribe(result => { if (result) this.deleteCar(id); });
  }

  getImageUrl(imageData: string | undefined): string {
    if (!imageData || imageData.length === 0) return '/images/default-car.png';
    return `data:image/jpeg;base64,${imageData}`;
  }

  hasImage(car: CarsGetAllResponse): boolean {
    return (car.picture?.length ?? 0) > 0;
  }

  private showExceptionDialog(title: string, message: string, error: any): void {
    this.dialog.open(MyDialogExceptionComponent, {
      width: '500px',
      maxWidth: '90vw',
      panelClass: 'modern-dialog',
      data: { title, message, exception: error?.message || 'Unknown error', details: error?.error || error?.toString() || 'No details' }
    });
  }

  refreshCars(): void {
    this.cacheService.clearCarsCache?.();
    this.fetchCars(this.searchQuery, this.currentPage, this.pageSize, false);
  }

}
