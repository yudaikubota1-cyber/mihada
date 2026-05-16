/**
 * 診断結果のシェア用画像をCanvas APIで生成
 */
export async function generateShareImage({ skinType, concerns, ingredients, message }) {
  const W = 1080, H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#FDFCFA';
  ctx.fillRect(0, 0, W, H);

  // Top accent bar
  ctx.fillStyle = '#1A1814';
  ctx.fillRect(0, 0, W, 6);

  // Brand header
  ctx.fillStyle = '#C0B8B0';
  ctx.font = '500 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '4px';
  ctx.fillText('INGREDIENT LOGIC AI', W / 2, 80);

  // miHada logo
  ctx.fillStyle = '#1A1814';
  ctx.font = '600 36px system-ui, sans-serif';
  ctx.fillText('miHada', W / 2, 130);

  // Divider line
  ctx.strokeStyle = '#E8E4E0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, 165);
  ctx.lineTo(W - 100, 165);
  ctx.stroke();

  // "YOUR DIAGNOSIS" label
  ctx.fillStyle = '#B5B0A8';
  ctx.font = '500 14px "JetBrains Mono", monospace';
  ctx.fillText('YOUR DIAGNOSIS', W / 2, 210);

  // Skin type
  ctx.fillStyle = '#1A1814';
  ctx.font = '700 48px system-ui, sans-serif';
  ctx.fillText(skinType, W / 2, 280);

  // Concerns as tags
  ctx.font = '500 22px system-ui, sans-serif';
  const concernText = concerns.join('  ·  ');
  ctx.fillStyle = '#777';
  ctx.fillText(concernText, W / 2, 330);

  // Divider
  ctx.strokeStyle = '#E8E4E0';
  ctx.beginPath();
  ctx.moveTo(100, 370);
  ctx.lineTo(W - 100, 370);
  ctx.stroke();

  // "KEY INGREDIENTS" label
  ctx.fillStyle = '#B5B0A8';
  ctx.font = '500 14px "JetBrains Mono", monospace';
  ctx.fillText('KEY INGREDIENTS', W / 2, 420);

  // Ingredients list
  const ingList = (ingredients || []).slice(0, 5);
  ctx.textAlign = 'center';
  const startY = 470;
  ingList.forEach((ing, i) => {
    const y = startY + i * 65;
    // Number
    ctx.fillStyle = '#D0D0D0';
    ctx.font = '500 14px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(String(i + 1).padStart(2, '0'), 140, y);
    // Name
    ctx.fillStyle = '#1A1814';
    ctx.font = '700 26px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(typeof ing === 'string' ? ing : ing.name, 190, y);
    // Category badge
    if (typeof ing === 'object' && ing.category) {
      ctx.fillStyle = '#EFEFEF';
      const badgeX = 190 + ctx.measureText(ing.name).width + 16;
      const badgeW = ctx.measureText(ing.category).width + 20;
      roundRect(ctx, badgeX, y - 16, badgeW, 24, 4);
      ctx.fill();
      ctx.fillStyle = '#888';
      ctx.font = '400 13px "JetBrains Mono", monospace';
      ctx.fillText(ing.category, badgeX + 10, y);
    }
  });

  // AI message
  if (message) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#999';
    ctx.font = '400 18px system-ui, sans-serif';
    const maxW = W - 200;
    wrapText(ctx, message, W / 2, 800, maxW, 28);
  }

  // Bottom bar
  ctx.fillStyle = '#1A1814';
  ctx.fillRect(0, H - 80, W, 80);
  ctx.fillStyle = '#fff';
  ctx.font = '600 18px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('mihada.vercel.app', W / 2, H - 40);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '400 12px "JetBrains Mono", monospace';
  ctx.fillText('AI × INGREDIENT LOGIC × KOREAN SKINCARE', W / 2, H - 18);

  return canvas;
}

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

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split('');
  let line = '';
  let lineY = y;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth) {
      ctx.fillText(line, x, lineY);
      line = ch;
      lineY += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, lineY);
}

/**
 * シェアまたはダウンロード
 */
export async function shareOrDownload(canvas) {
  const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
  const file = new File([blob], 'mihada-diagnosis.png', { type: 'image/png' });

  // Web Share APIが使えるならシェア
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: 'miHada AI肌診断結果',
        text: '成分ロジックで自分に合う韓国スキンケアを見つけました！',
        url: 'https://mihada.vercel.app',
        files: [file],
      });
      return 'shared';
    } catch (e) {
      if (e.name === 'AbortError') return 'cancelled';
    }
  }

  // フォールバック：ダウンロード
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mihada-diagnosis.png';
  a.click();
  URL.revokeObjectURL(url);
  return 'downloaded';
}
