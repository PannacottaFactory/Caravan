import { html, nothing, type TemplateResult } from 'lit-html';
import { ACHIEVEMENTS, dailyChallenge, dateKey, FACTIONS, getFaction, isFactionUnlocked, msUntilNextDaily } from '../../engine';
import { fmt, formatDay, formatDuration } from '../components/common';
import { crest } from '../components/ui';
import { twistChips } from '../components/twists';
import { brand, icon } from '../icons';
import { continueGame, dailyStatus, newGameFromTitle, openModal, openRecords, playDaily, state, toggleSound } from '../store';

const SOCIALS = [
  { name: 'Twitter', icon: 'twitter', url: 'https://twitter.com/Victoriio' },
  { name: 'Discord', icon: 'discord', url: 'https://discord.gg/A2uHcxE' },
] as const;

export function soundToggle(): TemplateResult {
  const muted = state.settings.muted;
  return html`<button class="icon-btn" @click=${toggleSound} aria-label=${muted ? 'Turn sound on' : 'Turn sound off'}
    title=${muted ? 'Sound off' : 'Sound on'}>${icon(muted ? 'soundOff' : 'soundOn')}</button>`;
}

function dailyCard(): TemplateResult {
  const c = dailyChallenge(dateKey());
  const status = dailyStatus();
  const done = state.profile.daily?.date === c.date ? state.profile.daily : null;
  return html`<section class="card daily-card ${status === 'done' ? 'is-done' : ''}" aria-label="Daily challenge">
    <div class="daily-card__head">
      <span class="daily-card__eyebrow">${icon('sun')} Daily challenge · ${formatDay(c.date)}</span>
      <span class="daily-card__timer" title="Time before the next challenge">New in ${formatDuration(msUntilNextDaily())}</span>
    </div>
    <div class="daily-card__body">
      ${crest(c.factionId, 'crest--md')}
      <div>
        <strong>${getFaction(c.factionId).name}</strong>
        <span class="muted small">Classical · same journey for everyone · one try</span>
      </div>
    </div>
    ${twistChips(c.twists, 'twists--row twists--compact')}
    ${done
      ? html`<div class="daily-card__done">
          <span>Your score <strong>${fmt(done.score)}</strong></span>
          <button class="btn btn--secondary btn--sm" @click=${() => openRecords('daily')}>${icon('podium')} Ranking</button>
        </div>`
      : html`<div class="daily-card__actions">
          <button class="btn btn--secondary btn--lg" @click=${playDaily}>${icon('play')} ${status === 'inProgress' ? 'Continue the challenge' : "Play today's challenge"}</button>
          <button class="icon-btn" @click=${() => openRecords('daily')} aria-label="Today's ranking" title="Today's ranking">${icon('podium')}</button>
        </div>`}
  </section>`;
}

export function titleScreen(): TemplateResult {
  const saved = state.game && state.game.phase !== 'victory' ? state.game : null;
  const p = state.profile;
  const unlocked = FACTIONS.filter((f) => isFactionUnlocked(p, f.id)).length;
  const best = Math.max(0, ...Object.values(p.bestScores).flatMap((s) => [s.classical, s.traveler]));

  return html`
    <section class="screen title-screen">
      <header class="title-header">
        <div class="title-header__left">${soundToggle()}</div>
        <nav class="title-header__right" aria-label="Links">
          ${SOCIALS.map(
            (s) => html`<a class="icon-btn icon-btn--quiet" href=${s.url} target="_blank" rel="noopener" aria-label=${s.name} title=${s.name}>
              ${brand(s.icon)}
            </a>`,
          )}
        </nav>
      </header>

      <div class="hero">
        <div class="hero__copy">
          <p class="hero__eyebrow">A desert trading game</p>
          <h1 class="hero__title">Caravan</h1>
          <p class="hero__tagline">Buy, sell, profit.<br />Lead your caravan across the dunes and become the richest trader of your faction.</p>

          <div class="hero__actions">
            ${saved
              ? html`<button class="btn btn--primary btn--xl" @click=${continueGame}>
                    ${icon('play')} Continue journey
                    <span class="btn__meta">${getFaction(saved.factionId).name} · Day ${saved.day}/${saved.maxDay}</span>
                  </button>
                  <button class="btn btn--secondary btn--lg" @click=${newGameFromTitle}>New journey</button>`
              : html`<button class="btn btn--primary btn--xl" @click=${newGameFromTitle}>${icon('play')} Play</button>`}
            <button class="btn btn--ghost btn--lg" @click=${() => openModal('howto')}>${icon('help')} How to play</button>
          </div>
        </div>

        <div class="hero__side">
        <aside class="hero__card card" aria-label="Your progress">
          <h2 class="card__title">Your journey</h2>
          <div class="progress-stats">
            <div class="progress-stat"><strong>${fmt(best)}</strong><span>Best score</span></div>
            <div class="progress-stat"><strong>${unlocked}<small>/${FACTIONS.length}</small></strong><span>Factions</span></div>
            <div class="progress-stat"><strong>${p.achievements.length}<small>/${ACHIEVEMENTS.length}</small></strong><span>Achievements</span></div>
          </div>
          <div class="crest-row">
            ${FACTIONS.map(
              (f) => html`<span class="crest-chip ${isFactionUnlocked(p, f.id) ? '' : 'is-locked'}" title=${f.name}>${crest(f.id, 'crest--mini')}</span>`,
            )}
          </div>
          <div class="hero__card-actions">
            <button class="btn btn--secondary" @click=${() => openRecords('local')}>${icon('podium')} Best scores</button>
            <button class="btn btn--secondary" @click=${() => openModal('achievements')}>${icon('trophy')} Achievements</button>
          </div>
        </aside>
        ${dailyCard()}
        </div>
      </div>

      <footer class="title-footer">
        <span>Made by Pannacotta · Music by Tyler Cline</span>
        <button class="link-btn" @click=${() => openModal('credits')}>Credits</button>
        ${p.totals.gamesFinished ? html`<span>${p.totals.gamesFinished} journeys completed</span>` : nothing}
      </footer>
    </section>
  `;
}
