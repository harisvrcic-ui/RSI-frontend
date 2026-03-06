import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {catchError} from 'rxjs/operators';
import {Observable, throwError} from 'rxjs';
import {MySnackbarHelperService} from '../../modules/shared/snackbars/my-snackbar-helper.service';
import {environment} from '../../../environments/environment';

@Injectable()
export class MyErrorHandlingInterceptor implements HttpInterceptor {
  constructor(private snackBar: MySnackbarHelperService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error, req);
        return throwError(() => error);
      })
    );
  }

  /**
   * Centralized HTTP error handling. User sees snackbar; dev-only logging uses
   * sanitized data (status, path, message) — never full error/response in production.
   */
  private handleError(error: HttpErrorResponse, req?: HttpRequest<unknown>): void {
    if (error.error instanceof ErrorEvent) {
      this.snackBar.showMessage(`Client error: ${error.error.message}`);
    } else {
      this.snackBar.showMessage(
        `Server error: ${error.status} - ${error.message}`,
        5000
      );
    }
    if (!environment.production) {
      const safeMessage = error.message || 'Unknown error';
      const safeStatus = error.status ?? '';
      let safePath = '';
      try {
        safePath = error.url ? new URL(error.url).pathname : (req?.url?.split('?')[0] ?? '');
      } catch {
        safePath = req?.url?.split('?')[0] ?? '';
      }
      // eslint-disable-next-line no-console
      console.error(`[HTTP Error] ${safeStatus} ${safePath}: ${safeMessage}`);
    }
  }
}
