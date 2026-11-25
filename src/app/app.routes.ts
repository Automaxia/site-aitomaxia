import { Routes } from '@angular/router';
import { SERVICOS } from '../shared/constants/servicos';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
  },
  {
    path: 'privacidade',
    loadComponent: () => import('./privacidade/privacidade.page').then(m => m.PrivacidadePage),
  },
  {
    path: 'termos',
    loadComponent: () => import('./termos/termos.page').then(m => m.TermosPage),
  },
  // Uma rota por serviço (/automacao-de-processos-rpa, /agentes-de-ia...); a página lê o slug do path.
  ...SERVICOS.map(s => ({
    path: s.slug,
    loadComponent: () => import('./servico/servico.page').then(m => m.ServicoPage),
  })),
  {
    path: '**',
    redirectTo: '',
  },
];
