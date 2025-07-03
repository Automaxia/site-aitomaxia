import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { HeroHomeComponent } from './hero-home/hero-home.component';

const COMPONENTS: any = [
	NavbarComponent,
	HeroHomeComponent
];

@NgModule({
	declarations: [COMPONENTS],
	imports: [
		IonicModule,
		FormsModule,
		CommonModule,
		ReactiveFormsModule,
	],
	exports: [COMPONENTS],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class ComponentsModule {
}
