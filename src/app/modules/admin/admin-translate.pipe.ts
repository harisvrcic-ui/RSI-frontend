import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Pipe({ name: 'translate', standalone: false, pure: false })
export class AdminTranslatePipe implements PipeTransform, OnDestroy {
  private subs = new Subscription();

  constructor(
    private translate: TranslateService,
    private ref: ChangeDetectorRef
  ) {
    this.subs.add(this.translate.onLangChange.subscribe(() => this.ref.markForCheck()));
    this.subs.add(this.translate.onTranslationChange.subscribe(() => this.ref.markForCheck()));
    this.subs.add(this.translate.onDefaultLangChange.subscribe(() => this.ref.markForCheck()));
  }

  transform(key: string, params?: Record<string, unknown>): string {
    if (!key) return '';
    return this.translate.instant(key, params) || key;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
