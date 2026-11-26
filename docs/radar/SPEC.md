# Radar · SPEC (o quê e por quê)

> **Nome provisório.** Sistema próprio de medição de visitas e captação de leads, no estilo da parte
> de "visitante → contato → comercial" do HubSpot, para os sites **balance.ia.br** (`site-balance`)
> e **automaxia.com.br** (`site-aitomaxia`).
>
> **Cópia idêntica** em `radar/docs/` (fonte da verdade desde 26/11/2026), `site-balance/docs/radar/`
> e `site-aitomaxia/docs/radar/`. Ao mudar, mudar as três; quando o repositório do Radar tiver
> remoto, as cópias dos sites viram um ponteiro (T23).
>
> Trio de documentos: **SPEC** (o quê e por quê) · [SDD](SDD.md) (como) · [TASKS](TASKS.md) (o que fazer, em que ordem).
> Criado em 10/11/2026. Estado: **F1 do núcleo implementada e testada localmente (26/11/2026)**;
> nada no ar. Ver TASKS §Estado atual.

---

## 1. Contexto

Os dois sites são institucionais B2B, de público pequeno e valioso, com ciclo de venda longo:

| | balance.ia.br | automaxia.com.br |
|---|---|---|
| Stack | Astro estático, nginx não root, k8s (cluster Balance, ns `dev`) | Angular 22 + Ionic 9 (standalone), pré-render, nginx em contêiner |
| Medição hoje | HubSpot (portal 51326184), carregado só após o aceite no aviso de cookies próprio (`ConsentBanner.astro`) | Google Analytics 4 (`G-1LVHJNKCHZ`), carregado só após o aceite (`AnalyticsService`) |
| Formulário | Web3Forms → `falecom@balance.ia.br` (+ captura do HubSpot, com aceite) | EmailJS → e-mail da Automaxia |
| Consentimento | `localStorage` `balance-consent` (6 meses), link "Preferências de cookies" no rodapé | `localStorage` `automaxia_cookies_analise`, banner com aceitar/recusar |

**O problema.** O valor para o comercial não está na estatística de tráfego, e sim em saber **qual
empresa se interessou, pelo quê, e quando voltou**. Hoje:

- No Balance, isso existe pelo HubSpot, mas os dados ficam fora do país, num fornecedor cujo plano
  sobe com o número de contatos, e sem integração com o ecossistema (Cockpit, Insight).
- Na Automaxia, o GA4 é anônimo: mostra tráfego, mas não liga a visita ao lead. O lead chega por
  e-mail sem nenhum contexto.

**Alternativas avaliadas (10/11/2026).** HubSpot gratuito (resolve o vínculo visita → lead, dados
fora do país, custo cresce), GA4 (anônimo, não resolve), Umami/Plausible/Matomo (medição própria,
sem vínculo com lead), Mautic (automação de marketing completa, pesada para o tamanho da
necessidade), Twenty/EspoCRM (CRM sem a medição). A recomendação inicial foi **não construir**; a
decisão foi **especificar uma solução própria**, enxuta, pelo controle dos dados, pela
integração com o ecossistema e para servir aos dois sites com um código só.

## 2. Objetivos

1. **Ligar a visita ao lead:** quando alguém envia o formulário, o comercial vê de onde a pessoa
   veio e o que ela leu antes, desde que ela tenha aceito a medição.
2. **Avisar o comercial** de lead novo e de lead conhecido que voltou ao site.
3. **Medir a audiência** com o essencial: páginas, origens, campanhas, por dia, por site.
4. **Dados sob controle:** banco próprio, no Brasil, sem terceiros na coleta.
5. **LGPD por desenho:** nada é coletado sem consentimento; sem IP guardado, sem *fingerprinting*;
   retenção automática; exportar e apagar os dados de um titular em minutos.
6. **Um código, vários sites:** multi-site desde o início.

## 3. Fora de escopo (v1)

