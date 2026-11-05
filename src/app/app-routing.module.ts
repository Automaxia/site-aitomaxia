import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { SERVICOS } from '../shared/constants/servicos';

const routes: Routes = [
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'privacidade',
    loadChildren: () => import('./privacidade/privacidade.module').then( m => m.PrivacidadePageModule)
  },
  {
    path: 'termos',
    loadChildren: () => import('./termos/termos.module').then( m => m.TermosPageModule)
  },
  ...SERVICOS.map(s => ({
    path: s.slug,
    loadChildren: () => import('./servico/servico.module').then(m => m.ServicoPageModule)
  })),
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppRoutingModule { }
