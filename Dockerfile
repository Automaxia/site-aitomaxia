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

### STAGE 2: Build ###
FROM nginx:1.21.6-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY ./default.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

COPY --from=build /app/www/ .

RUN chgrp -R 0 /usr/share/nginx && \
  chmod -R g=u /usr/share/nginx && \
  chgrp -R 0 /var/cache/nginx && \
  chmod -R g=u /var/cache/nginx && \
  chgrp -R 0 /var/run && \
  chmod -R g=u /var/run && \
  chmod -R 775 /usr/share/nginx/html

USER 1001

EXPOSE 8080

CMD ["/bin/sh", "-c", "nginx -g 'daemon off;'"]
#154.49.247.235