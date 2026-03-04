/**
 * Generates a shareable results PNG card using the HTML5 Canvas API.
 * Returns a Blob that can be passed to Web Share API (files) or downloaded.
 *
 * @param {Array<{name: string, score: number}>} players - sorted by score desc
 * @param {string} gameId - game code shown in the footer
 */
export async function generateResultsImage(players, gameId) {
  const W = 600;
  const H = Math.max(620, 260 + players.length * 76 + 80);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // ── Background ────────────────────────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#0f0020');
  bgGrad.addColorStop(1, '#1e0040');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle radial glow in top-left
  const radial = ctx.createRadialGradient(120, 80, 0, 120, 80, 280);
  radial.addColorStop(0, 'rgba(168,85,247,0.18)');
  radial.addColorStop(1, 'rgba(168,85,247,0)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, W, H);

  // Decorative stars
  const stars = [
    [30, 30], [570, 25], [55, H - 40], [555, H - 50],
    [300, 20], [490, 80], [110, 160], [510, 180],
    [40, 350], [560, 320],
  ];
  stars.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(216,180,254,0.4)';
    ctx.fill();
  });

  // ── Title ─────────────────────────────────────────────────────────────────
  ctx.textAlign = 'center';
  ctx.font = 'bold 76px "Arial Hebrew", Arial, sans-serif';
  ctx.fillStyle = '#a855f7';
  ctx.shadowColor = 'rgba(168,85,247,0.6)';
  ctx.shadowBlur = 20;
  ctx.fillText('אנדי', W / 2, 88);
  ctx.shadowBlur = 0;

  ctx.font = '22px "Arial Hebrew", Arial, sans-serif';
  ctx.fillStyle = 'rgba(192,132,252,0.65)';
  ctx.fillText('תוצאות המשחק', W / 2, 124);

  // Divider
  ctx.strokeStyle = 'rgba(168,85,247,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 148);
  ctx.lineTo(W - 40, 148);
  ctx.stroke();

  // ── Player rows ───────────────────────────────────────────────────────────
  const MEDALS = ['🥇', '🥈', '🥉'];
  const sorted = [...players].sort((a, b) => b.score - a.score);

  sorted.forEach((player, i) => {
    const y = 176 + i * 76;
    const isFirst = i === 0;

    // Row background
    if (isFirst) {
      const rowGrad = ctx.createLinearGradient(30, y, W - 30, y);
      rowGrad.addColorStop(0, 'rgba(168,85,247,0.30)');
      rowGrad.addColorStop(1, 'rgba(168,85,247,0.08)');
      ctx.fillStyle = rowGrad;
    } else {
      ctx.fillStyle = i % 2 === 0
        ? 'rgba(255,255,255,0.04)'
        : 'rgba(255,255,255,0.02)';
    }
    roundRect(ctx, 30, y, W - 60, 64, 14);
    ctx.fill();

    // Winner glow border
    if (isFirst) {
      ctx.strokeStyle = 'rgba(168,85,247,0.5)';
      ctx.lineWidth = 1.5;
      roundRect(ctx, 30, y, W - 60, 64, 14);
      ctx.stroke();
    }

    // Medal / rank  (right side, RTL)
    const medal = MEDALS[i];
    if (medal) {
      ctx.font = '30px serif';
      ctx.textAlign = 'right';
      ctx.fillText(medal, W - 46, y + 41);
    } else {
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillStyle = 'rgba(192,132,252,0.5)';
      ctx.textAlign = 'right';
      ctx.fillText(`${i + 1}.`, W - 48, y + 41);
    }

    // Player name (RTL, next to medal)
    ctx.font = `${isFirst ? 'bold' : ''} 24px "Arial Hebrew", Arial, sans-serif`;
    ctx.fillStyle = isFirst ? '#e9d5ff' : 'rgba(216,180,254,0.85)';
    ctx.textAlign = 'right';
    ctx.fillText(player.name, W - 88, y + 41);

    // Score (left side)
    const scoreText = `${player.score}`;
    ctx.font = `bold ${isFirst ? '28' : '24'}px Arial, sans-serif`;
    ctx.fillStyle = isFirst ? '#c084fc' : '#9333ea';
    ctx.textAlign = 'left';
    ctx.fillText(scoreText, 52, y + 41);

    // "נק׳" label
    const scoreW = ctx.measureText(scoreText).width;
    ctx.font = '14px "Arial Hebrew", Arial, sans-serif';
    ctx.fillStyle = 'rgba(168,85,247,0.55)';
    ctx.fillText(' נק׳', 52 + scoreW, y + 41);
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = H - 36;
  ctx.textAlign = 'center';
  ctx.font = '15px "Arial Hebrew", Arial, sans-serif';
  ctx.fillStyle = 'rgba(168,85,247,0.30)';
  ctx.fillText(`lironavrahami.github.io/endy  •  קוד: ${gameId}`, W / 2, footerY);

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
