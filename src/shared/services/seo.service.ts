import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SERVICOS } from '../constants/servicos';

const SITE = 'https://automaxia.com.br';

interface PaginaSeo {
  titulo: string;
  descricao: string;
}

const PAGINAS: Record<string, PaginaSeo> = {
  '/': {
    titulo: 'Automaxia – Automação e Inteligência Artificial para Empresas',
    descricao: 'A Automaxia une automação (RPA), dados e inteligência artificial para simplificar o trabalho e potencializar a inteligência humana nas empresas. Fale com a gente.',
  },
  '/privacidade': {
    titulo: 'Política de Privacidade | Automaxia',
    descricao: 'Como a Automaxia trata os dados pessoais de quem visita o site e entra em contato, conforme a LGPD.',
  },
  '/termos': {
    titulo: 'Termos de Uso | Automaxia',
    descricao: 'Termos e condições de uso do site da Automaxia.',
  },
};
for (const s of SERVICOS) {
  PAGINAS['/' + s.slug] = { titulo: s.tituloSeo, descricao: s.descricaoSeo };
}

/** Mantém título, descrição, canônico e Open Graph de acordo com a rota atual. */
@Injectable({ providedIn: 'root' })
export class SeoService {

  constructor(private readonly router: Router,
              private readonly title: Title,
              private readonly meta: Meta,
              @Inject(DOCUMENT) private readonly document: Document) { }

  iniciar(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.aplicar(e.urlAfterRedirects));
  }

  private aplicar(url: string): void {
    const caminho = (url.split(/[?#]/)[0].replace(/\/+$/, '')) || '/';
    const pagina = PAGINAS[caminho] ?? PAGINAS['/'];
    const endereco = SITE + (caminho === '/' ? '/' : caminho);

    this.title.setTitle(pagina.titulo);
    this.meta.updateTag({ name: 'description', content: pagina.descricao });
    this.meta.updateTag({ property: 'og:title', content: pagina.titulo });
    this.meta.updateTag({ property: 'og:description', content: pagina.descricao });
    this.meta.updateTag({ property: 'og:url', content: endereco });

    let canonico = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonico) {
      canonico = this.document.createElement('link');
      canonico.rel = 'canonical';
      this.document.head.appendChild(canonico);
    }
    canonico.href = endereco;
  }
}
