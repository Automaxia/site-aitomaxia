import { AsyncPipe } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
    selector: 'automaxia-cookie-banner',
    templateUrl: './cookie-banner.component.html',
    styleUrls: ['./cookie-banner.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AsyncPipe, RouterLink],
})
export class CookieBannerComponent {
  private analytics = inject(AnalyticsService);

  readonly visivel$ = this.analytics.mostrarBanner$;

  aceitar(): void {
    this.analytics.aceitar();
  }

  recusar(): void {
    this.analytics.recusar();
  }
}
