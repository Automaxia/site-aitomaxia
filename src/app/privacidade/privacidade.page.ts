import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AnalyticsService } from '../../shared/services/analytics.service';

@Component({
    selector: 'automaxia-privacidade',
    templateUrl: './privacidade.page.html',
    styleUrls: ['./privacidade.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IonContent, RouterLink],
})
export class PrivacidadePage {
  private readonly analytics = inject(AnalyticsService);


  alterarCookies(): void {
    this.analytics.abrirPreferencias();
  }

}
