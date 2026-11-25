import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'automaxia-hero-home',
    templateUrl: './hero-home.component.html',
    styleUrls: ['./hero-home.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HeroHomeComponent  {

  constructor() { }

}
