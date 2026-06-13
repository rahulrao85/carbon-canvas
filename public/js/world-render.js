/**
 * @module world-render
 * @fileoverview Canvas garden that visualises carbon levels visually.
 * Low → sunny/green, Medium → overcast, High → grey/trash/lightning.
 */
let canvas, ctx;
if (typeof document !== 'undefined') {
  canvas = document.getElementById('garden-canvas');
  if (canvas) ctx = canvas.getContext('2d');
}
/** Determines carbon mood from kg CO₂. @param {number} kgCO2 */
function getMood(kgCO2) {
  if (kgCO2 <= 10) return 'low';
  if (kgCO2 <= 30) return 'medium';
  return 'high';
}
/** Draws the sky gradient. @param {string} mood */
function drawSky(mood) {
  const g = { low: ['#4fc3f7', '#b3e5fc'], medium: ['#90a4ae', '#cfd8dc'], high: ['#546e7a', '#78909c'] };
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, g[mood][0]);
  grad.addColorStop(1, g[mood][1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
/** Draws the sun (only in low mood). @param {string} mood */
function drawSun(mood) {
  if (mood !== 'low') return;
  const x = canvas.width - 80, y = 60;
  ctx.beginPath();
  ctx.arc(x, y, 35, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd54f';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, 45, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 213, 79, 0.3)';
  ctx.lineWidth = 4;
  ctx.stroke();
}
/** Draws clouds matching the mood. @param {string} mood */
function drawClouds(mood) {
  const c = {
    low: [{ x: 120, y: 50, s: 40, c: '#ffffff' }, { x: 300, y: 70, s: 30, c: '#f5f5f5' }, { x: 550, y: 40, s: 35, c: '#ffffff' }],
    medium: [{ x: 150, y: 55, s: 35, c: '#b0bec5' }, { x: 400, y: 65, s: 30, c: '#90a4ae' }],
    high: [{ x: 100, y: 50, s: 50, c: '#546e7a' }, { x: 350, y: 40, s: 45, c: '#455a64' }, { x: 600, y: 60, s: 40, c: '#546e7a' }],
  };
  (c[mood] || []).forEach((d) => {
    ctx.beginPath();
    ctx.ellipse(d.x, d.y, d.s, d.s * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = d.c;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(d.x - d.s * 0.5, d.y + 10, d.s * 0.6, d.s * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(d.x + d.s * 0.5, d.y + 5, d.s * 0.5, d.s * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}
/** Draws the ground. @param {string} mood */
function drawGround(mood) {
  const gy = canvas.height * 0.7;
  const g = { low: ['#66bb6a', '#a5d6a7'], medium: ['#aed581', '#dce775'], high: ['#8d6e63', '#a1887f'] };
  const grad = ctx.createLinearGradient(0, gy, 0, canvas.height);
  grad.addColorStop(0, g[mood][0]);
  grad.addColorStop(1, g[mood][1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, gy, canvas.width, canvas.height - gy);
}
/** Draws a tree at (x, y). @param {number} x @param {number} y @param {string} mood */
function drawTree(x, y, mood) {
  const lc = { low: ['#388e3c', '#4caf50', '#66bb6a'], medium: ['#8bc34a', '#9ccc65'], high: ['#795548', '#8d6e63'] };
  ctx.fillStyle = mood === 'high' ? '#5d4037' : '#6d4c41';
  ctx.fillRect(x - 5, y, 10, 50);
  const leaves = lc[mood] || lc.low;
  for (let i = 0; i < leaves.length; i++) {
    ctx.beginPath();
    ctx.arc(x, y - 10 - i * 15, 22 - i * 3, 0, Math.PI * 2);
    ctx.fillStyle = leaves[i];
    ctx.fill();
  }
}
/** Draws flowers (none in high mood). @param {string} mood */
function drawFlowers(mood) {
  if (mood === 'high') return;
  const count = mood === 'low' ? 12 : 5;
  const by = canvas.height * 0.72;
  for (let i = 0; i < count; i++) {
    const x = 50 + i * (canvas.width / count);
    const y = by + Math.sin(i * 1.5) * 20;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = mood === 'low' ? '#e91e63' : '#ffcdd2';
    ctx.fill();
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + 3);
    ctx.lineTo(x, y + 15);
    ctx.stroke();
  }
}
/** Draws birds (only in low mood). @param {string} mood */
function drawBirds(mood) {
  if (mood !== 'low') return;
  [{ x: 200, y: 80 }, { x: 280, y: 100 }, { x: 500, y: 70 }].forEach((p) => {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.quadraticCurveTo(p.x + 8, p.y - 8, p.x + 16, p.y);
    ctx.moveTo(p.x, p.y);
    ctx.quadraticCurveTo(p.x - 8, p.y - 8, p.x - 16, p.y);
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}
/** Draws trash (only in high mood). @param {string} mood */
function drawTrash(mood) {
  if (mood !== 'high') return;
  [{ x: 150, y: canvas.height * 0.68 }, { x: 400, y: canvas.height * 0.72 }, { x: 650, y: canvas.height * 0.69 }].forEach((t) => {
    ctx.fillStyle = '#78909c';
    ctx.fillRect(t.x, t.y, 12, 16);
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(t.x + 1, t.y - 2, 10, 4);
  });
}
/** Draws lightning (only in high mood). @param {string} mood */
function drawLightning(mood) {
  if (mood !== 'high') return;
  [{ x: 300, y: 20 }, { x: 600, y: 30 }].forEach((b) => {
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - 10, b.y + 25);
    ctx.lineTo(b.x + 5, b.y + 25);
    ctx.lineTo(b.x - 5, b.y + 50);
    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 3;
    ctx.stroke();
  });
}
/**
 * Renders the full garden scene based on carbon level.
 * Redraws sky, sun, clouds, ground, and mood elements.
 * @param {number} kgCO2 - Current total CO2 in kg.
 */
export function renderGarden(kgCO2) {
  const mood = getMood(kgCO2);
  canvas.width = (canvas.clientWidth || canvas.width) * 2;
  canvas.height = (canvas.clientHeight || canvas.height) * 2;
  ctx.scale(2, 2);
  drawSky(mood);
  drawSun(mood);
  drawClouds(mood);
  drawGround(mood);
  const treeCount = { low: 3, medium: 1, high: 0 }[mood];
  for (let i = 0; i < treeCount; i++) {
    drawTree(140 + i * 200, canvas.height * 0.325 - 20, mood);
  }
  drawFlowers(mood);
  drawBirds(mood);
  drawTrash(mood);
  drawLightning(mood);
}
