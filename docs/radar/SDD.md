# Radar · SDD (como)

> Desenho técnico do que a [SPEC](SPEC.md) pede. Tarefas em [TASKS](TASKS.md).
> **Cópia idêntica** em `radar/docs/` (fonte da verdade), `site-balance/docs/radar/` e
> `site-aitomaxia/docs/radar/`. Criado em 10/11/2026. Estado: **F1 do núcleo implementada** em
> `radar/backend` (26/11/2026), nada no ar. As escolhas seguem o padrão do ecossistema Balance
> (FastAPI, PostgreSQL, Helm, GitHub Actions, registry Magalu) para o Radar caber no mesmo cluster
> e na mesma rotina de operação.

---

## 1. Visão geral

```
 navegador do visitante                       site (nginx do próprio site)            Radar
 ───────────────────────                      ────────────────────────────            ─────
 aviso de cookies ── "Aceitar" ──► GET  /r/radar.js ──── proxy ────────────► radar-api ──┐
 radar.js ── visita/evento ──────► POST /r/v1/e  ──────── proxy ────────────► radar-api   │
 formulário ── envio ────────────► POST /r/v1/lead ────── proxy ────────────► radar-api   │
 aviso de cookies ── "Recusar" ──► POST /r/v1/revogar ─── proxy ────────────► radar-api   │
                                                                                         ▼
                                                                         PostgreSQL (schema radar)
                                                                                         ▲
 painel (comercial, gestão, admin) ── HTTPS ─────────────────────────────► radar-api ────┤
                                                                                         │
                                                           radar-worker (avisos, retenção)┘
                                                                ├── e-mail (SMTP)
                                                                └── Teams (webhook, opcional)
```

Três peças, uma imagem só:

| Peça | O que é | Como roda |
|---|---|---|
| `radar-api` | FastAPI: coleta pública (`/r/v1/*`), script (`/r/radar.js`) e API do painel (`/api/*`) | Deployment, 1 a 2 réplicas |
| `radar-worker` | Mesmo código, outro comando: fila de avisos (*outbox*) e rotinas de retenção | Deployment (avisos) + CronJob diário (retenção) |
| `radar-web` | Painel (Angular, como os outros frontends do ecossistema) | Deployment nginx não root |

**Por que tudo passa pelo domínio do site (`/r/…`).** A CSP dos dois sites fica intacta
(`script-src 'self'`, `connect-src 'self'`), não há CORS, e o script não depende de cookie de
terceiro. Bloqueadores de anúncio também tendem a ignorar caminhos do próprio site. O custo é um
`location /r/` no nginx de cada site (§8).

## 2. Script de coleta (`radar.js`)

Servido pela `radar-api` em `/r/radar.js`, com `Cache-Control: public, max-age=3600`. Uma versão
só, para todos os sites: atualizar o Radar não exige *rebuild* dos sites. Escrito direto em
JavaScript ES2018, sem etapa de build (26/11/2026: o script é pequeno e um build não compensava),
no máximo 3 KB comprimido (hoje 2,3 KB, conferido no teste), sem dependências.
`backend/src/radar/static/radar.js`.

**Carregamento.** O site só injeta o script depois do aceite, com atributos:

```html
<script src="/r/radar.js" data-site="pk_balance_3f9a…" async></script>
```

**API pública no `window`** (única superfície que os sites usam):

```ts
window.radar = {
  track(evento: string, dados?: Record<string, string | number>): void,
  lead(campos: LeadCampos): void,   // chamado pelo formulário; funciona mesmo sem medição (§4)
  revogar(): void,                  // chamado pelo "Recusar"
};
```

**Comportamento.**
1. Lê ou cria `radar_vid` (UUID v4, `crypto.randomUUID`) e `radar_vid_t` (criação) no
   `localStorage`. Se a criação passou de 6 meses, gera um novo. Sem `localStorage`, usa um
   identificador só da aba (a visita conta, mas não liga a visitas futuras).
2. Mantém `radar_sid` (sessão) no `sessionStorage`, renovado após 30 minutos sem atividade.
3. Envia `pageview` ao carregar e a cada troca de rota (`history.pushState`/`popstate`, necessário
   no Angular da Automaxia; no Astro cada página é um carregamento completo).
