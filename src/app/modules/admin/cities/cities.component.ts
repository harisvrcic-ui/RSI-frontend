import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {CityGetAllEndpointService, CityGetAllResponse} from '../../../endpoints/city-endpoints/city-get-all-endpoint.service';
import {CityDeleteEndpointService} from '../../../endpoints/city-endpoints/city-delete-endpoint.service';
import {CountryGetAllEndpointService, CountryGetAllResponse} from '../../../endpoints/country-endpoints/country-get-all-endpoint.service';
import {MyDialogConfirmComponent} from '../../shared/dialogs/my-dialog-confirm/my-dialog-confirm.component';
import {MatDialog} from '@angular/material/dialog';
import {MyCacheService} from '../../../services/cache-service/my-cache.service';
import {debounceTime, distinctUntilChanged, Subject, filter} from 'rxjs';
import {
  CityUpdateOrInsertEndpointService
} from '../../../endpoints/city-endpoints/city-update-or-insert-endpoint.service';

@Component({
  selector: 'app-cities',
  standalone: false,
  templateUrl: './cities.component.html',
  styleUrl: './cities.component.css'
})
export class CitiesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name'];
  cities: CityGetAllResponse[] = [];

  // Pagination – default 10 za admin efikasnost (Material/standard)
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;

  searchQuery = '';
  filterCountryId: number | null = null;
  filterIsActive: boolean | null = null;
  isLoading = false;
  countries: CountryGetAllResponse[] = [];

  Math = Math;
  private searchSubject: Subject<string> = new Subject();

  constructor(
    private cityGetService: CityGetAllEndpointService,
    private cityDeleteService: CityDeleteEndpointService,
    private countryGetService: CountryGetAllEndpointService,
    private router: Router,
    private dialog: MatDialog,
    private cacheService: MyCacheService,

  ) {}

  ngOnInit(): void {
    this.initSearchListener();
    this.initRouteListener();
    this.loadCountries();
    this.fetchCities();
  }

  loadCountries(): void {
    this.countryGetService.handleAsync({ pageNumber: 1, pageSize: 500 }).subscribe({
      next: (data) => this.countries = data.dataItems ?? []
    });
  }

  ngAfterViewInit(): void {
    // Initialize after view is ready
  }

  initSearchListener(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe((filterValue) => {
      this.currentPage = 1;
      this.fetchCities(filterValue, this.currentPage, this.pageSize);
    });
  }

  initRouteListener(): void {
    // Listen for navigation events to refresh data when returning from edit
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (event instanceof NavigationEnd && event.url === '/admin/cities') {
        // Force fresh data when returning from edit/add operations
        // Add a small delay to ensure the component is fully initialized
        setTimeout(() => {
          // this.cacheService.clearCitiesCache();
          this.fetchCities(this.searchQuery, this.currentPage, this.pageSize, true);
        }, 200);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim();
    this.searchQuery = filterValue;
    this.searchSubject.next(filterValue);
  }

  fetchCities(filter: string = '', page: number = 1, pageSize: number = 10, useCache: boolean = true): void {
    this.isLoading = true;
    this.cityGetService.handleAsync(
      {
        q: filter || undefined,
        pageNumber: page,
        pageSize: pageSize,
        countryId: this.filterCountryId ?? undefined,
        isActive: this.filterIsActive ?? undefined
      },
      useCache, // Use cache parameter
      300000 // 5 minutes cache TTL
    ).subscribe({
      next: (data) => {
        this.cities = data.dataItems;
        this.totalCount = data.totalCount;
        this.currentPage = page;
        this.pageSize = pageSize;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching cities:', err);
        this.isLoading = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.fetchCities(this.searchQuery, page, this.pageSize);
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.fetchCities(this.searchQuery, this.currentPage, this.pageSize);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.cacheService.clearCitiesCache();
    this.fetchCities(this.searchQuery, 1, this.pageSize, false);
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

    get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(5, this.totalPages);

    // Calculate the start page to show
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));

    // Adjust start page if we're near the end
    if (startPage + maxPages - 1 > this.totalPages) {
      startPage = Math.max(1, this.totalPages - maxPages + 1);
    }

    // Generate page numbers
    for (let i = 0; i < maxPages && startPage + i <= this.totalPages; i++) {
      pages.push(startPage + i);
    }

    return pages;
  }

  // CRUD Operations
  addCity(): void {
    // Clear cities cache before navigating to add form
    this.cacheService.clearCitiesCache();
    this.router.navigate(['/admin/cities/edit/new']);
  }

  editCity(id: number): void {
    // Clear cities cache before navigating to edit form
    this.cacheService.clearCitiesCache();
    this.router.navigate(['/admin/cities/edit', id]);
  }

  deleteCity(id: number): void {
    this.cityDeleteService.handleAsync(id).subscribe({
      next: () => {
        console.log(`City with ID ${id} deleted successfully`);
        // Clear cities cache after successful deletion
        this.cacheService.clearCitiesCache();
        // Refresh the current page, but if we're on the last page and it becomes empty, go to previous page
        if (this.cities.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        // Force fresh data by disabling cache and adding a small delay
        setTimeout(() => {
          this.fetchCities(this.searchQuery, this.currentPage, this.pageSize, false);
        }, 100);
      },
      error: (err) => {
        console.error('Error deleting city:', err);
      }
    });
  }

  refreshCities(): void {
    // Clear cache and force fresh data
    this.cacheService.clearCitiesCache();
    this.fetchCities(this.searchQuery, this.currentPage, this.pageSize, false);
  }

  openDeleteConfirmDialog(id: number): void {
    const dialogRef = this.dialog.open(MyDialogConfirmComponent, {
      width: '450px',
      maxWidth: '90vw',
      panelClass: 'modern-dialog',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this city? This action cannot be undone.',
        confirmButtonText: 'Delete City'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteCity(id);
      }
    });
  }
}
