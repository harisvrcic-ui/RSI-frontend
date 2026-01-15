import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {
  CityGetByIdEndpointService,
  CityGetByIdResponse
} from '../../../../endpoints/city-endpoints/city-get-by-id-endpoint.service';
import {
  CityUpdateOrInsertEndpointService, CityUpdateOrInsertRequest
} from '../../../../endpoints/city-endpoints/city-update-or-insert-endpoint.service';


@Component({
  selector: 'app-cities-edit',
  standalone: false,
  templateUrl: './cities-edit.component.html',
  styleUrl: './cities-edit.component.css'
})
export class CitiesEditComponent implements OnInit {
  cityForm: FormGroup;
  isEditMode = false;
  cityId: number | null = null;
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cityGetByIdService: CityGetByIdEndpointService,
    private cityUpdateOrInsertService: CityUpdateOrInsertEndpointService
  ) {
    this.cityForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/),
        Validators.maxLength(100)
      ]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id && id !== 'new') {
        this.isEditMode = true;
        this.cityId = +id;
        this.loadCity(this.cityId);
      } else {
        this.isEditMode = false;
        this.cityId = null;
      }
    });
  }

  loadCity(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.cityGetByIdService.handleAsync(id).subscribe({
      next: (city: CityGetByIdResponse) => {
        this.cityForm.patchValue({
          name: city.name
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading city:', error);
        this.errorMessage = 'Failed to load city data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.cityForm.valid) {
      this.isSaving = true;
      this.errorMessage = '';

      const formData = this.cityForm.value;
      const request: CityUpdateOrInsertRequest = {
        id: this.isEditMode ? this.cityId : null,
        name: formData.name.trim()
      };

      this.cityUpdateOrInsertService.handleAsync(request).subscribe({
        next: () => {
          this.isSaving = false;
          this.router.navigate(['/admin/cities']);
        },
        error: (error) => {
          console.error('Error saving city:', error);
          this.errorMessage = 'Failed to save city. Please check your input and try again.';
          this.isSaving = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/cities']);
  }

  markFormGroupTouched(): void {
    Object.keys(this.cityForm.controls).forEach(key => {
      const control = this.cityForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.cityForm.get(fieldName);

    if (control?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }

    if (control?.hasError('pattern')) {
      return 'City name can only contain letters and spaces';
    }

    if (control?.hasError('maxlength')) {
      return 'City name cannot exceed 100 characters';
    }

    return '';
  }

  get isFormValid(): boolean {
    return this.cityForm.valid && !this.isSaving;
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Edit City' : 'Add New City';
  }

  get submitButtonText(): string {
    return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update City' : 'Create City');
  }
}
