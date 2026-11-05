import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SERVICOS, Servico, SERVICOS_POR_SLUG } from '../../shared/constants/servicos';

@Component({
  selector: 'automaxia-servico',
  templateUrl: './servico.page.html',
  styleUrls: ['./servico.page.scss'],
})
export class ServicoPage {

  readonly servico: Servico;
  readonly outros: Servico[];

  constructor(route: ActivatedRoute) {
    // A rota pai (definida em app-routing) tem o slug como path.
    const slug = route.snapshot.parent?.routeConfig?.path ?? '';
    this.servico = SERVICOS_POR_SLUG[slug] ?? SERVICOS[0];
    this.outros = SERVICOS.filter(s => s.slug !== this.servico.slug);
  }
}
