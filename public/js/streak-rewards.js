/**
 * @module streak-rewards
 * @fileoverview Garden bonus decorations for streak milestones.
 * Extracted from world-render.js to keep each file <200 lines.
 */

export function drawStreakRewards(ctx, canvas, mood, streak) {
  if (mood === 'high') return;
  if (streak >= 7) {
    drawButterflies(ctx, 4);
    drawSpecialFlowers(ctx, canvas);
  } else if (streak >= 5) {
    drawButterflies(ctx, 2);
  } else if (streak >= 3) {
    drawButterflies(ctx, 1);
  }
}

function drawButterflies(ctx, count) {
  const pos = [
    { x: 100, y: 100 }, { x: 350, y: 80 },
    { x: 600, y: 110 }, { x: 200, y: 130 },
  ];
  for (let i = 0; i < count && i < pos.length; i++) {
    const p = pos[i];
    ctx.fillStyle = '#e91e63';
    ctx.beginPath();
    ctx.ellipse(p.x - 6, p.y, 5, 3, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(p.x + 6, p.y, 5, 3, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSpecialFlowers(ctx, canvas) {
  const by = canvas.height * 0.72;
  for (let i = 0; i < 5; i++) {
    const x = 80 + i * (canvas.width / 5);
    const y = by + Math.sin(i * 2) * 10;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + 5);
    ctx.lineTo(x, y + 18);
    ctx.stroke();
  }
}
