import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {
  LanguageGetByIdEndpointService,
  LanguageGetByIdResponse
} from '../../../../endpoints/language-endpoints/language-get-by-id-endpoint.service';
import {
  LanguageUpdateOrInsertEndpointService, LanguageUpdateOrInsertRequest
} from '../../../../endpoints/language-endpoints/language-update-or-insert-endpoint.service';
import {ExceptionService} from '../../../../services/exception.service';

@Component({
  selector: 'app-languages-edit',
  standalone: false,
  templateUrl: './languages-edit.component.html',
  styleUrl: './languages-edit.component.css'
})
export class LanguagesEditComponent implements OnInit {
  languageForm: FormGroup;
  isEditMode = false;
  languageId: number | null = null;
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private languageGetByIdService: LanguageGetByIdEndpointService,
    private languageUpdateOrInsertService: LanguageUpdateOrInsertEndpointService,
    private exceptionService: ExceptionService
  ) {
    this.languageForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ0-9\s\-&.,()]+$/), Validators.maxLength(100)]],
      nativeName: ['', [
        Validators.pattern(/^[\p{L}\p{M}0-9\s\-&.,()]+$/u),
        Validators.maxLength(100)
      ]],      code: ['', [Validators.pattern(/^[a-zA-Z]{2,3}$/), Validators.maxLength(3)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id && id !== 'new') {
        this.isEditMode = true;
        this.languageId = +id;
        this.loadLanguage(this.languageId);
      } else {
        this.isEditMode = false;
        this.languageId = null;
      }
    });
  }

  loadLanguage(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.languageGetByIdService.handleAsync(id).subscribe({
      next: (language: LanguageGetByIdResponse) => {
        this.languageForm.patchValue({
          name: language.name,
          nativeName: language.nativeName || '',
          code: language.code || '',
          isActive: language.isActive
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading language:', err);
        this.errorMessage = 'Failed to load language data. Please try again.';
        this.isLoading = false;
        this.exceptionService.handleError(err, 'Error Loading Language');
      }
    });
  }

  onSubmit(): void {
    if (this.languageForm.valid && !this.isSaving) {
      this.isSaving = true;
      this.errorMessage = '';

      const formData = this.languageForm.value;
      const request: LanguageUpdateOrInsertRequest = {
        id: this.isEditMode ? this.languageId : null,
        name: formData.name,
        nativeName: formData.nativeName || null,
        code: formData.code || null,
        isActive: formData.isActive
      };

      this.languageUpdateOrInsertService.handleAsync(request).subscribe({
        next: (response) => {
          console.log('Language saved successfully:', response);
          this.router.navigate(['/admin/languages']);
        },
        error: (err) => {
          console.error('Error saving language:', err);
          this.errorMessage = 'Failed to save language. Please try again.';
          this.isSaving = false;
          this.exceptionService.handleError(err, 'Error Saving Language');
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/languages']);
  }

  markFormGroupTouched(): void {
    Object.keys(this.languageForm.controls).forEach(key => {
      const control = this.languageForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.languageForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required.`;
    }
    if (control?.hasError('pattern')) {
      if (fieldName === 'code') {
        return 'Language code must be 2-3 letters (e.g., EN, FR, DE).';
      }
      return `${this.getFieldDisplayName(fieldName)} contains invalid characters.`;
    }
    if (control?.hasError('maxLength')) {
      const maxLength = control.errors?.['maxLength']?.requiredLength;
      return `${this.getFieldDisplayName(fieldName)} must not exceed ${maxLength} characters.`;
    }
    return '';
  }

  getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'name': 'Language Name',
      'nativeName': 'Native Name',
      'code': 'Language Code'
    };
    return displayNames[fieldName] || fieldName;
  }

  get isFormValid(): boolean {
    return this.languageForm.valid && !this.isSaving;
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Edit Language' : 'Add New Language';
  }

  get submitButtonText(): string {
    return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update Language' : 'Create Language');
  }
}
