import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
  standalone: false
})
export class SettingsComponent {
  constructor(public translate: TranslateService) {}

  setLanguage(lang: string): void {
    this.translate.use(lang);
  }
}
