import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../shared/services/analytics.service';

@Component({
  selector: 'automaxia-privacidade',
  templateUrl: './privacidade.page.html',
  styleUrls: ['./privacidade.page.scss'],
})
export class PrivacidadePage implements OnInit {

  constructor(private readonly analytics: AnalyticsService) { }

  ngOnInit() {
  }

  alterarCookies(): void {
    this.analytics.abrirPreferencias();
  }

}
