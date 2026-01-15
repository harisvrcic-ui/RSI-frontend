import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {filter, debounceTime, distinctUntilChanged, Subject} from 'rxjs';
import {BrandGetAllEndpointService, BrandGetAllResponse} from '../../../endpoints/brand-endpoints/brand-get-all-endpoint.service';
import {BrandDeleteEndpointService} from '../../../endpoints/brand-endpoints/brand-delete-endpoint.service';
import {MyDialogConfirmComponent} from '../../shared/dialogs/my-dialog-confirm/my-dialog-confirm.component';
import {MyDialogExceptionComponent} from '../../shared/dialogs/my-dialog-exception/my-dialog-exception.component';
import {MyCacheService} from '../../../services/cache-service/my-cache.service';

@Component({
  selector: 'app-brands',
  standalone: false,
  templateUrl: './brand-component.html',
  styleUrl: './brand-component.css'
})
export class BrandsComponent implements OnInit, AfterViewInit {

  brands: BrandGetAllResponse[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalCount = 0;

  // Search
  searchQuery = '';
  isLoading = false;

  // For template math
  Math = Math;

  private searchSubject: Subject<string> = new Subject();

  constructor(
    private brandGetService: BrandGetAllEndpointService,
    private brandDeleteService: BrandDeleteEndpointService,
    private router: Router,
    private dialog: MatDialog,
    private cacheService: MyCacheService
  ) {}

  ngOnInit(): void {
    this.initSearchListener();
    this.initRouteListener();
    this.fetchBrands();
  }

  ngAfterViewInit(): void {}

  // 🔍 Search
  initSearchListener(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.currentPage = 1;
      this.fetchBrands(value, this.currentPage, this.pageSize);
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.searchQuery = value;
    this.searchSubject.next(value);
  }

  // 🔁 Refresh when returning from edit/add
  initRouteListener(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event => {
      if (event instanceof NavigationEnd && event.url === '/admin/brands') {
        setTimeout(() => {
          this.cacheService.clearBrandsCache();
          this.fetchBrands(this.searchQuery, this.currentPage, this.pageSize, false);
        }, 200);
      }
    });
  }

  // 📦 Fetch
  fetchBrands(
    filter: string = '',
    page: number = 1,
    pageSize: number = 5,
    useCache: boolean = true
  ): void {
    this.isLoading = true;

    this.brandGetService.handleAsync(
      {
        q: filter,
        pageNumber: page,
        pageSize: pageSize
      },
      useCache,
      300000 // 5 min cache
    ).subscribe({
      next: data => {
        this.brands = data.dataItems;
        this.totalCount = data.totalCount;
        this.currentPage = page;
        this.pageSize = pageSize;
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.showExceptionDialog(
          'Error Loading Brands',
          'Failed to load brands. Please try again.',
          err
        );
      }
    });
  }

  // 📄 Pagination
  onPageChange(page: number): void {
    this.fetchBrands(this.searchQuery, page, this.pageSize);
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.fetchBrands(this.searchQuery, this.currentPage, this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
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

  // ✏️ CRUD
  addBrand(): void {
    this.cacheService.clearBrandsCache();
    this.router.navigate(['/admin/brands/edit/new']);
  }

  editBrand(id: number): void {
    this.cacheService.clearBrandsCache();
    this.router.navigate(['/admin/brands/edit', id]);
  }

  deleteBrand(id: number): void {
    this.brandDeleteService.handleAsync(id).subscribe({
      next: () => {
        this.cacheService.clearBrandsCache();

        if (this.brands.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }

        setTimeout(() => {
          this.fetchBrands(this.searchQuery, this.currentPage, this.pageSize, false);
        }, 100);
      },
      error: err => {
        this.showExceptionDialog(
          'Error Deleting Brand',
          'Failed to delete brand. Please try again.',
          err
        );
      }
    });
  }

  refreshBrands(): void {
    this.cacheService.clearBrandsCache();
    this.fetchBrands(this.searchQuery, this.currentPage, this.pageSize, false);
  }

  openDeleteConfirmDialog(id: number): void {
    const dialogRef = this.dialog.open(MyDialogConfirmComponent, {
      width: '450px',
      maxWidth: '90vw',
      panelClass: 'modern-dialog',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this brand?',
        confirmButtonText: 'Delete Brand'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteBrand(id);
      }
    });
  }

  // 🖼 Logo helper
  getBrandLogo(logo: string | null | undefined): string {
    if (!logo || logo.length === 0) {
      return 'assets/images/default-brand.png';
    }
    return `data:image/png;base64,${logo}`;
  }

  private showExceptionDialog(title: string, message: string, error: any): void {
    this.dialog.open(MyDialogExceptionComponent, {
      width: '500px',
      maxWidth: '90vw',
      panelClass: 'modern-dialog',
      data: {
        title,
        message,
        exception: error?.message || 'Unknown error',
        details: error?.error || error?.toString()
      }
    });
  }
}
