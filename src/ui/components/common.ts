import { html, type TemplateResult } from 'lit-html';

export const fmt = (n: number): string => Math.round(n).toLocaleString('en-US');
export const signed = (n: number): string => (n > 0 ? `+${fmt(n)}` : fmt(n));

/**
 * <anim-num value="123"> — counts smoothly to the new value, like the gold counter
 * of the original game. Flashes green/red when the value goes up/down.
 */
class AnimatedNumber extends HTMLElement {
  static observedAttributes = ['value'];
  private shown: number | null = null;
  private frame = 0;

  attributeChangedCallback(_name: string, _old: string | null, value: string | null): void {
    const target = Number(value ?? 0);
    if (this.shown === null || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.shown = target;
      this.textContent = fmt(target);
      return;
    }
    if (target === this.shown) return;
    this.classList.remove('num-up', 'num-down');
    void this.offsetWidth; // restart the flash animation
    this.classList.add(target > this.shown ? 'num-up' : 'num-down');
    const from = this.shown;
    const start = performance.now();
    const duration = Math.min(900, 250 + Math.log10(Math.abs(target - from) + 1) * 180);
    cancelAnimationFrame(this.frame);
    const step = (now: number): void => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      this.shown = from + (target - from) * eased;
      this.textContent = fmt(this.shown);
      if (t < 1) this.frame = requestAnimationFrame(step);
      else this.shown = target;
    };
    this.frame = requestAnimationFrame(step);
  }
}
customElements.define('anim-num', AnimatedNumber);

export const num = (value: number): TemplateResult => html`<anim-num value=${value}></anim-num>`;

/** White pictogram tinted with the current text color (CSS mask). */
export const glyph = (src: string, cls = ''): TemplateResult =>
  html`<span class="glyph ${cls}" style="--src:url('${src}')" aria-hidden="true"></span>`;

/** Button that repeats while held (used by the − / + quantity buttons). */
export function holdRepeat(fn: () => void): (e: PointerEvent) => void {
  return (e: PointerEvent) => {
    if (e.button !== 0) return;
    fn();
    let delay = 380;
    let timer = 0;
    const tick = (): void => {
      fn();
      delay = Math.max(45, delay * 0.78);
      timer = window.setTimeout(tick, delay);
    };
    timer = window.setTimeout(tick, delay);
    const stop = (): void => {
      clearTimeout(timer);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
  };
}
