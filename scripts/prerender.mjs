// Pré-render das rotas públicas, rodado depois do `ng build`.
//
// Abre cada rota num Chromium headless, pega o HTML já renderizado e grava
// www/<rota>/index.html com o <head> da rota (título, descrição, canônico,
// Open Graph) e o conteúdo da página dentro do <app-root>, escondido.
// Assim robôs que não executam JavaScript (Bing, LinkedIn, WhatsApp...)
// recebem o texto e os metadados certos. No navegador, o Angular limpa o
// <app-root> ao iniciar e renderiza a página normalmente.
//
// Uso: node scripts/prerender.mjs   (CHROME=/caminho/do/chrome para trocar o binário)

import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { promisify } from 'node:util';

const WWW = 'www';
const PORT = 4555;
const CHROME = process.env.CHROME || 'chromium';

// Lê os slugs direto do arquivo de conteúdo, para não duplicar a lista.
const servicosTs = readFileSync('src/shared/constants/servicos.ts', 'utf8');
const slugs = [...servicosTs.matchAll(/slug: '([a-z0-9-]+)'/g)].map(m => m[1]);
const ROUTES = ['privacidade', 'termos', ...slugs, ''];   // home por último: sobrescreve o index.html

const TIPOS = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4', '.txt': 'text/plain', '.xml': 'text/xml',
};

const shell = readFileSync(join(WWW, 'index.html'), 'utf8');

const server = createServer((req, res) => {
  const caminho = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^([/\\])+/, '');
  const arquivo = join(WWW, caminho);
  if (caminho && existsSync(arquivo) && statSync(arquivo).isFile()) {
    res.writeHead(200, { 'Content-Type': TIPOS[extname(arquivo)] || 'application/octet-stream' });
    res.end(readFileSync(arquivo));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(shell);
  }
});

const exec = promisify(execFile);

async function renderizar(rota) {
  const { stdout } = await exec(CHROME, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
    '--mute-audio', '--autoplay-policy=user-gesture-required',
    '--window-size=1366,900', '--virtual-time-budget=20000', '--dump-dom',
    `http://127.0.0.1:${PORT}/${rota}`,
  ], { maxBuffer: 50 * 1024 * 1024, timeout: 120000 });
  return stdout;
}

const pegar = (html, re) => (html.match(re) || [])[1];

function limparConteudo(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<video\b[\s\S]*?<\/video>/gi, '')
    .replace(/<automaxia-cookie-banner\b[\s\S]*?<\/automaxia-cookie-banner>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s(?:_ngcontent|_nghost|ng-reflect)-[\w-]+(?:="[^"]*")?/g, '')
    .replace(/\n\s*\n/g, '\n');
}

function montar(dom) {
  const titulo = pegar(dom, /<title>([\s\S]*?)<\/title>/);
  const descricao = pegar(dom, /<meta name="description" content="([^"]*)"/);
  const canonico = pegar(dom, /<link rel="canonical" href="([^"]*)"/);
  const ogTitulo = pegar(dom, /<meta property="og:title" content="([^"]*)"/);
  const ogDescricao = pegar(dom, /<meta property="og:description" content="([^"]*)"/);
  const ogUrl = pegar(dom, /<meta property="og:url" content="([^"]*)"/);
  if (!titulo || !descricao || !canonico) {
    throw new Error('metadados ausentes no HTML renderizado');
  }

  const ini = dom.indexOf('>', dom.indexOf('<app-root')) + 1;
  const fim = dom.lastIndexOf('</app-root>');
  const conteudo = limparConteudo(dom.slice(ini, fim));
  if (conteudo.replace(/<[^>]+>/g, '').trim().length < 200) {
    throw new Error('conteúdo renderizado vazio');
  }

  return shell
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${titulo}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${descricao}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${canonico}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${ogTitulo}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${ogDescricao}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${ogUrl}$2`)
    .replace(/<app-root><\/app-root>/, `<app-root><div data-prerender hidden>${conteudo}</div></app-root>`);
}

await new Promise(r => server.listen(PORT, '127.0.0.1', r));
let falhou = false;
try {
  for (const rota of ROUTES) {
    try {
      const html = montar(await renderizar(rota));
      const dir = join(WWW, rota);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'index.html'), html);
      console.log(`prerender /${rota}: ${(html.length / 1024).toFixed(0)} KB`);
    } catch (e) {
      falhou = true;
      console.error(`prerender /${rota} FALHOU: ${e.message}`);
    }
  }
} finally {
  server.close();
}
process.exit(falhou ? 1 : 0);