- Automação de marketing (sequências de e-mail, nutrição, pontuação automática de lead).
- CRM completo (funil com etapas configuráveis, previsão de receita, várias pipelines).
- Disparo de e-mail em massa e newsletters.
- Publicidade, *remarketing*, integração com Google Ads/Meta.
- Enriquecimento por serviços de terceiros (Clearbit, Apollo etc.).
- Identificar empresa pelo IP (exigiria guardar ou consultar o IP do visitante, contra o RNF-04).
- Rastrear o visitante entre sites diferentes (cada site é um universo separado).
- Mapa de calor, gravação de sessão.

## 4. Personas

| Persona | O que faz |
|---|---|
| **Visitante** | Navega; aceita ou recusa a medição; envia o formulário. |
| **Comercial** | Recebe o aviso de lead novo ou de retorno; abre o lead e vê a linha do tempo; muda o status e anota. |
| **Gestão / marketing** | Vê a audiência por período, página, origem e campanha; exporta. |
| **Administrador** | Cadastra sites e usuários; atende pedidos de titulares (exportar, apagar). |
| **Titular de dados** | Pede acesso ou exclusão dos seus dados pelo e-mail do DPO. |

## 5. Requisitos funcionais

### Coleta
- **RF-01 · Visita de página.** Com o aceite, cada página vista gera um evento com: site, página
  (caminho, sem *query string* além de `utm_*`), título, página de origem (*referrer*, só host e
  caminho), data e hora, idioma do navegador, classe de dispositivo (desktop, tablet, celular) e
  largura da tela em faixas.
- **RF-02 · Eventos.** Clique em CTA, início de vídeo, envio de formulário, clique no WhatsApp e
  no e-mail. Lista fechada por site, declarada na configuração; evento fora da lista é descartado.
- **RF-03 · Visitante.** Identificador aleatório próprio do site, criado **só depois do aceite**,
  guardado no armazenamento local do navegador por **6 meses**. Sem cookie, sem *fingerprinting*.
- **RF-04 · Sessão.** Visitas do mesmo visitante com menos de 30 minutos de intervalo formam uma
  sessão. A origem e a página de entrada são as do primeiro evento da sessão.
- **RF-05 · Campanha.** `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` da
  página de entrada ficam na sessão.
- **RF-06 · Sem aceite, nada.** Sem aceite (ou com recusa), nenhum código do Radar é carregado e
  nenhuma requisição de medição sai do navegador.
- **RF-07 · Robôs.** Eventos de robôs conhecidos e navegadores automatizados são descartados.

### Leads
- **RF-08 · Captura do lead.** Ao enviar o formulário, o site manda o lead ao Radar **além** do
  canal atual (Web3Forms no Balance, EmailJS na Automaxia), que continua valendo. O lead é
  registrado com base no aceite do formulário, **com ou sem** o aceite de medição.
- **RF-09 · Vínculo visita → lead.** Se o visitante aceitou a medição, o lead herda todo o
  histórico daquele visitante, inclusive o anterior ao envio.
- **RF-10 · Lead único por e-mail.** O mesmo e-mail no mesmo site é o mesmo lead; envios novos
  entram na linha do tempo dele.
- **RF-11 · Retorno.** Visitante já ligado a um lead que volta ao site gera o evento "retorno".
- **RF-12 · Empresa pelo domínio.** O domínio do e-mail (`@cesama.com.br`) agrupa leads da mesma
  empresa; domínios de e-mail pessoal (gmail, outlook, hotmail etc.) não agrupam.

### Comercial
- **RF-13 · Aviso de lead novo.** E-mail ao comercial do site, com dados do lead, origem e páginas
  vistas, e link para o lead no painel. Lead que já existia e envia o formulário de novo também gera
  aviso ("Lead enviou de novo"). Opcional: mensagem num canal do Teams.
- **RF-14 · Aviso de retorno.** No máximo um aviso por lead a cada 24 horas.
- **RF-15 · Mini CRM.** Status do lead (novo, em contato, qualificado, descartado, cliente),
  responsável, anotações com data e autor, histórico de mudanças de status.

