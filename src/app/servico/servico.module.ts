import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ServicoPage } from './servico.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: ServicoPage }]),
  ],
  declarations: [ServicoPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ServicoPageModule {}
