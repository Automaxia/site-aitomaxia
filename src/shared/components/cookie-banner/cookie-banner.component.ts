import { Component, inject } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
    selector: 'automaxia-cookie-banner',
    templateUrl: './cookie-banner.component.html',
    styleUrls: ['./cookie-banner.component.scss'],
    standalone: false
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
