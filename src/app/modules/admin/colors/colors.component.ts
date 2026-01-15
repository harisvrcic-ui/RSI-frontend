import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter as rxFilter } from 'rxjs/operators';
import { ColorsGetAllEndpointService, ColorsGetAllResponse } from '../../../endpoints/color-endpoints/colors-get-all-endpoint.service';
import { ColorsDeleteEndpointService } from '../../../endpoints/color-endpoints/colors-delete-endpoint.service';
import { MyCacheService } from '../../../services/cache-service/my-cache.service';
import { MyDialogExceptionComponent } from '../../shared/dialogs/my-dialog-exception/my-dialog-exception.component';
import { MyDialogConfirmComponent } from '../../shared/dialogs/my-dialog-confirm/my-dialog-confirm.component';

@Component({
  selector: 'app-colors',
  templateUrl: './colors.component.html',
  styleUrls: ['./colors.component.css'],
  standalone: false
})
export class ColorsComponent implements OnInit, AfterViewInit {

  colors: ColorsGetAllResponse[] = [];
  searchQuery = '';
  isLoading = false;
  pageSize = 5;
  currentPage = 1;
  totalCount = 0;
  private searchSubject: Subject<string> = new Subject();

  constructor(
    private colorsGetService: ColorsGetAllEndpointService,
    private colorsDeleteService: ColorsDeleteEndpointService,
    private router: Router,
    private dialog: MatDialog,
    private cacheService: MyCacheService
  ) {}

  ngOnInit(): void {
    this.initSearchListener();
    this.initRouteListener();
    this.fetchColors();
  }

  ngAfterViewInit(): void {}

  // 🔍 Search
  initSearchListener(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.currentPage = 1;
      this.fetchColors(value, this.currentPage, this.pageSize);
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
      rxFilter(event => event instanceof NavigationEnd)
    ).subscribe(event => {
      if (event instanceof NavigationEnd && event.url === '/admin/colors') {
        setTimeout(() => {
          this.cacheService.clearColorsCache();
          this.fetchColors(this.searchQuery, this.currentPage, this.pageSize, false);
        }, 200);
      }
    });
  }

  // 📦 Fetch
  fetchColors(
    filter: string = '',
    page: number = 1,
    pageSize: number = 5,
    useCache: boolean = true
  ): void {
    this.isLoading = true;
    console.log('Fetching colors...', filter, page, pageSize);

    this.colorsGetService.handleAsync(
      { q: filter, pageNumber: page, pageSize: pageSize },
      useCache,
      300_000
    ).subscribe({
      next: data => {
        console.log('Received colors:', data);
        this.colors = data.dataItems;
        this.totalCount = data.totalCount;
        this.currentPage = page;
        this.pageSize = pageSize;
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.showExceptionDialog('Error Loading Colors', 'Failed to load colors. Please try again.', err);
      }
    });
  }

  // 📄 Pagination
  onPageChange(page: number): void {
    this.fetchColors(this.searchQuery, page, this.pageSize);
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.fetchColors(this.searchQuery, this.currentPage, this.pageSize);
  }

  refreshColors(): void {
    this.fetchColors(this.searchQuery, this.currentPage, this.pageSize, false);
  }

  // ✏️ CRUD
  deleteColor(id: number): void {
    this.colorsDeleteService.handleAsync(id).subscribe({
      next: () => {
        this.cacheService.clearColorsCache();
        if (this.colors.length === 1 && this.currentPage > 1) this.currentPage--;
        setTimeout(() => this.fetchColors(this.searchQuery, this.currentPage, this.pageSize, false), 100);
      },
      error: err => this.showExceptionDialog('Error Deleting Color', 'Failed to delete color. Please try again.', err)
    });
  }

  openDeleteConfirmDialog(id: number): void {
    const dialogRef = this.dialog.open(MyDialogConfirmComponent, {
      width: '450px',
      maxWidth: '90vw',
      panelClass: 'modern-dialog',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this color?',
        confirmButtonText: 'Delete Color'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.deleteColor(id);
    });
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