### Painel
- **RF-16 · Leads.** Lista com filtros (site, status, período, origem, segmento), busca por nome,
  e-mail e empresa, e exportação CSV.
- **RF-17 · Lead.** Dados, linha do tempo (envios, sessões, páginas, eventos, anotações, status) e
  outros leads da mesma empresa.
- **RF-18 · Audiência.** Por site e período: visitantes, sessões, páginas vistas, páginas mais
  vistas, origens, campanhas, dispositivos, e o funil página → formulário enviado. Os números são
  só de quem aceitou a medição, e o painel diz isso na tela.

### Administração e LGPD
- **RF-19 · Sites.** Cadastro de site: domínio(s), chave pública, eventos permitidos, destinatários
  dos avisos, prazos de retenção.
- **RF-20 · Usuários e papéis.** `admin`, `comercial` (leads do site dele) e `leitura` (só audiência).
- **RF-21 · Direitos do titular.** Buscar um e-mail em todos os sites; exportar tudo o que existe
  dele (JSON); apagar lead, envios, anotações e navegação ligada. Cada atendimento fica registrado.
- **RF-22 · Revogação.** Quem recusar depois de ter aceito tem o identificador apagado no navegador,
  e a navegação daquele visitante é apagada no servidor. O lead em si permanece, porque tem outra
  base legal, o aceite do formulário.
- **RF-23 · Retenção automática.** Navegação de visitante sem lead: 6 meses. Lead e navegação
  ligada: 24 meses desde a última atividade (o prazo que a Política de Privacidade do Balance já
  promete). Avisos enviados: 90 dias. Registro de auditoria: 5 anos.

## 6. Requisitos não funcionais

- **RNF-01 · Nunca atrapalhar o site.** O script tem no máximo 3 KB comprimido, carrega `async`
  depois da página e envia em lote, por `sendBeacon`. Radar fora do ar não pode quebrar a página
  nem o formulário: o envio ao Radar é sempre em paralelo e com falha silenciosa.
- **RNF-02 · CSP dos sites intacta.** Tudo passa pelo próprio domínio do site (`/r/…`, por *proxy*
  no nginx). Nenhum domínio novo entra na CSP, e `script-src` continua sem `'unsafe-inline'`.
- **RNF-03 · Dados no Brasil.** Banco e serviço em infraestrutura no país.
- **RNF-04 · Minimização.** Não guardar IP (nem truncado), nem *user agent* completo, nem *query
  string* além de `utm_*`, nem conteúdo digitado em campos que não sejam o formulário de contato.
- **RNF-05 · Segurança.** Painel com autenticação e papéis; coleta pública protegida por chave do
  site, conferência de origem, limite de tamanho e de taxa; segredos fora do código.
- **RNF-06 · Volume.** Dimensionado para até 50 mil eventos por dia somando os sites, com folga de 10×
  sem mudar a arquitetura.
- **RNF-07 · Observabilidade.** `/health`, `/ready`, logs estruturados e contadores (eventos
  aceitos e recusados por motivo). Alerta se um site ficar 24 horas sem nenhum evento.
- **RNF-08 · Idioma.** Painel em português; avisos ao comercial em português; o texto do aviso de
  cookies segue o idioma do site (PT, EN, ES no Balance).

## 7. Regras de negócio

- **RN-01** A medição depende do aceite de medição; o lead depende do aceite do formulário. São
  bases legais diferentes e uma não substitui a outra.
- **RN-02** O identificador de visitante não é compartilhado entre sites, nem entre `www` e o
  domínio sem `www` de sites diferentes.
- **RN-03** Página fora dos domínios cadastrados do site é descartada (evita poluição por cópias do
  site e por envio forjado).
