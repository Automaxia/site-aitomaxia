import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { SERVICOS, Servico, SERVICOS_POR_SLUG } from '../../shared/constants/servicos';

@Component({
    selector: 'automaxia-servico',
    templateUrl: './servico.page.html',
    styleUrls: ['./servico.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IonContent, RouterLink],
})
export class ServicoPage {

  readonly servico: Servico;
  readonly outros: Servico[];

  constructor() {
    const route = inject(ActivatedRoute);

    // Cada serviço tem a própria rota (app.routes.ts) com o slug como path.
    const slug = route.snapshot.routeConfig?.path ?? '';
    this.servico = SERVICOS_POR_SLUG[slug] ?? SERVICOS[0];
    this.outros = SERVICOS.filter(s => s.slug !== this.servico.slug);
  }
}
