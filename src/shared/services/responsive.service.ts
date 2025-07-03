import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

declare const window;

export type BreakPointType = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const BREAKPOINT = { XS: 'xs', SM: 'sm', MD: 'md', LG: 'lg', XL: 'xl', XXL: 'xxl' };

@Injectable({ providedIn : 'root' })
export class ResponsiveService implements OnDestroy {

  static isMobilePlatform = window.innerWidth <= 768;
  $screenWidth: BehaviorSubject<number> = new BehaviorSubject(null);
  $screenHeight: BehaviorSubject<number> = new BehaviorSubject(null);
  $platform: BehaviorSubject<string> = new BehaviorSubject('');
  $mediaBreakpoint: BehaviorSubject<BreakPointType|string> = new BehaviorSubject(null);
  private $unSubscriber: Subject<any> = new Subject();
  private lastMediaBreakPoint: string;
  private lastPlatform: string;

  constructor() {
    this.init();
  }

  get isMobilePlatform() {
    return ResponsiveService.isMobilePlatform;
  }

  init() {
    this.setScreenWidth(window.innerWidth);
    this.setScreenHeight(window.innerHeight);
    this.setMediaBreakpoint(window.innerWidth);
    window.addEventListener('resize', (event) => {
      this.setScreenWidth(event.target.innerWidth);
      this.setMediaBreakpoint(event.target.innerWidth);
    }, true);
  }

  ngOnDestroy() {
    this.$unSubscriber.next(null);
    this.$unSubscriber.complete();
  }

  private setScreenWidth(width: number): void {
    this.$screenWidth.next(width);
  }

  private setScreenHeight(height: number): void {
    this.$screenHeight.next(height);
  }

  private setMediaBreakpoint(width: number): void {
    if (!width) {
      return;
    }
    if (width < 576) {
      this.emitBreakPoint(BREAKPOINT.XS);
    } else if (width >= 576 && width < 768) {
      this.emitBreakPoint(BREAKPOINT.SM);
    } else if (width >= 768 && width < 992) {
      this.emitBreakPoint(BREAKPOINT.MD);
    } else if (width >= 992 && width < 1200) {
      this.emitBreakPoint(BREAKPOINT.LG);
    } else if (width >= 1200 && width < 1600) {
      this.emitBreakPoint(BREAKPOINT.XL);
    } else {
      this.emitBreakPoint(BREAKPOINT.XXL);
    }
  }

  private emitBreakPoint(breakpoint?: string) {
    if (this.lastMediaBreakPoint !== breakpoint) {
      ResponsiveService.isMobilePlatform = [BREAKPOINT.XS, BREAKPOINT.SM].includes(breakpoint);
      this.lastMediaBreakPoint = breakpoint;
      this.changePlatform(ResponsiveService.isMobilePlatform ? 'mobile' : 'web');
      this.$mediaBreakpoint.next(breakpoint);
    }
  }

  private changePlatform(platform) {
    if (platform !== this.lastPlatform) {
      this.$platform.next(platform);
    }
  }
}
