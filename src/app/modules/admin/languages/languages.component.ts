import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {LanguageGetAllEndpointService, LanguageGetAllResponse} from '../../../endpoints/language-endpoints/language-get-all-endpoint.service';
import {LanguageDeleteEndpointService} from '../../../endpoints/language-endpoints/language-delete-endpoint.service';
import {MyDialogConfirmComponent} from '../../shared/dialogs/my-dialog-confirm/my-dialog-confirm.component';
import {MatDialog} from '@angular/material/dialog';
import {MyCacheService} from '../../../services/cache-service/my-cache.service';
import {ExceptionService} from '../../../services/exception.service';
import {debounceTime, distinctUntilChanged, Subject, filter} from 'rxjs';

@Component({
  selector: 'app-languages',
  standalone: false,
  templateUrl: './languages.component.html',
  styleUrl: './languages.component.css'
})
export class LanguagesComponent implements OnInit, AfterViewInit {

  languages: LanguageGetAllResponse[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalCount = 0;

  // Search
  searchQuery = '';
  isLoading = false;

  // Math for template
  Math = Math;

  private searchSubject: Subject<string> = new Subject();

  constructor(
    private languageGetService: LanguageGetAllEndpointService,
    private languageDeleteService: LanguageDeleteEndpointService,
    private router: Router,
    private dialog: MatDialog,
    private cacheService: MyCacheService,
    private exceptionService: ExceptionService
  ) {}

  ngOnInit(): void {
    this.initSearchListener();
    this.initRouteListener();
    this.fetchLanguages();
  }

  ngAfterViewInit(): void {
    // Initialize after view is ready
  }

  initSearchListener(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe((filterValue) => {
      this.currentPage = 1; // Reset to first page on search
      this.fetchLanguages(filterValue, this.currentPage, this.pageSize);
    });
  }

  initRouteListener(): void {
    // Listen for navigation events to refresh data when returning from edit
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (event instanceof NavigationEnd && event.url === '/admin/languages') {
        // Force fresh data when returning from edit/add operations
        // Add a small delay to ensure the component is fully initialized
        setTimeout(() => {
          this.cacheService.clearLanguagesCache();
          this.fetchLanguages(this.searchQuery, this.currentPage, this.pageSize, false);
        }, 200);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim();
    this.searchQuery = filterValue;
    this.searchSubject.next(filterValue);
  }

  fetchLanguages(filter: string = '', page: number = 1, pageSize: number = 5, useCache: boolean = true): void {
    this.isLoading = true;

    this.languageGetService.handleAsync(
      {
        q: filter,
        pageNumber: page,
        pageSize: pageSize
      },
      useCache, // Use cache parameter
      300000 // 5 minutes cache TTL
    ).subscribe({
      next: (data) => {
        this.languages = data.dataItems;
        this.totalCount = data.totalCount;
        this.currentPage = page;
        this.pageSize = pageSize;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.exceptionService.handleError(err, 'Error Loading Languages');
      },
    });
  }

  onPageChange(page: number): void {
    this.fetchLanguages(this.searchQuery, page, this.pageSize);
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.fetchLanguages(this.searchQuery, this.currentPage, this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

    get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(5, this.totalPages);

    // Calculate the start page to show
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));

    // Adjust startPage if we're near the end
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
  addLanguage(): void {
    // Clear languages cache before navigating to add form
    this.cacheService.clearLanguagesCache();
    this.router.navigate(['/admin/languages/edit/new']);
  }

  editLanguage(id: number): void {
    // Clear languages cache before navigating to edit form
    this.cacheService.clearLanguagesCache();
    this.router.navigate(['/admin/languages/edit', id]);
  }

  deleteLanguage(id: number): void {
    this.languageDeleteService.handleAsync(id).subscribe({
      next: () => {
        // Clear languages cache after successful deletion
        this.cacheService.clearLanguagesCache();
        // Refresh the current page, but if we're on the last page and it becomes empty, go to previous page
        if (this.languages.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        // Force fresh data by disabling cache and adding a small delay
        setTimeout(() => {
          this.fetchLanguages(this.searchQuery, this.currentPage, this.pageSize, false);
        }, 100);
      },
      error: (err) => {
        this.exceptionService.handleError(err, 'Error Deleting Language');
      }
    });
  }

  refreshLanguages(): void {
    // Clear cache and force fresh data
    this.cacheService.clearLanguagesCache();
    this.fetchLanguages(this.searchQuery, this.currentPage, this.pageSize, false);
  }

  openDeleteConfirmDialog(id: number): void {
    const dialogRef = this.dialog.open(MyDialogConfirmComponent, {
      width: '450px',
      maxWidth: '90vw',
      panelClass: 'modern-dialog',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this language? This action cannot be undone.',
        confirmButtonText: 'Delete Language'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteLanguage(id);
      }
    });
  }
}
