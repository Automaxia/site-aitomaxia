import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular';

@Component({
    selector: 'automaxia-termos',
    templateUrl: './termos.page.html',
    styleUrls: ['./termos.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IonContent, RouterLink],
})
export class TermosPage {}
