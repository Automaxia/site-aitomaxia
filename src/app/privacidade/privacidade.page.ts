import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AnalyticsService } from '../../shared/services/analytics.service';

@Component({
    selector: 'automaxia-privacidade',
    templateUrl: './privacidade.page.html',
    styleUrls: ['./privacidade.page.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PrivacidadePage {
  private readonly analytics = inject(AnalyticsService);


  alterarCookies(): void {
    this.analytics.abrirPreferencias();
  }

}