4. Junta eventos numa fila e envia em lote: a cada 5 segundos, ao atingir 10 eventos, e no
   `visibilitychange` para `hidden` (por `navigator.sendBeacon`, que sobrevive ao fechamento da aba).
5. Não envia nada se `navigator.webdriver === true` (navegador controlado por automação) ou se
   `document.visibilityState` for `prerender`.
6. Nenhum erro do Radar sobe para a página (`try/catch` em toda a superfície pública).

## 3. API de coleta (pública)

Todas as rotas exigem `site_key` (chave pública do site, no corpo) e `Origin` ou `Referer` dentro
dos domínios cadastrados do site. Corpo JSON de no máximo 8 KB. Resposta `202` sem corpo, sempre
que o formato for válido, mesmo se o evento for descartado por regra (para não dar pistas a quem
forja envio); `400` só para JSON malformado; `413` acima do tamanho; `429` acima da taxa.

### `POST /r/v1/e` · eventos
```json
{
  "site_key": "pk_balance_3f9a…",
  "vid": "8c0e…-uuid",
  "sid": "a71b…-uuid",
  "eventos": [
    { "t": "pageview", "ts": 1794343770642, "u": "/saneamento", "ti": "Balance Saneamento",
      "r": "https://www.linkedin.com/feed/", "utm": { "source": "linkedin", "campaign": "lancamento" },
      "lg": "pt-BR", "sw": 1920 },
    { "t": "cta", "ts": 1794343790000, "u": "/saneamento", "d": { "id": "agendar-demo" } }
  ]
}
```
Até 20 eventos por lote. O servidor:
- descarta página fora dos domínios do site (RN-03) e evento fora da lista do site (RF-02);
- reduz `r` (*referrer*) a esquema + host + caminho, e ignora quando é o próprio site;
- reduz o *user agent* do cabeçalho a `dispositivo` (desktop, tablet, celular) e `navegador`
  (família), e descarta o original;
- classifica robô pelo *user agent* (lista mantida no código) e descarta;
- usa o `ts` do cliente só se estiver a menos de 10 minutos do relógio do servidor; senão, usa o do servidor.

### `POST /r/v1/lead` · lead do formulário
```json
{
  "site_key": "pk_balance_3f9a…",
  "vid": "8c0e…-uuid",
  "campos": { "nome": "…", "email": "…", "empresa": "…", "segmento": "Saneamento",
              "telefone": "…", "mensagem": "…" },
  "pagina": "/fale-conosco",
  "idioma": "pt",
  "aceite_formulario": "2026-11-10T15:32:00-03:00"
}
```
- `vid` só vem se houver aceite de medição (o site não carrega o script sem aceite; nesse caso o
  formulário chama a rota diretamente, sem `vid`, ver §4).
- Campos aceitos por site: lista no cadastro do site. Campo desconhecido é descartado.
- Cria ou atualiza o lead por `(site_id, email_normalizado)`, grava o envio e enfileira o aviso.

### `POST /r/v1/revogar`
```json
{ "site_key": "pk_balance_3f9a…", "vid": "8c0e…-uuid" }
```
Apaga eventos, sessões e o visitante; desfaz o vínculo com o lead (o lead fica, RN-04). Idempotente.

### `GET /r/radar.js`
Script do §2.

## 4. Lead sem aceite de medição

O formulário precisa mandar o lead ao Radar mesmo quando o visitante recusou a medição (RF-08). Para
isso não depender do `radar.js`, cada site tem uma função própria de envio, pequena, que faz o
`POST /r/v1/lead` diretamente, **sem `vid`**, em paralelo ao envio atual (Web3Forms ou EmailJS).
Se o `radar.js` estiver carregado, a função inclui o `vid` dele (`window.radar?.vid`).

## 5. Modelo de dados (PostgreSQL, schema `radar`)

