import { Component } from '@angular/core';
import { BreakPointType, ResponsiveService } from '../shared/services/responsive.service';
import { ROUTE } from '../shared/constants/route';
import { Router } from '@angular/router';
import { register } from 'swiper/element/bundle';

register();

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	styleUrls: ['app.component.scss'],
})
export class AppComponent {
	tipoDispositivo: string;

	constructor(private responsiveService: ResponsiveService,
	            private router: Router) {
		responsiveService.$mediaBreakpoint.subscribe(this.verificarDispositivo.bind(this));
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
