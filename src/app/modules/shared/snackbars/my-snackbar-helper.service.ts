import {Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarRef, TextOnlySnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MySnackbarHelperService {


  constructor(private snackBar: MatSnackBar) {
  }

  /**
   * Shows a simple snackbar with a message.
   * @param message Tekst poruke
   * @param duration Trajanje prikaza u milisekundama (podrazumijevano: 3000)
   */
  showMessage(message: string, duration: number = 3000): MatSnackBarRef<TextOnlySnackBar> {
    return this.snackBar.open(message, undefined, {
      duration: duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Shows a snackbar with an optional action button.
   * @param message Tekst poruke
   * @param action Button label (e.g. "Undo")
   * @param callback Funkcija koja se poziva kada se klikne na dugme
   * @param duration Trajanje prikaza u milisekundama (podrazumijevano: 5000)
   */
  showMessageWithAction(
    message: string,
    action: string,
    callback: () => void,
    duration: number = 5000
  ): void {
    const snackBarRef = this.snackBar.open(message, action, {
      duration: duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });

    snackBarRef.onAction().subscribe(() => {
      callback();
    });
  }
}
