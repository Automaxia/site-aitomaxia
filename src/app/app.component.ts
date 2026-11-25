import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { BreakPointType, ResponsiveService } from '../shared/services/responsive.service';
import { ROUTE } from '../shared/constants/route';
import { Router } from '@angular/router';
import { register } from 'swiper/element/bundle';
import { AnalyticsService } from '../shared/services/analytics.service';
import { SeoService } from '../shared/services/seo.service';

register();

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AppComponent {
	private responsiveService = inject(ResponsiveService);
	private router = inject(Router);

	tipoDispositivo: string;

	constructor() {
		const responsiveService = this.responsiveService;
		const analytics = inject(AnalyticsService);
		const seo = inject(SeoService);

		responsiveService.$mediaBreakpoint.subscribe(this.verificarDispositivo.bind(this));
		analytics.iniciar();
		seo.iniciar();
	}

	inicio() {
		this.router.navigateByUrl(`/${ROUTE.HOME}`);
	}

	verificarDispositivo(breakpoint: BreakPointType) {
		if (['xs', 'sm'].includes(breakpoint)) {
			this.tipoDispositivo = 'mobile';
			console.log('dispositivo: ', this.tipoDispositivo);
		} else if (breakpoint === 'md') {
			this.tipoDispositivo = 'tablet';
			console.log('dispositivo: ', this.tipoDispositivo);
		} else {
			this.tipoDispositivo = 'desktop';
			console.log('dispositivo: ', this.tipoDispositivo);
		}
	}
}
