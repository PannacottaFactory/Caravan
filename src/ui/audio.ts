// Music and sound effects. Browsers only allow audio after a user gesture,
// so the music starts on the first click.

import { asset } from './assets';

type Sfx = 'click' | 'slideIn' | 'slideOut' | 'merchant' | 'witch';

const SFX_FILES: Record<Sfx, string> = {
  click: 'audio/buttonclick.mp3',
  slideIn: 'audio/slide-in.mp3',
  slideOut: 'audio/slide-out.mp3',
  merchant: 'audio/merchant.mp3',
  witch: 'audio/witch.mp3',
};

const SFX_VOLUME: Record<Sfx, number> = { click: 0.5, slideIn: 0.35, slideOut: 0.35, merchant: 0.6, witch: 0.6 };

let muted = false;
let music: HTMLAudioElement | null = null;
const cache = new Map<Sfx, HTMLAudioElement>();

function getMusic(): HTMLAudioElement {
  if (!music) {
    music = new Audio(asset('audio/music.mp3'));
    music.loop = true;
    music.volume = 0.35;
  }
  return music;
}

export function setMuted(value: boolean): void {
  muted = value;
  if (muted) music?.pause();
  else void getMusic().play().catch(() => undefined);
}

/** Called on every user interaction: starts the music once allowed. */
export function unlockAudio(): void {
  if (!muted && getMusic().paused) void getMusic().play().catch(() => undefined);
}

export function playSfx(name: Sfx): void {
  if (muted) return;
  let base = cache.get(name);
  if (!base) {
    base = new Audio(asset(SFX_FILES[name]));
    base.volume = SFX_VOLUME[name];
    cache.set(name, base);
  }
  const sound = base.cloneNode() as HTMLAudioElement;
  sound.volume = base.volume;
  void sound.play().catch(() => undefined);
}
