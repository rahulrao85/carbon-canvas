/**
 * @module world-render
 * @fileoverview Canvas garden that visualises carbon levels visually.
 * Low → sunny/green, Medium → overcast, High → grey/trash/lightning.
 */
const canvas = document.getElementById('garden-canvas');
const ctx = canvas.getContext('2d');
function getMood(kgCO2) {
  if (kgCO2 <= 10) return 'low';
  if (kgCO2 <= 30) return 'medium';
  return 'high';
}
function drawSky(mood) {
  const gradients = {
    low: ['#4fc3f7', '#b3e5fc'],
    medium: ['#90a4ae', '#cfd8dc'],
    high: ['#546e7a', '#78909c'],
  };
  const [top, bottom] = gradients[mood];
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function drawSun(mood) {
  if (mood !== 'low') return;
  const x = canvas.width - 80;
  const y = 60;
  const r = 35;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd54f';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r + 10, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 213, 79, 0.3)';
  ctx.lineWidth = 4;
  ctx.stroke();
}
function drawClouds(mood) {
  const configs = {
    low: [
      { x: 120, y: 50, size: 40, color: '#ffffff' },
      { x: 300, y: 70, size: 30, color: '#f5f5f5' },
      { x: 550, y: 40, size: 35, color: '#ffffff' },
    ],
    medium: [
      { x: 150, y: 55, size: 35, color: '#b0bec5' },
      { x: 400, y: 65, size: 30, color: '#90a4ae' },
    ],
    high: [
      { x: 100, y: 50, size: 50, color: '#546e7a' },
      { x: 350, y: 40, size: 45, color: '#455a64' },
      { x: 600, y: 60, size: 40, color: '#546e7a' },
    ],
  };
  (configs[mood] || []).forEach((c) => {
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.size, c.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = c.color;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(c.x - c.size * 0.5, c.y + 10, c.size * 0.6, c.size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(c.x + c.size * 0.5, c.y + 5, c.size * 0.5, c.size * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}
function drawGround(mood) {
  const groundY = canvas.height * 0.7;
  const colors = {
    low: ['#66bb6a', '#a5d6a7'],
    medium: ['#aed581', '#dce775'],
    high: ['#8d6e63', '#a1887f'],
  };
  const [top, bottom] = colors[mood];
  const grad = ctx.createLinearGradient(0, groundY, 0, canvas.height);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
}
function drawTree(x, y, mood) {
  const trunkColor = mood === 'high' ? '#5d4037' : '#6d4c41';
  const leafColors = {
    low: ['#388e3c', '#4caf50', '#66bb6a'],
    medium: ['#8bc34a', '#9ccc65'],
    high: ['#795548', '#8d6e63'],
  };
  ctx.fillStyle = trunkColor;
  ctx.fillRect(x - 5, y, 10, 50);
  const leaves = leafColors[mood] || leafColors.low;
  for (let i = 0; i < leaves.length; i++) {
    ctx.beginPath();
    ctx.arc(x, y - 10 - i * 15, 22 - i * 3, 0, Math.PI * 2);
    ctx.fillStyle = leaves[i];
    ctx.fill();
  }
}
function drawFlowers(mood) {
  if (mood === 'high') return;
  const count = mood === 'low' ? 12 : 5;
  const baseY = canvas.height * 0.72;
  for (let i = 0; i < count; i++) {
    const x = 50 + i * (canvas.width / count);
    const y = baseY + Math.sin(i * 1.5) * 20;
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
function drawBirds(mood) {
  if (mood !== 'low') return;
  const positions = [
    { x: 200, y: 80 }, { x: 280, y: 100 }, { x: 500, y: 70 },
  ];
  positions.forEach((p) => {
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
function drawTrash(mood) {
  if (mood !== 'high') return;
  const items = [
    { x: 150, y: canvas.height * 0.68 },
    { x: 400, y: canvas.height * 0.72 },
    { x: 650, y: canvas.height * 0.69 },
  ];
  items.forEach((item) => {
    ctx.fillStyle = '#78909c';
    ctx.fillRect(item.x, item.y, 12, 16);
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(item.x + 1, item.y - 2, 10, 4);
  });
}
function drawLightning(mood) {
  if (mood !== 'high') return;
  const bolts = [
    { x: 300, y: 20 }, { x: 600, y: 30 },
  ];
  bolts.forEach((b) => {
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
  const cw = canvas.clientWidth || canvas.width;
  const ch = canvas.clientHeight || canvas.height;
  canvas.width = cw * 2;
  canvas.height = ch * 2;
  ctx.scale(2, 2);
  drawSky(mood);
  drawSun(mood);
  drawClouds(mood);
  drawGround(mood);
  const treeCounts = { low: 3, medium: 1, high: 0 };
  const treeCount = treeCounts[mood];
  for (let i = 0; i < treeCount; i++) {
    drawTree(140 + i * 200, canvas.height * 0.325 - 20, mood);
  }
  drawFlowers(mood);
  drawBirds(mood);
  drawTrash(mood);
  drawLightning(mood);
}
/**
 * Returns the carbon level: 'low', 'medium', or 'high'.
 * @param {number} kgCO2 - Current total CO2 in kg.
 */
export function getCarbonLevel(kgCO2) {
  return getMood(kgCO2);
}
