import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MyDialogExceptionComponent} from '../modules/shared/dialogs/my-dialog-exception/my-dialog-exception.component';

@Injectable({
  providedIn: 'root'
})
export class ExceptionService {
  constructor(private dialog: MatDialog) {}

  showExceptionDialog(error: any, title?: string): void {
    let message = 'An unexpected error occurred.';
    let details = '';
    let exception = '';

    // Handle different types of errors
    if (error.error) {
      // HTTP error response
      if (typeof error.error === 'string') {
        // This is likely a backend exception message
        const fullMessage = error.error;
        
        // Simple approach: extract everything before the first " at "
        const atIndex = fullMessage.indexOf(' at ');
        if (atIndex !== -1) {
          let cleanMessage = fullMessage.substring(0, atIndex).trim();
          
          // Remove "System.Exception: " or similar prefixes
          if (cleanMessage.includes('System.Exception:')) {
            cleanMessage = cleanMessage.replace('System.Exception:', '').trim();
          } else if (cleanMessage.includes('System.KeyNotFoundException:')) {
            cleanMessage = cleanMessage.replace('System.KeyNotFoundException:', '').trim();
          }
          
          message = cleanMessage;
          details = fullMessage;
        } else {
          message = fullMessage;
        }
      } else if (error.error.message) {
        message = error.error.message;
      } else if (error.error.title) {
        message = error.error.title;
      }
      
      // Get additional details only for debugging
      if (error.error.details) {
        details = error.error.details;
      } else if (error.error.traceId) {
        details = `Trace ID: ${error.error.traceId}`;
      }
    } else if (error.message) {
      // JavaScript error - extract only the main message
      // For backend exceptions, the message contains the full stack trace
      // We need to extract just the exception message
      const fullMessage = error.message;
      
      // Simple approach: find the first line that contains the actual error message
      const lines = fullMessage.split('\n');
      const firstLine = lines[0].trim();
      
      // Check if first line contains exception type and message
      if (firstLine.includes('System.Exception:') || firstLine.includes('System.KeyNotFoundException:')) {
        // Extract everything after the colon
        const colonIndex = firstLine.indexOf(':');
        if (colonIndex !== -1) {
          message = firstLine.substring(colonIndex + 1).trim();
        } else {
          message = firstLine;
        }
        // Put the full stack trace in details
        details = fullMessage;
      } else {
        // Fallback: take only the first line if no exception pattern found
        message = firstLine;
        if (lines.length > 1) {
          details = lines.slice(1).join('\n').trim();
        }
      }
    } else if (typeof error === 'string') {
      // Simple string error
      message = error;
    }

    // Get HTTP status and URL for additional context
    if (error.status) {
      details += `\nStatus: ${error.status}`;
    }
    if (error.url) {
      details += `\nURL: ${error.url}`;
    }

    const dialogRef = this.dialog.open(MyDialogExceptionComponent, {
      width: '500px',
      maxWidth: '90vw',
      panelClass: 'modern-dialog',
      disableClose: false,
      data: {
        title: title || 'Error',
        message: message,
        exception: exception,
        details: details.trim()
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      // Dialog closed
    });
  }

  handleError(error: any, title?: string): void {
    this.showExceptionDialog(error, title);
  }
}
