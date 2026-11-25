import { Component } from '@angular/core';
import { AnalyticsService } from '../../shared/services/analytics.service';

@Component({
    selector: 'automaxia-privacidade',
    templateUrl: './privacidade.page.html',
    styleUrls: ['./privacidade.page.scss'],
    standalone: false
})
export class PrivacidadePage {

  constructor(private readonly analytics: AnalyticsService) { }

  alterarCookies(): void {
    this.analytics.abrirPreferencias();
  }

}
