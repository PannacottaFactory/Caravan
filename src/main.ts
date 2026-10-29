import './styles/main.css';
import { startApp } from './ui/app';

const root = document.querySelector<HTMLElement>('#app')!;
if (import.meta.env.DEV && location.hash === '#art') {
  void import('./ui/gallery').then((m) => m.showGallery(root));
} else {
  startApp(root);
}
