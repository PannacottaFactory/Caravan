// Score card image (1200×630, the usual social preview size), drawn on a canvas.

import { FACTIONS, getFaction, type GameState } from '../engine';
import { formatDay } from './components/common';

const W = 1200;
const H = 630;
const GAME_URL = 'pannacottafactory.github.io/Caravan';

const DUNES: [string, number, string, string][] = [
  ['M0 170C180 110 330 120 520 150S860 70 1090 112 1440 150 1600 92V400H0Z', 0.5, '#7d4660', '#5a3150'],
  ['M0 182C230 120 430 210 700 160S1110 96 1310 152 1520 176 1600 150V400H0Z', 0.4, '#b45f55', '#7e3d48'],
  ['M0 150C110 96 200 74 330 70C620 62 920 78 1270 70C1420 72 1510 102 1600 128V400H0Z', 0.29, '#e08a58', '#9c4a3a'],
  ['M0 120C260 40 540 150 860 110S1340 30 1600 90V400H0Z', 0.16, '#a7543a', '#47211c'],
];

function dune(ctx: CanvasRenderingContext2D, path: string, heightRatio: number, top: string, bottom: string): void {
  const h = H * heightRatio;
  const y0 = H - h;
  const grad = ctx.createLinearGradient(0, y0, 0, H);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  ctx.save();
  ctx.translate(0, y0);
  ctx.scale(W / 1600, h / 400);
  ctx.fillStyle = grad;
  ctx.fill(new Path2D(path));
  ctx.restore();
}

function crest(ctx: CanvasRenderingContext2D, factionId: string, x: number, y: number, size: number): void {
  const index = Math.max(0, FACTIONS.findIndex((f) => f.id === factionId));
  const hue = (index * 37 + 18) % 360;
  const k = size / 72;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.fillStyle = '#1a1310';
  ctx.fill(new Path2D('M32 3l26 8v22c0 17-11 29-26 36C17 62 6 50 6 33V11z'));
  const grad = ctx.createLinearGradient(0, 0, 64, 72);
  grad.addColorStop(0, `hsl(${hue} 55% 52%)`);
  grad.addColorStop(1, `hsl(${hue} 60% 28%)`);
  ctx.fillStyle = grad;
  ctx.fill(new Path2D('M32 7l22 6.8v19.4c0 14.8-9.4 25.4-22 31.6-12.6-6.2-22-16.8-22-31.6V13.8z'));
  ctx.fillStyle = '#fff6e8';
  ctx.font = '650 28px "Fraunces Variable", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(getFaction(factionId).name.charAt(0), 32, 45);
  ctx.restore();
}

/** Draws text, shrinking the font until it fits in maxWidth. */
function fitText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, size: number, weight: string, family: string): void {
  let px = size;
  do {
    ctx.font = `${weight} ${px}px ${family}`;
    px -= 2;
  } while (ctx.measureText(text).width > maxWidth && px > 10);
  ctx.fillText(text, x, y);
}

export async function renderScoreCard(g: GameState, rank: number | null): Promise<Blob> {
  await Promise.all([
    document.fonts.load('700 100px "Fraunces Variable"'),
    document.fonts.load('italic 400 30px "Fraunces Variable"'),
    document.fonts.load('600 24px "Inter Variable"'),
  ]).catch(() => undefined);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Sky, sun, dunes
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  [['#17122a', 0], ['#2c1d38', 0.24], ['#5d3046', 0.46], ['#a8524e', 0.64], ['#e98a58', 0.8], ['#f8bb6c', 1]].forEach(([c, o]) =>
    sky.addColorStop(o as number, c as string),
  );
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  const sun = ctx.createRadialGradient(840, 330, 0, 840, 330, 190);
  sun.addColorStop(0, '#fff3cc');
  sun.addColorStop(0.42, '#ffe2a0');
  sun.addColorStop(0.5, 'rgba(255,190,110,0.35)');
  sun.addColorStop(1, 'rgba(255,170,100,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(600, 100, 480, 480);
  for (const [path, ratio, top, bottom] of DUNES) dune(ctx, path, ratio, top, bottom);

  // Dark panel for the text
  ctx.fillStyle = 'rgba(24, 17, 15, 0.86)';
  ctx.beginPath();
  ctx.roundRect(56, 56, 640, H - 112, 36);
  ctx.fill();
  ctx.strokeStyle = 'rgba(244, 183, 74, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#f4b74a';
  ctx.letterSpacing = '3px';
  const label = g.daily
    ? `CARAVAN · DAILY CHALLENGE · ${formatDay(g.daily).toUpperCase()}`
    : `CARAVAN · ${g.mode === 'classical' ? 'CLASSICAL' : 'TRAVELER'}`;
  fitText(ctx, label, 100, 120, 560, 22, '700', '"Inter Variable", sans-serif');
  ctx.letterSpacing = '0px';

  crest(ctx, g.factionId, 100, 150, 96);
  ctx.fillStyle = '#f7ebda';
  fitText(ctx, getFaction(g.factionId).name, 216, 215, 440, 60, '650', '"Fraunces Variable", Georgia, serif');

  ctx.fillStyle = '#927f6c';
  ctx.font = '600 22px "Inter Variable", sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('SCORE', 100, 320);
  ctx.letterSpacing = '0px';

  const scoreGrad = ctx.createLinearGradient(0, 330, 0, 440);
  scoreGrad.addColorStop(0, '#fff6e2');
  scoreGrad.addColorStop(1, '#f4a83a');
  ctx.fillStyle = scoreGrad;
  fitText(ctx, (g.score?.total ?? 0).toLocaleString('en-US'), 92, 430, 560, 120, '700', '"Fraunces Variable", Georgia, serif');

  ctx.fillStyle = '#cdbba5';
  ctx.font = 'italic 400 30px "Fraunces Variable", Georgia, serif';
  ctx.fillText(rank ? `#${rank} on the ${g.daily ? 'daily' : 'world'} leaderboard` : 'Can you beat my score?', 100, 490);

  ctx.fillStyle = '#f4b74a';
  ctx.font = '600 24px "Inter Variable", sans-serif';
  ctx.fillText(GAME_URL, 100, 538);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Image failed'))), 'image/png'));
}
