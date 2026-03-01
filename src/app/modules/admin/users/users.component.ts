import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { UserGetAllEndpointService, UserGetAllRequest, UserGetAllResponse } from '../../../endpoints/user-endpoints/user-get-all-endpoint.service';
import { MyPagedList } from '../../../helper/my-paged-list';
import { MyDialogExceptionComponent } from '../../shared/dialogs/my-dialog-exception/my-dialog-exception.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  users: UserGetAllResponse[] = [];
  searchQuery = '';
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  isLoading = false;

  private searchSubject = new Subject<string>();

  constructor(
    private userGetAllService: UserGetAllEndpointService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initSearchListener();
    this.fetchUsers();
  }

  ngAfterViewInit(): void {
    this.initRouteListener();
  }

  private initSearchListener(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter(query => query.length >= 0)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.fetchUsers();
      });
  }

  private initRouteListener(): void {
    // Listen for route changes to refresh data
    this.fetchUsers();
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  applyFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.currentPage = 1;
    this.fetchUsers();
  }

  fetchUsers(bypassCache = false): void {
    this.isLoading = true;

    const request: UserGetAllRequest = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      q: this.searchQuery,
      isUser: true // Only fetch regular users
      // Removed isActive filter to show both active and inactive users
    };

    this.userGetAllService.handleAsync(request, !bypassCache).subscribe({
      next: (response: MyPagedList<UserGetAllResponse>) => {
        this.users = response.dataItems;
        this.totalCount = response.totalCount;
        this.currentPage = this.currentPage;
        this.pageSize = response.pageSize;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.isLoading = false;
        this.showExceptionDialog('Error Loading Users', 'Failed to load users. Please try again.', err);
      },
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchUsers();
    }
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.fetchUsers();
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

  refreshUsers(): void {
    this.currentPage = 1;
    this.searchQuery = '';
    if (this.searchInput?.nativeElement) {
      this.searchInput.nativeElement.value = '';
    }
    this.fetchUsers(true);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }





  showExceptionDialog(title: string, message: string, error: any): void {
    this.dialog.open(MyDialogExceptionComponent, {
      width: '400px',
      data: {
        title: title,
        message: message,
        error: error
      }
    });
  }

  protected readonly Math = Math;
}