```
sites            id, nome, chave_publica (único), dominios text[], eventos_permitidos text[],
                 campos_lead text[], avisos_email text[], avisos_teams_url (cifrado),
                 retencao_anonimo_dias (180), retencao_lead_dias (730), criado_em

visitantes       id uuid (= vid), site_id, criado_em, visto_em, lead_id null,
                 dispositivo, navegador
sessoes          id uuid (= sid), site_id, visitante_id, inicio, fim, pagina_entrada,
                 origem_host, origem_caminho, canal (direto|busca|social|referencia|campanha),
                 utm_source, utm_medium, utm_campaign, utm_term, utm_content, paginas int
eventos          id bigserial, site_id, sessao_id, visitante_id, tipo, pagina, titulo,
                 dados jsonb, ocorrido_em          ← particionada por mês (ocorrido_em)

leads            id uuid, site_id, email_normalizado, nome, empresa, dominio_empresa null,
                 segmento, telefone, status, responsavel_id null, criado_em, atividade_em
                 único (site_id, email_normalizado)
envios           id, lead_id, campos jsonb, pagina, idioma, aceite_formulario, recebido_em
anotacoes        id, lead_id, autor_id, texto, criado_em
status_historico id, lead_id, de, para, autor_id, em

avisos           id, site_id, lead_id, tipo (lead_novo|novo_envio|retorno), estado
                 (pendente|enviado|falhou|sem_destino), tentativas, proxima_tentativa,
                 enviado_em, erro   ← outbox
usuarios         id, email, nome, papel (admin|comercial|leitura), sites uuid[],
                 senha_hash null, totp null, ativo           (login próprio, §7)
auditoria        id, usuario_id, acao, alvo_tipo, alvo_id, detalhe jsonb, em
titulares        id, email, pedido (acesso|exclusao), atendido_por, atendido_em, resultado jsonb
```

Índices principais: `eventos (site_id, ocorrido_em)`, `eventos (visitante_id)`,
`sessoes (site_id, inicio)`, `leads (site_id, atividade_em desc)`, `leads (dominio_empresa)`.

**Vínculo visita → lead (RF-09).** No `POST /r/v1/lead` com `vid`: `visitantes.lead_id = lead.id`.
A linha do tempo do lead é a união de `envios`, `anotacoes`, `status_historico` e das `sessoes` e
`eventos` de todos os visitantes com aquele `lead_id` (o lead pode ter vindo de mais de um
navegador). Não há cópia: revogar ou apagar o visitante tira a navegação da linha do tempo.

**Retorno (RF-11).** Ao abrir uma sessão nova de visitante com `lead_id`, grava um evento
`retorno` e, se o último aviso de retorno daquele lead tiver mais de 24 horas, enfileira um aviso.

**Empresa (RF-12).** `dominio_empresa` = domínio do e-mail, exceto numa lista de domínios de
e-mail pessoal mantida no código. O painel agrupa leads pelo domínio.

**Volume.** 50 mil eventos/dia ≈ 18 milhões/ano ≈ 4 a 6 GB/ano com índices. A partição mensal
deixa a retenção barata (apagar partição inteira em vez de `DELETE` linha a linha).

## 6. Avisos e retenção (`radar-worker`)

- **Avisos.** Laço que lê `avisos` em estado `pendente` (`FOR UPDATE SKIP LOCKED`), monta o e-mail
  (lead, origem da primeira sessão, últimas 10 páginas, link para o painel) e envia por SMTP. Até 5
  tentativas com espera crescente, depois `falhou` e um alerta no log. A *outbox* garante que um
  lead nunca fica sem aviso por queda momentânea do SMTP, e que o `POST /lead` responde rápido.
- **Retenção (CronJob diário, 03:00).**
  - visitantes sem lead, sem evento há mais de `retencao_anonimo_dias`: apaga visitante, sessões e eventos;
  - leads sem atividade há mais de `retencao_lead_dias`: apaga lead, envios, anotações, histórico, navegação ligada;
  - partições de `eventos` inteiras fora do prazo: `DROP`;
  - `avisos` com mais de 90 dias: apaga; `auditoria` com mais de 5 anos: apaga;
  - registra o que apagou (contagens) na `auditoria`.

## 7. Painel e autenticação

**Telas (F2).** Leads (lista, filtros, CSV) · Lead (dados, linha do tempo, status, responsável,
anotações, outros leads da empresa) · Audiência (cartões, série diária, páginas, origens,
campanhas, dispositivos, funil) · Admin: sites, usuários, titulares, auditoria.

**API do painel.** `/api/leads`, `/api/leads/{id}`, `/api/leads/{id}/anotacoes`,
`/api/leads/{id}/status`, `/api/audiencia?site=&de=&ate=`, `/api/sites`, `/api/usuarios`,
`/api/titulares/{email}` (GET exporta, DELETE apaga), `/api/auditoria`. Todas com `Authorization:
Bearer`, filtradas pelos sites do usuário (RN-06), e as que mostram dado pessoal gravam auditoria (RN-07).

