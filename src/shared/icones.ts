import { addIcons } from 'ionicons';
import { alertCircle, checkmarkCircle, documentTextOutline, shieldCheckmarkOutline } from 'ionicons/icons';

/**
 * Ícones usados no site. No Ionic standalone (padrão do @ionic/angular 9) o <ion-icon name="..."> só mostra ícones registrados aqui:
 * os do ionicons entram no bundle; os próprios da Automaxia são SVGs em src/assets/icon.
 */
export function registrarIcones(): void {
  addIcons({
    'alert-circle': alertCircle,
    'checkmark-circle': checkmarkCircle,
    'document-text-outline': documentTextOutline,
    'shield-checkmark-outline': shieldCheckmarkOutline,
    'linkedin': '/assets/icon/linkedin.svg',
    'linkedin-fill': '/assets/icon/linkedin-fill.svg',
    'instagram': '/assets/icon/instagram.svg',
    'instagram-fill': '/assets/icon/instagram-fill.svg',
    'location-fill': '/assets/icon/location-fill.svg',
  });
}
