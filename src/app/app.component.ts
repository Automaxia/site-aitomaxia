import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { CookieBannerComponent } from '../shared/components/cookie-banner/cookie-banner.component';
import { registrarIcones } from '../shared/icones';
import { AnalyticsService } from '../shared/services/analytics.service';
import { SeoService } from '../shared/services/seo.service';

register();
registrarIcones();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonApp, IonRouterOutlet, CookieBannerComponent],
})
export class AppComponent {
  constructor() {
    inject(AnalyticsService).iniciar();
    inject(SeoService).iniciar();
  }
}
