# Radar · TASKS (o que fazer, em que ordem)

> Tarefas para entregar a [SPEC](SPEC.md) conforme o [SDD](SDD.md).
> **Cópia idêntica** em `site-balance/docs/radar/` e `site-aitomaxia/docs/radar/`: as seções
> **Núcleo** valem para o repositório do Radar; as seções **site-balance** e **site-aitomaxia**
> valem para cada site.
> Criado em 10/11/2026. Tamanho: **P** até 1 dia · **M** 2 a 3 dias · **G** 4 a 5 dias.
> Estado: ⬜ a fazer · 🟨 em andamento · ✅ feito · ⏸️ bloqueado.

---

## Estado atual

Nada implementado. Próximo passo: **F0**, responder D1 a D4 da SPEC §11. Sem a D2 (onde roda e
quem é o dono dos dados) não dá para criar a infraestrutura.

---

## F0 · Decisões

| # | Tarefa | Tam. | Estado | Aceite |
|---|---|---|---|---|
| T00a | Decidir o nome do sistema (D1) | P | ⬜ | Nome registrado na SPEC; repositório e imagens usam o nome |
| T00b | Decidir onde roda e quem é o dono dos dados (D2) | P | ⬜ | Opção registrada na SPEC; se (b), contrato de operador previsto |
| T00c | Decidir painel e login: próprio ou satélite do Cockpit (D3) | P | ⬜ | Opção registrada; define a T11 |
| T00d | Decidir remetente dos avisos por site (D4) | P | ⬜ | Caixa e credencial SMTP definidas por site |

## F1 · Coleta + leads (Núcleo)

| # | Tarefa | Tam. | Estado | Depende | Aceite |
|---|---|---|---|---|---|
| T01 | Criar o repositório `radar` (backend + frontend), CI de testes em PR, padrão do `turing-backend` | P | ⬜ | T00a | PR roda testes; `main` protegida |
| T02 | Schema `radar` e migrations (Alembic): `sites`, `visitantes`, `sessoes`, `eventos` (partição mensal), `leads`, `envios`, `avisos`, `auditoria` | M | ⬜ | T01 | `alembic upgrade head` num banco vazio; partição do mês corrente e do próximo criadas |
| T03 | `POST /r/v1/e`: validação, chave do site, origem, lista de eventos, normalização de página e *referrer*, redução de *user agent*, robôs, sessão (30 min), UTM e canal | G | ⬜ | T02 | Testes de contrato do SDD §11 passando; nenhum IP gravado |
| T04 | `POST /r/v1/lead`: lead por e-mail normalizado, envio, vínculo com `vid`, domínio da empresa, aviso na *outbox* | M | ⬜ | T02 | Lead com e sem `vid`; reenvio do mesmo e-mail cai no mesmo lead |
| T05 | `POST /r/v1/revogar`: apaga visitante, sessões e eventos; desfaz vínculo; idempotente | P | ⬜ | T02 | Lead permanece; navegação some; segunda chamada não erra |
| T06 | `radar.js` (≤ 3 KB gz): `vid`/`sid`, `pageview` (inclui `pushState`), fila em lote, `sendBeacon`, `track`/`lead`/`revogar`, silêncio com `navigator.webdriver` e `prerender` | G | ⬜ | T03 | Tamanho medido no CI; nenhuma exceção sobe para a página |
| T07 | Limites: corpo 8 KB, 20 eventos/lote, taxa por `site_key` e por `vid` (nunca por IP) | P | ⬜ | T03 | `413` e `429` testados |
| T08 | `radar-worker`: *outbox* de avisos por SMTP (lead novo), 5 tentativas com espera crescente | M | ⬜ | T04, T00d | Aviso chega em < 2 min; SMTP fora do ar não perde aviso |
| T09 | Imagem, Helm chart, CI de publicação (tag do SHA) e deploy da instância do Balance (schema no `postgres-dev`, role `radar_app`, pool 5) | M | ⬜ | T00b, T03 | `/health` e `/ready` verdes no cluster; role sem acesso fora do schema |
| T10 | Observabilidade: logs estruturados, contadores aceitos/recusados por motivo, alerta de 24 h sem eventos por site | P | ⬜ | T09 | Alerta disparado num teste com site sem tráfego |

## F1 · site-balance

| # | Tarefa | Tam. | Estado | Depende | Aceite |
|---|---|---|---|---|---|
| B01 | `deploy/nginx.conf`: `location /r/` com *proxy* para `radar-api`; `POST` liberado **só** em `/r/`; `client_max_body_size 8k` só ali; CSP inalterada | P | ⬜ | T09 | `POST` em qualquer outro caminho continua `405`; probes e redirects intactos |
| B02 | NetworkPolicy do pod `balance-site`: *egress* só para o Service `radar-api` | P | ⬜ | B01 | Pod não alcança outro serviço do cluster |
| B03 | `ConsentBanner.astro`: aceitar carrega `/r/radar.js` (chave em `site.ts` → `radar.siteKey`); recusar chama `radar.revogar()` e apaga `radar_vid`/`radar_vid_t` | P | ⬜ | T06 | Roteiro do SDD §11 passando no Chrome com a imagem do nginx |
| B04 | `HubspotForm.astro`: envio do lead ao Radar em paralelo ao Web3Forms (função do SDD §4), com `vid` se houver | P | ⬜ | T04 | Lead chega por e-mail **e** no Radar; Radar fora do ar não afeta o envio |
| B05 | Políticas de Privacidade e de Cookies (PT, EN, ES): Radar como tratamento próprio, dados no Brasil, `radar_vid` na lista; texto do aviso de cookies | M | ⬜ | T00b | Paridade PT/EN/ES conferida; enviado para revisão jurídica (D6) |
| B06 | Fase paralela: 2 semanas comparando leads (Radar × caixa `falecom@`) e audiência (Radar × HubSpot) | P | ⬜ | B03, B04 | Relatório com a diferença; zero lead perdido |

