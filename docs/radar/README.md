# Radar

Medição de visitas e captação de leads própria, com consentimento, para o automaxia.com.br: liga
a navegação ao lead quando o formulário é enviado e avisa o comercial.

Os documentos (SPEC, SDD, TASKS) e o código ficam no repositório **`Automaxia/radar`** (privado),
pasta `docs/`. Esta pasta é só um ponteiro desde 26/11/2026.

O que muda neste site quando o Radar for ligado (tarefas A02 a A06 do TASKS):
- `default.conf`: `location /r/` com *proxy* para a instância do Radar;
- `src/shared/services/analytics.service.ts`: aceitar carrega o Radar junto com o GA4; recusar o revoga;
- `src/app/home/home.page.ts` (`sendEmail`): lead ao Radar em paralelo ao EmailJS;
- política de privacidade e texto do banner de cookies.
