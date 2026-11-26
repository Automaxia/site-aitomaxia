import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type EscolhaCookies = 'aceito' | 'recusado';

const GA_ID = 'G-1LVHJNKCHZ';
const CHAVE_ESCOLHA = 'automaxia_cookies_analise';

/** Radar: medição própria (repositório Automaxia/radar), servida pelo mesmo domínio em /r/. */
const RADAR_SITE = 'pk_Zo-DeUAocsiNXfcIGQPIpBgG';
const RADAR_BASE = '/r';

/**
 * Google Analytics 4 e Radar condicionados ao consentimento (LGPD).
 * Os scripts de medição só são carregados depois que o visitante aceita cookies de análise.
 * O lead do formulário vai ao Radar mesmo sem esse aceite (é o pedido de contato; ver `lead`).
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
      this.carregarRadar();
    } else if (escolha === null) {
      this.mostrarBanner$.next(true);
    }
  }

  aceitar(): void {
    this.salvarEscolha('aceito');
    this.mostrarBanner$.next(false);
    this.carregarGa();
    this.carregarRadar();
  }

  recusar(): void {
    this.salvarEscolha('recusado');
    this.mostrarBanner$.next(false);
    if (this.carregado) {
      this.gtag('consent', 'update', { analytics_storage: 'denied' });
      this.apagarCookiesGa();
    }
    this.revogarRadar();
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

  /**
   * Lead do formulário de contato ao Radar, em paralelo ao EmailJS. Vai mesmo sem o aceite de
   * medição (o visitante pediu o contato); com o aceite, leva o identificador da visita, que liga
   * o lead à navegação. Nunca falha o formulário: erro aqui é silencioso.
   */
  lead(campos: { nome: string; email: string; telefone: string }): void {
    try {
      const corpo = JSON.stringify({
        site_key: RADAR_SITE,
        vid: (window as any).radar?.vid || undefined,
        campos,
        pagina: location.pathname,
        idioma: (document.documentElement.lang || 'pt-BR').slice(0, 10),
        aceite_formulario: new Date().toISOString(),
      });
      fetch(`${RADAR_BASE}/v1/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: corpo,
        keepalive: true,
        credentials: 'omit',
      }).catch(() => undefined);
    } catch {
      // Sem Radar o formulário segue pelo EmailJS.
    }
  }

  private radarCarregado = false;

  private carregarRadar(): void {
    if (this.radarCarregado || (window as any).radar?.v) {
      return;
    }
    this.radarCarregado = true;
    const script = document.createElement('script');
    script.defer = true;
    script.src = `${RADAR_BASE}/radar.js`;
    script.setAttribute('data-site', RADAR_SITE);
    document.head.appendChild(script);
  }

  /**
   * "Recusar" depois de ter aceito: o Radar apaga a navegação deste navegador no servidor.
   * Se o script não estiver na página (outra visita), pede a exclusão direto pelo identificador salvo.
   */
  private revogarRadar(): void {
    const radar = (window as any).radar;
    if (radar?.revogar) {
      radar.revogar();
      return;
    }
    try {
      const vid = localStorage.getItem('radar_vid');
      if (vid) {
        navigator.sendBeacon?.(`${RADAR_BASE}/v1/revogar`, JSON.stringify({ site_key: RADAR_SITE, vid }));
        localStorage.removeItem('radar_vid');
        localStorage.removeItem('radar_vid_t');
      }
      sessionStorage.removeItem('radar_sid');
      sessionStorage.removeItem('radar_sid_t');
    } catch {
      // Armazenamento bloqueado: não há identificador a apagar.
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
