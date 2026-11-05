import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { HeroHomeComponent } from './hero-home/hero-home.component';
import { CookieBannerComponent } from './cookie-banner/cookie-banner.component';
import { RouterModule } from '@angular/router';

const COMPONENTS: any = [
	NavbarComponent,
	HeroHomeComponent,
	CookieBannerComponent
];

@NgModule({
	declarations: [COMPONENTS],
	imports: [
		IonicModule,
		FormsModule,
		CommonModule,
		ReactiveFormsModule,
		RouterModule,
	],
	exports: [COMPONENTS],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class ComponentsModule {
}
