### STAGE 1: build ###
# Node 26 LTS ("Lithium"); o Angular 22 aceita ^22.22 || ^24.15 || >=26. Antes era 18.17.1 (fim de suporte).
FROM node:26 AS build

# Chromium headless para o pré-render (scripts/prerender.mjs).
RUN apt-get update && apt-get install -y --no-install-recommends chromium && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
# Exatamente as versões do package-lock.json
RUN npm ci --no-audit --no-fund
COPY . .

RUN npm run build
RUN node scripts/prerender.mjs

### STAGE 2: servidor ###
# nginx oficial sem root (uid 101): pid e temporários em /tmp, então o pod pode rodar com o
# sistema de arquivos só leitura (só /tmp gravável). Versão fixa; antes era nginx 1.21.6 (2022).
FROM nginxinc/nginx-unprivileged:1.30.6-alpine

COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY ./nginx-security-headers.conf /etc/nginx/snippets/security-headers.conf

# Arquivos do site pertencem ao root e são só leitura para o nginx.
COPY --from=build /app/www/ /usr/share/nginx/html/

USER 101

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]