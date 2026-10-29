import { html, type TemplateResult } from 'lit-html';
import { getFaction } from '../../engine';
import { img } from '../assets';
import { continueGame, newGameFromTitle, openModal, state, toggleSound } from '../store';

const SOCIALS = [
  { name: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/thepannacottafactory/' },
  { name: 'Twitter', icon: 'twitter', url: 'https://twitter.com/Victoriio' },
  { name: 'Discord', icon: 'discord', url: 'https://discord.gg/A2uHcxE' },
  { name: 'Reddit', icon: 'reddit', url: 'https://www.reddit.com/r/CaravanTradingGame/' },
];

export function soundButton(): TemplateResult {
  const muted = state.settings.muted;
  return html`<button class="icon-btn sound-btn ${muted ? 'is-muted' : ''}" @click=${toggleSound}
    aria-label=${muted ? 'Turn sound on' : 'Turn sound off'} title=${muted ? 'Sound off' : 'Sound on'}>
    <svg viewBox="0 0 32 24" aria-hidden="true">
      <path d="M2 8h6l8-6v20l-8-6H2z" fill="currentColor" />
      ${muted
        ? html`<path d="M21 8l8 8M29 8l-8 8" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />`
        : html`<path d="M21 7c2 2.6 2 7.4 0 10M25 4c4 4.4 4 11.6 0 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />`}
    </svg>
  </button>`;
}

export function titleScreen(): TemplateResult {
  const saved = state.game && state.game.phase !== 'victory' ? state.game : null;
  return html`
    <section class="screen title-screen">
      <header class="topbar">
        ${soundButton()}
        <div class="topbar__right">
          ${SOCIALS.map(
            (s) => html`<a class="icon-btn social" href=${s.url} target="_blank" rel="noopener" aria-label=${s.name} title=${s.name}>
              <span class="glyph" style="--src:url('${img(s.icon)}')"></span>
            </a>`,
          )}
          <button class="icon-btn" @click=${() => openModal('credits')} aria-label="Credits" title="Credits">
            <span class="glyph" style="--src:url('${img('trader')}')"></span>
          </button>
        </div>
      </header>

      <div class="title-main">
        <div class="logo">
          <h1 class="logo__text">Caravan</h1>
          <p class="logo__tagline">Buy, sell, profit</p>
        </div>

        <nav class="title-menu">
          ${saved
            ? html`<button class="play-link play-link--continue" @click=${continueGame}>
                - Continue -
                <small>${getFaction(saved.factionId).name} · Day ${saved.day}/${saved.maxDay}</small>
              </button>`
            : null}
          <button class="play-link ${saved ? 'play-link--secondary' : ''}" @click=${newGameFromTitle}>
            ${saved ? 'New game' : '- Play -'}
          </button>
          <button class="btn btn--ghost howto-btn" @click=${() => openModal('howto')}>How to play</button>
        </nav>
      </div>

      <footer class="title-footer">
        <button class="square-btn" @click=${() => openModal('records')} aria-label="Best scores" title="Best scores">
          <span class="glyph" style="--src:url('${img('leaderboard')}')"></span>
        </button>
        <button class="square-btn" @click=${() => openModal('achievements')} aria-label="Achievements" title="Achievements">
          <span class="glyph" style="--src:url('${img('trophy')}')"></span>
        </button>
      </footer>
    </section>
  `;
}
