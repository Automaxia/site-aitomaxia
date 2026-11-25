FROM node:18.17.1 AS build

# Chromium headless para o pré-render (scripts/prerender.mjs).
RUN apt-get update  && apt-get install -y --no-install-recommends chromium  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY tsconfig.json ./
COPY package*.json ./
RUN npm cache clean --force
RUN npm install --force
COPY . .
COPY . /assets/

RUN npm install -g @angular/cli

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