**Autenticação plugável (D3).** Interface `Autenticador` com duas implementações:
- `LoginProprio`: usuários na tabela `usuarios`, senha com Argon2id, TOTP obrigatório para `admin`,
  JWT curto (30 min) + renovação, bloqueio após 5 falhas por 15 min (mesma regra do Cockpit).
- `CockpitJwt`: valida o JWT da plataforma Balance com `infrabalance_utils.get_current_user` e
  mapeia permissões do Cockpit (`radar:admin`, `radar:comercial`, `radar:leitura`) declaradas no
  `ProductManifest`, como os outros satélites.
A escolha é por instância (variável de ambiente), o que serve à opção (a) da D2.

## 8. Integração nos sites

### 8.1 nginx de cada site
```nginx
# Radar: script e coleta pelo próprio domínio (CSP 'self', sem CORS).
location /r/ {
    limit_except GET POST { deny all; }
    client_max_body_size 8k;
    proxy_pass http://radar-api.<namespace>.svc.cluster.local/r/;   # ou o endereço da instância
    proxy_set_header Host $host;
    proxy_set_header Origin $http_origin;
    proxy_set_header User-Agent $http_user_agent;
    proxy_connect_timeout 2s;
    proxy_read_timeout 5s;
}
```
- **site-balance:** o `deploy/nginx.conf` hoje recusa qualquer método além de GET/HEAD no `server`
  inteiro (`if ($request_method !~ ^(GET|HEAD)$) { return 405; }`) e limita o corpo a 1 KB. A
  regra muda para liberar `POST` **só** em `/r/`, e o `client_max_body_size 8k` fica só nesse
  `location`. A CSP não muda. O `deploy/SEGURANCA.md` §3 recomenda negar todo *egress* do pod do
  site: a NetworkPolicy precisa permitir saída só para o Service `radar-api`.
- **site-aitomaxia:** o `default.conf` ganha o mesmo `location`. Se o Radar da Automaxia rodar em
  outro servidor (D2), o `proxy_pass` aponta para ele por HTTPS.

### 8.2 site-balance (Astro)
- `src/components/global/ConsentBanner.astro`: no aceite, além do HubSpot, injeta
  `<script src="/r/radar.js" data-site="…">`; no "Recusar", chama `window.radar?.revogar()` e apaga
  `radar_vid`/`radar_vid_t`. A chave pública do site vai em `src/data/site.ts` (`radar.siteKey`).
- `src/components/forms/HubspotForm.astro`: no envio pelo Web3Forms, chama a função de envio do
  §4 em paralelo, com os mesmos campos e o `vid`, se houver.
- Políticas (`src/data/{pt,en,es}/legal.ts`): Radar como tratamento próprio da Linedata, dados no
  Brasil, `radar_vid` na lista da Política de Cookies (armazenamento local, 6 meses).

### 8.3 site-aitomaxia (Angular)
- `src/shared/services/analytics.service.ts`: `aceitar()` carrega o Radar junto com o GA4;
  `recusar()` chama `radar.revogar()`; `iniciar()` carrega o Radar se a escolha salva for `aceito`.
  O texto do banner (`cookie-banner.component.html`) passa a citar o Radar.
- `src/app/home/home.page.ts` (`sendEmail`): depois da validação, chama a função de envio do §4 em
  paralelo ao `EmailService.envioemail`.
- Troca de rota do Angular: o `radar.js` já detecta `pushState`, sem código no app.
- `scripts/prerender.mjs`: roda `chromium --headless=new --dump-dom` direto (sem automação por
  DevTools, então `navigator.webdriver` **não** é `true`). Mesmo assim o pré-render não gera
  eventos: o perfil começa sem escolha salva, então o Radar nunca é carregado (o banner fica
  aberto e é removido do HTML por `limparConteudo`), e a origem `127.0.0.1` estaria fora dos
  domínios do site (RN-03). Não é preciso mudar o pré-render.

## 9. Segurança e privacidade

