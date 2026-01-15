import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-my-dialog-exception',
  standalone: false,
  templateUrl: './my-dialog-exception.component.html',
  styleUrl: './my-dialog-exception.component.css'
})
export class MyDialogExceptionComponent {
  showDetails = false; // Add this property to control accordion state
  
  constructor(
    public dialogRef: MatDialogRef<MyDialogExceptionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      title?: string; 
      message: string; 
      exception?: string;
      details?: string;
    }
  ) {
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onCopyDetails(): void {
    if (this.data.details) {
      navigator.clipboard.writeText(this.data.details);
    }
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  get hasDetails(): boolean {
    return !!(this.data.details || this.data.exception);
  }
}
