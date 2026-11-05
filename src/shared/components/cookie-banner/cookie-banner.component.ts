import { Component } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'automaxia-cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss'],
})
export class CookieBannerComponent {
  readonly visivel$ = this.analytics.mostrarBanner$;

  constructor(private analytics: AnalyticsService) {}

  aceitar(): void {
    this.analytics.aceitar();
  }

  recusar(): void {
    this.analytics.recusar();
  }
}
