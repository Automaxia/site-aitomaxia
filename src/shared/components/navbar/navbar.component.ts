import { Component } from '@angular/core';
import { ScrollDetail } from '@ionic/angular';
import { menuConfig } from '../../constants/menu';
import { Router } from '@angular/router';

@Component({
  selector: 'automaxia-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  isScrolled = false;
  initialPosition;
  activeRoute;

  constructor(private router: Router) {
    this.activeRoute = router.url;
  }

  handleScrollStart() {
    this.isScrolled = true;
  }

  handleScroll(ev: CustomEvent<ScrollDetail>) {
    // console.log('scroll', JSON.stringify(ev.detail));
    this.initialPosition = ev.detail.scrollTop;
    this.isScrolled = this.initialPosition !== 0;
  }

  navigateTo(route: any){
    this.router.navigate([route], { replaceUrl: true })
    // window.location.reload();
  }

  protected readonly menuConfig = menuConfig;
}
