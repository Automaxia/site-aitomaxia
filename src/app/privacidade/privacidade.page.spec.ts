import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { PrivacidadePage } from './privacidade.page';

describe('PrivacidadePage', () => {
  let fixture: ComponentFixture<PrivacidadePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacidadePage],
      providers: [provideRouter([]), provideIonicAngular()],
    }).compileComponents();
    fixture = TestBed.createComponent(PrivacidadePage);
    fixture.detectChanges();
  });

  it('cria a página', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
