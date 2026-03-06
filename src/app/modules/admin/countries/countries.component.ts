import { Component, OnInit } from '@angular/core';
import { CountryGetAllEndpointService, CountryGetAllResponse } from '../../../endpoints/country-endpoints/country-get-all-endpoint.service';
import { CountryDeleteEndpointService } from '../../../endpoints/country-endpoints/country-delete-endpoint.service';
import { CountryUpdateOrInsertEndpointService, CountryUpdateOrInsertRequest } from '../../../endpoints/country-endpoints/country-update-or-insert-endpoint.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';


@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.css'],
  standalone: false
})
export class CountriesComponent implements OnInit {
  Math = Math;
  countries: CountryGetAllResponse[] = [];
  searchQuery: string = '';
  searchSubject: Subject<string> = new Subject<string>();
  isLoading: boolean = false;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }
  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  constructor(
    private getAllService: CountryGetAllEndpointService,
    private deleteService: CountryDeleteEndpointService,
    private updateOrInsertService: CountryUpdateOrInsertEndpointService
  ) {}

  ngOnInit(): void {
    this.fetchCountries();

    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.currentPage = 1;
      this.fetchCountries();
    });
  }

  fetchCountries(
    useCache: boolean = false,
    cacheTTL: number = 300_000
  ): void {
    this.isLoading = true;
    this.getAllService.handleAsync({
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      q: this.searchQuery
    }, useCache, cacheTTL).subscribe({
      next: (res) => {
        let data = res.dataItems;

        // Optional client-side search
        if (this.searchQuery) {
          data = data.filter(c =>
            c.name.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
        }

        this.totalCount = res.totalCount;
        this.countries = data;

        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim();
    this.searchQuery = filterValue;
    this.searchSubject.next(filterValue);
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchCountries();
  }

  onPageSizeChange(value: string | number) {
    this.pageSize = Number(value);
    this.currentPage = 1;
    this.fetchCountries();
  }

  refreshCountries() {
    this.fetchCountries();
  }

  addCountry() {
    const request: CountryUpdateOrInsertRequest = { name: 'New Country', isActive: true };
    this.updateOrInsertService.handleAsync(request).subscribe(() => this.fetchCountries());
  }

  editCountry(country: CountryGetAllResponse) {
    const request: CountryUpdateOrInsertRequest = { id: country.id, name: country.name, isActive: country.isActive };
    this.updateOrInsertService.handleAsync(request).subscribe(() => this.fetchCountries());
  }

  deleteCountry(id: number) {
    if (!confirm('Are you sure you want to delete this country?')) return;
    this.deleteService.handleAsync(id).subscribe(() => this.fetchCountries());
  }
}