- **RN-04** O lead nunca é apagado pela revogação da medição; só por pedido do titular ou pelo prazo.
- **RN-05** E-mail é normalizado (minúsculas, sem espaços) antes de comparar.
- **RN-06** O comercial de um site não vê leads de outro site.
- **RN-07** Todo acesso a dado pessoal pelo painel (abrir lead, exportar) fica no registro de auditoria.

## 8. Integração com cada site

**balance.ia.br (`site-balance`)**
- O `ConsentBanner.astro` passa a carregar também `/r/radar.js` no "Aceitar", e a apagar o
  identificador e avisar o Radar no "Recusar".
- O `HubspotForm.astro`, ao enviar pelo Web3Forms, envia o lead ao Radar em paralelo.
- `deploy/nginx.conf` ganha o *proxy* `/r/` e passa a aceitar `POST` só nesse caminho (hoje recusa
  tudo além de GET/HEAD, e o corpo máximo é 1 KB).
- Políticas de Privacidade e de Cookies (PT, EN, ES) passam a citar o Radar.
- O HubSpot continua no ar durante a fase paralela (§10).

**automaxia.com.br (`site-aitomaxia`)**
- O `AnalyticsService` (aceitar, recusar, abrir preferências) passa a controlar o Radar junto com o GA4.
- O envio do formulário em `home.page.ts` (`sendEmail`) manda o lead ao Radar em paralelo ao EmailJS.
- `default.conf` ganha o *proxy* `/r/`.
- A política de privacidade do site passa a citar o Radar.
- O GA4 continua no ar durante a fase paralela.

## 9. Métricas de sucesso

- 100% dos leads do formulário registrados no Radar (conferido contra a caixa de e-mail por 30 dias).
- Aviso de lead novo em menos de 2 minutos após o envio.
- Em fase paralela, audiência do Radar a ±10% da do HubSpot (Balance) e do GA4 (Automaxia), entre
  quem aceitou.
- Nenhuma mudança na pontuação de desempenho dos sites (Lighthouse) ao ligar o Radar.
- Pedido de titular atendido em menos de 15 minutos de trabalho.

## 10. Fases

| Fase | Entrega | Sai quando |
|---|---|---|
| **F0 · Decisões** | Respostas às decisões em aberto (§11) | D1 a D4 respondidas |
| **F1 · Coleta + leads** | API de coleta, script, banco, vínculo visita → lead, aviso de lead novo por e-mail; no ar no balance.ia.br em paralelo ao HubSpot | Leads chegando no Radar e no e-mail por 2 semanas sem perda |
| **F2 · Painel** | Leads, linha do tempo, audiência, mini CRM, aviso de retorno | Comercial usando o painel no lugar do e-mail |
| **F3 · Automaxia** | Integração no automaxia.com.br em paralelo ao GA4 | Mesmo critério da F1 |
| **F4 · LGPD operacional** | Tela de direitos do titular, retenção automática, auditoria | Teste de exportar e apagar um titular de ponta a ponta |
| **F5 · Decisão** | Manter ou desligar HubSpot e GA4, com base nas métricas do §9 | Decisão registrada |

## 11. Decisões em aberto

- **D1 · Nome** do sistema (Radar é provisório).
- **D2 · Onde roda e quem é o dono dos dados.** Os sites têm controladores diferentes (Linedata no
  Balance, Automaxia na Automaxia). Opções: (a) uma instância por dono, mesmo código (recomendado:
  dados do Balance no cluster Balance, dados da Automaxia na infraestrutura da Automaxia);
  (b) uma instância só, operada pela Automaxia, com contrato de operador para o Balance.
- **D3 · Painel e login.** (a) painel próprio com login próprio; (b) no Balance, painel como
  satélite do Cockpit (JWT da plataforma, como Insight e Chat). O SDD prevê autenticação plugável
  para permitir as duas.
- **D4 · Remetente dos avisos.** Caixa de envio por site (M365 no Balance) ou serviço de envio.
- **D5 · Futuro do HubSpot e do GA4** depois da F5.
- **D6 · Revisão jurídica** do texto do aviso de cookies e das políticas com o Radar.