- **Chave pública do site** não é segredo (vai no HTML), como a do Web3Forms. A proteção real é o
  conjunto: domínio de origem conferido, páginas fora do site descartadas, lista fechada de
  eventos e de campos, limites de tamanho e de taxa.
- **Limite de taxa sem IP.** O limite é por `site_key` (teto global) e por `vid`, nunca por IP: o
  `vid` é aleatório e o atacante troca à vontade, mas o teto por site segura o volume. Desde
  17/11/2026 o IP real chega ao cluster Balance (PROXY protocol no LB, `X-Forwarded-For` limpo pelo
  Traefik, ver `CLAUDE.md` do ecossistema, T78); um limite **em memória** por IP pode ser somado se
  aparecer abuso, lendo o XFF como os outros backends e **sem gravar** o IP. Na instância da
  Automaxia, conferir antes se o proxy dela repassa o IP.
- **Nada de IP no banco**, nem em log de aplicação (o log de acesso do nginx segue a política atual do site).
- **Sem *fingerprinting*:** só o `vid` aleatório identifica o visitante.
- **Painel:** CSP própria sem `'unsafe-inline'` em `script-src`, `frame-ancestors 'none'`, HSTS,
  sessão curta, papéis no servidor (o menu do front não é barreira).
- **Erros** nunca devolvem `str(e)` ao cliente (regra do Cockpit, `mensagem_erro_interno`).
- **Segredos** (SMTP, webhook do Teams, chave do JWT) em Secret do k8s, nunca no repositório.
- **Exclusão de titular** apaga em transação única e grava em `titulares` o que foi apagado
  (contagens, não o conteúdo).

## 10. Deploy

- **Repositório próprio** (`radar`), com `backend/` (FastAPI, `radar-api` e `radar-worker`) e
  `frontend/` (painel). CI no padrão do `turing-backend`: testes em PR; em push na `main`, imagem
  com tag do SHA no registry Magalu e `helm upgrade` com a tag imutável.
- **Balance (D2-a):** namespace `dev` do cluster Balance, schema `radar` no `postgres-dev`
  (mesmo PgBouncer), role própria `radar_app` com acesso só ao schema. Cuidado com as conexões: o
  Postgres já ficou sem *slots* uma vez (01/10/2026); pool pequeno (5) e `idle_session_timeout`.
- **Automaxia (D2-a):** contêineres na infraestrutura da Automaxia, com Postgres próprio.
- **Migrations** em SQL numerado (`backend/migrations/NNN_nome.sql`, padrão do Cockpit e do motor),
  aplicadas por `python -m radar.cli migrar` num Job antes do rollout; um *advisory lock* impede duas
  aplicações ao mesmo tempo.
- Recursos iniciais: `radar-api` 100m/256Mi, `radar-worker` 50m/128Mi, `radar-web` 50m/64Mi.

## 11. Testes

- **Unitários:** normalização de página, *referrer* e e-mail; classificação de canal e de robô;
  regras de sessão e de retorno; retenção.
- **Contrato da API de coleta:** formatos válidos e inválidos, origem errada, tamanho, taxa,
  evento e campo fora da lista.
- **Ponta a ponta no navegador** (Playwright), o mesmo roteiro usado para validar o aviso de
  cookies do Balance em 10/11/2026: visitante novo sem nenhuma requisição ao Radar; recusar e
  navegar; aceitar e conferir eventos no banco; enviar formulário e conferir o vínculo; revogar e
  conferir que a navegação sumiu e o lead ficou; zero violações de CSP.
- **Carga:** 10× o volume do RNF-06 por 10 minutos sem erro e sem fila crescente no worker.

## 12. Riscos

| Risco | Mitigação |
|---|---|
| Números menores que HubSpot/GA4 por bloqueadores ou aceite baixo | Fase paralela (F1 a F3) para medir a diferença antes de decidir (F5) |
| Coleta forjada poluindo leads | Origem conferida, lista fechada de campos, aviso só para lead com e-mail válido; descarte manual pelo painel |
| Radar fora do ar | Formulário segue pelo canal atual; script falha em silêncio; alerta de 24 h sem eventos |
| Esgotar conexões do Postgres compartilhado | Pool pequeno, role com `idle_session_timeout`, monitorar `pg_stat_activity` |
| Custo de manutenção maior que o previsto | Escopo v1 fechado (SPEC §3); revisar na F5 |