## F2 · Painel (Núcleo)

| # | Tarefa | Tam. | Estado | Depende | Aceite |
|---|---|---|---|---|---|
| T11 | Autenticação plugável: `LoginProprio` (Argon2id, TOTP para admin, bloqueio 5×/15 min) e/ou `CockpitJwt` conforme T00c | M | ⬜ | T00c, T02 | Papéis aplicados no servidor; testes de acesso entre sites (RN-06) |
| T12 | API do painel: leads (lista, filtros, CSV), lead (linha do tempo), anotações, status, responsável | G | ⬜ | T11 | Toda leitura de dado pessoal gera linha em `auditoria` |
| T13 | API de audiência: cartões, série diária, páginas, origens, campanhas, dispositivos, funil | M | ⬜ | T03 | Consultas < 1 s com 6 meses de dados simulados |
| T14 | `radar-web`: telas Leads, Lead, Audiência; aviso na tela de que os números são só de quem aceitou | G | ⬜ | T12, T13 | Usado pelo comercial do Balance por 1 semana |
| T15 | Aviso de retorno (no máximo 1 por lead a cada 24 h) e, opcional, Teams por webhook | P | ⬜ | T08 | Retorno dentro de 24 h não gera segundo aviso |
| T16 | Agrupamento por empresa (domínio do e-mail, lista de domínios pessoais) | P | ⬜ | T12 | Gmail/Outlook não agrupam |

## F3 · site-aitomaxia

| # | Tarefa | Tam. | Estado | Depende | Aceite |
|---|---|---|---|---|---|
| A01 | Instância do Radar da Automaxia (D2): contêineres + Postgres próprio, ou site cadastrado na instância única | M | ⬜ | T00b, T09 | `/health` verde; site cadastrado com domínio `automaxia.com.br` |
| A02 | `default.conf`: `location /r/` com *proxy* para a instância da A01 | P | ⬜ | A01 | `POST` só em `/r/`; demais rotas inalteradas |
| A03 | `analytics.service.ts`: aceitar carrega o Radar junto com o GA4; recusar chama `radar.revogar()`; `iniciar()` respeita a escolha salva | P | ⬜ | T06 | Roteiro do SDD §11 passando; GA4 continua igual |
| A04 | `home.page.ts` (`sendEmail`): envio do lead ao Radar em paralelo ao EmailJS | P | ⬜ | T04 | Lead chega por e-mail **e** no Radar |
| A05 | Conferir que o pré-render (`scripts/prerender.mjs`) não gera eventos (perfil sem escolha salva não carrega o Radar; origem `127.0.0.1` é descartada) | P | ⬜ | T06 | Zero eventos no banco após um build |
| A06 | Política de privacidade e texto do banner de cookies citando o Radar | P | ⬜ | T00b | Enviado para revisão jurídica (D6) |
| A07 | Fase paralela: 2 semanas comparando leads (Radar × e-mail) e audiência (Radar × GA4) | P | ⬜ | A03, A04 | Relatório com a diferença; zero lead perdido |

## F4 · LGPD operacional (Núcleo)

| # | Tarefa | Tam. | Estado | Depende | Aceite |
|---|---|---|---|---|---|
| T17 | Retenção automática (CronJob diário): anônimo 6 meses, lead 24 meses, avisos 90 dias, auditoria 5 anos, `DROP` de partição | M | ⬜ | T02 | Teste com dados datados no passado; contagens na `auditoria` |
| T18 | Direitos do titular: buscar e-mail em todos os sites, exportar (JSON), apagar em transação; registro em `titulares` | M | ⬜ | T12 | Ensaio de ponta a ponta em < 15 min |
| T19 | Tela de auditoria (quem viu ou exportou qual lead, quando) | P | ⬜ | T12 | Filtro por usuário e por lead |
| T20 | Teste de carga (10× o RNF-06 por 10 min) | P | ⬜ | T09 | Sem erro e sem fila crescente no worker |

## F5 · Decisão

| # | Tarefa | Tam. | Estado | Depende | Aceite |
|---|---|---|---|---|---|
| T21 | Comparar as métricas da SPEC §9 e decidir manter ou desligar HubSpot (Balance) e GA4 (Automaxia) (D5) | P | ⬜ | B06, A07 | Decisão registrada na SPEC |
| T22 | Se desligar: tirar o script, os domínios da CSP e os trechos das políticas do HubSpot/GA4 | P | ⬜ | T21 | CSP sem domínios de terceiros que não são usados |
| T23 | Quando o repositório `radar` estiver no ar: mover estes três documentos para lá e deixar nos sites só um ponteiro | P | ⬜ | T01 | Uma fonte da verdade |
