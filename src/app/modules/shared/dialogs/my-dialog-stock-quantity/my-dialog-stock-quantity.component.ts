import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-my-dialog-stock-quantity',
  standalone: false,
  templateUrl: './my-dialog-stock-quantity.component.html',
  styleUrl: './my-dialog-stock-quantity.component.css'
})
export class MyDialogStockQuantityComponent {
  stockForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<MyDialogStockQuantityComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      currentQuantity: number;
    },
    private fb: FormBuilder
  ) {
    this.stockForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(1000)]]
    });
  }

  onConfirm(): void {
    if (this.stockForm.valid) {
      const quantity = this.stockForm.get('quantity')?.value;
      this.dialogRef.close({ confirmed: true, quantity: quantity });
    }
  }

  onCancel(): void {
    this.dialogRef.close({ confirmed: false });
  }

  get quantityError(): string {
    const control = this.stockForm.get('quantity');
    if (control?.errors?.['required']) {
      return 'Quantity is required';
    }
    if (control?.errors?.['min']) {
      return 'Quantity must be at least 1';
    }
    if (control?.errors?.['max']) {
      return 'Quantity cannot exceed 1000';
    }
    return '';
  }
}
