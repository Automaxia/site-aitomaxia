Automaxia
===============================

### Links úteis:

* [Ambiente de homologação web](https://automaxia.fjr.tec.br/)
* [Protótipo Figma](https://www.figma.com/file/bZuqSNiCEgXFnb1eXlBE6t/Hotsite---Automaxia?type=design&node-id=0%3A1&mode=design&t=KHYXE4CFdNhK1LfR-1)
* [Repositório Github](https://github.com/evandrofaria/automaxia-web)

### Pré-requisitos:

* [Node](https://nodejs.org) 26 LTS (ver `.nvmrc`; o Angular 22 aceita ^22.22.3, ^24.15 ou >=26)
* npm (o projeto usa só npm; o `package-lock.json` é a fonte das versões)

Versões principais (atualizadas em 25/11/2026): Angular 22, Ionic 9 (pela entrada `@ionic/angular/lazy`,
API de módulos), TypeScript 6, ESLint 10 (`eslint.config.js`), Swiper 14, Tailwind 3 + daisyUI 3.

> O Ionic 9 avisa no console que o `IonicModule` está obsoleto. O site ainda usa NgModules; migrar para
> componentes standalone (`provideIonicAngular`) é o próximo passo antes de uma versão do Ionic que remova a API.

# Desenvolvimento

```
$ npm ci
$ npm start            # ng serve em http://localhost:4200
$ npx ng lint
```

# Produção

A imagem Docker (`Dockerfile`) faz `npm ci`, `ng build`, o pré-render das rotas públicas
(`scripts/prerender.mjs`, com Chromium) e serve `www/` com `nginxinc/nginx-unprivileged` (sem root).

```
$ npm run build
$ node scripts/prerender.mjs     # precisa de Chromium (CHROME=/caminho para trocar o binário)
```
