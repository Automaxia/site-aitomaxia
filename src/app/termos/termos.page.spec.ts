import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { TermosPage } from './termos.page';

describe('TermosPage', () => {
  let fixture: ComponentFixture<TermosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermosPage],
      providers: [provideRouter([]), provideIonicAngular()],
    }).compileComponents();
    fixture = TestBed.createComponent(TermosPage);
    fixture.detectChanges();
  });

  it('cria a página', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
