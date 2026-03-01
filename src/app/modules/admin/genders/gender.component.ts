import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MyCacheService } from '../../../services/cache-service/my-cache.service';
import { MyDialogExceptionComponent } from '../../shared/dialogs/my-dialog-exception/my-dialog-exception.component';
import {filter } from 'rxjs';

import {
  GenderGetAllEndpointService,
  GenderGetAllResponse
} from '../../../endpoints/gender-endpoints/gender-get-all-endpoint.service';

@Component({
  selector: 'app-genders',
  templateUrl: './gender.component.html',
  styleUrls: ['./gender.component.css'],
  standalone: false
})
export class GenderComponent implements OnInit {

  genders: GenderGetAllResponse[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 1;

  // Search
  searchQuery = '';
  isLoading = false;
  private searchSubject: Subject<string> = new Subject();

  constructor(
    private genderGetService: GenderGetAllEndpointService,
    private router: Router,
    private dialog: MatDialog,
    private cacheService: MyCacheService
  ) {}

  ngOnInit(): void {
    this.initSearchListener();
    this.refreshGenders();
  }

  private initSearchListener(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.currentPage = 1;
      this.refreshGenders();
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.searchQuery = value;
    this.searchSubject.next(value);
  }

  fetchGenders(): void {
    this.isLoading = true;

    this.genderGetService.handleAsync().subscribe({
      next: data => {
        // Ako backend vrati običan niz
        const q = this.searchQuery.toLowerCase();
        this.genders = data.dataItems.filter(g => {
          const name = (g.name ?? '').toLowerCase();
          return name === q || name.startsWith(q);
        });

        this.totalCount = this.genders.length;
        this.totalPages = 1; // jednostavna paginacija
        this.currentPage = 1;
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.showExceptionDialog(
          'Error Loading Genders',
          'Failed to load genders. Please try again.',
          err
        );
      }
    });
  }

  refreshGenders(): void {
    if (this.cacheService.clearGendersCache) {
      this.cacheService.clearGendersCache();
    }
    this.fetchGenders();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    // Trenutno je samo 1 stranica, pa refresh nije potreban
  }

  onPageSizeChange(value: string): void {
    this.pageSize = Number(value);
    this.currentPage = 1;
  }

  get pageNumbers(): number[] {
    // Jednostavna paginacija - samo 1 stranica
    return [1];
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
