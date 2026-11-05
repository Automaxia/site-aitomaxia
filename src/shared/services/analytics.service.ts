import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type EscolhaCookies = 'aceito' | 'recusado';

const GA_ID = 'G-1LVHJNKCHZ';
const CHAVE_ESCOLHA = 'automaxia_cookies_analise';

/**
 * Google Analytics 4 condicionado ao consentimento (LGPD).
 * O script do GA só é carregado depois que o visitante aceita cookies de análise.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  /** true enquanto o banner de cookies deve aparecer. */
  readonly mostrarBanner$ = new BehaviorSubject<boolean>(false);

  private carregado = false;

  iniciar(): void {
    const escolha = this.lerEscolha();
    if (escolha === 'aceito') {
      this.carregarGa();
    } else if (escolha === null) {
      this.mostrarBanner$.next(true);
    }
  }

  aceitar(): void {
    this.salvarEscolha('aceito');
    this.mostrarBanner$.next(false);
    this.carregarGa();
  }

  recusar(): void {
    this.salvarEscolha('recusado');
    this.mostrarBanner$.next(false);
    if (this.carregado) {
      this.gtag('consent', 'update', { analytics_storage: 'denied' });
      this.apagarCookiesGa();
    }
  }

  /** Reabre o banner para o visitante mudar a escolha. */
  abrirPreferencias(): void {
    this.mostrarBanner$.next(true);
  }

  /** Envia um evento ao GA (ignorado se não houver consentimento). */
  evento(nome: string, parametros: Record<string, unknown> = {}): void {
    if (this.carregado && this.lerEscolha() === 'aceito') {
      this.gtag('event', nome, parametros);
    }
  }

  private carregarGa(): void {
    if (this.carregado) {
      this.gtag('consent', 'update', { analytics_storage: 'granted' });
      return;
    }
    this.carregado = true;

    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    this.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    this.gtag('js', new Date());
    this.gtag('config', GA_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
  }

  private gtag(..._args: unknown[]): void {
    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    // O gtag.js exige o objeto `arguments`, não um array.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  }

  private apagarCookiesGa(): void {
    const dominio = location.hostname.replace(/^www\./, '');
    document.cookie.split(';')
      .map(c => c.split('=')[0].trim())
      .filter(nome => nome === '_ga' || nome.startsWith('_ga_'))
      .forEach(nome => {
        for (const d of ['', `; domain=${dominio}`, `; domain=.${dominio}`]) {
          document.cookie = `${nome}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`;
        }
      });
  }

  private lerEscolha(): EscolhaCookies | null {
    try {
      const v = localStorage.getItem(CHAVE_ESCOLHA);
      return v === 'aceito' || v === 'recusado' ? v : null;
    } catch {
      return null;
    }
  }

  private salvarEscolha(escolha: EscolhaCookies): void {
    try {
      localStorage.setItem(CHAVE_ESCOLHA, escolha);
    } catch {
      // Sem armazenamento disponível: a escolha vale só para esta visita.
    }
  }
}
