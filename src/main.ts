import './styles/main.css';
import { startApp } from './ui/app';

const root = document.querySelector<HTMLElement>('#app')!;
// Remove the static intro from index.html (it is there for search engines and slow loads).
root.replaceChildren();
if (import.meta.env.DEV && location.hash === '#art') {
  void import('./ui/gallery').then((m) => m.showGallery(root));
} else {
  startApp(root);
}
