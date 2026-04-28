/* ========================= */
/*      FATE'S WHEEL GAME    */
/* ========================= */

let wheelSpinning = false;

const WHEEL_SEGMENTS = [
  { label: '2x', multiplier: 2, color: '#27ae60' },
  { label: '0.5x', multiplier: 0.5, color: '#c0392b' },
  { label: '3x', multiplier: 3, color: '#2980b9' },
  { label: 'LOSE', multiplier: 0, color: '#1a0e0a' },
  { label: '2x', multiplier: 2, color: '#27ae60' },
  { label: '5x', multiplier: 5, color: '#8e44ad' },
  { label: '0.5x', multiplier: 0.5, color: '#c0392b' },
  { label: '2x', multiplier: 2, color: '#27ae60' },
  { label: '3x', multiplier: 3, color: '#2980b9' },
  { label: 'JACKPOT', multiplier: 10, color: '#d4a843' },
  { label: '0.5x', multiplier: 0.5, color: '#c0392b' },
  { label: '2x', multiplier: 2, color: '#27ae60' },
];

let wheelAngle = 0;

function getWheelSegments() {
  // Wizard perk: extra jackpot slot (replace one LOSE with JACKPOT 2x)
  if (gameState.player && gameState.player.class === 'wizard') {
    return WHEEL_SEGMENTS.map(s => {
      if (s.label === 'LOSE') {
        return { label: '2x', multiplier: 2, color: '#27ae60' };
      }
      return s;
    });
  }
  return WHEEL_SEGMENTS;
}

function drawWheel() {
  const canvas = document.getElementById('wheel-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const segments = getWheelSegments();
  const numSeg = segments.length;
  const arcSize = (2 * Math.PI) / numSeg;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = Math.min(cx, cy) - 5;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  segments.forEach((seg, i) => {
    const startAngle = wheelAngle + i * arcSize;
    const endAngle = startAngle + arcSize;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    ctx.strokeStyle = '#d4a843';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle + arcSize / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Cinzel, serif';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 3;
    ctx.fillText(seg.label, radius - 15, 5);
    ctx.restore();
  });

  // Center circle
  ctx.beginPath();
  ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
  ctx.fillStyle = '#3d2b1f';
  ctx.fill();
  ctx.strokeStyle = '#d4a843';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function spinWheel() {
  if (wheelSpinning) return;
  const bet = bets.wheel;
  if (bet > gameState.gold) {
    bets.wheel = Math.max(10, gameState.gold);
    document.getElementById('wheel-bet').textContent = bets.wheel;
    return;
  }
  if (gameState.gold < 10) return;

  wheelSpinning = true;
  document.getElementById('btn-spin').disabled = true;
  document.getElementById('wheel-result').classList.add('hidden');

  const segments = getWheelSegments();
  const numSeg = segments.length;
  const arcSize = (2 * Math.PI) / numSeg;

  // Pick random landing segment
  const landingIndex = Math.floor(Math.random() * numSeg);
  // Calculate target angle (pointer is at top = -PI/2)
  const targetAngle = -(landingIndex * arcSize + arcSize / 2) - Math.PI / 2;
  const fullSpins = 5 + Math.floor(Math.random() * 3);
  const totalRotation = fullSpins * 2 * Math.PI + (targetAngle - wheelAngle);

  const startAngle = wheelAngle;
  const duration = 4000;
  const startTime = performance.now();

  playSound('wheel');

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    wheelAngle = startAngle + totalRotation * eased;
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Land
      const seg = segments[landingIndex];
      resolveWheelResult(seg, bet);
    }
  }

  requestAnimationFrame(animate);
}

function resolveWheelResult(segment, bet) {
  const resultEl = document.getElementById('wheel-result');
  resultEl.classList.remove('hidden', 'win', 'lose', 'push');

  let xpGain = 10;

  if (segment.multiplier === 0) {
    addGold(-bet);
    showGoldChange(-bet);
    resultEl.classList.add('lose');
    resultEl.textContent = `💀 LOSE ALL! -${bet} gold!`;
    recordGame('wheel', false, -bet);
    playSound('lose');
  } else if (segment.multiplier < 1) {
    const loss = Math.floor(bet * (1 - segment.multiplier));
    addGold(-loss);
    showGoldChange(-loss);
    resultEl.classList.add('lose');
    resultEl.textContent = `😬 ${segment.label}... -${loss} gold`;
    recordGame('wheel', false, -loss);
    playSound('lose');
  } else {
    const winnings = Math.floor(bet * segment.multiplier * getBardStreakBonus());
    addGold(winnings);
    showGoldChange(winnings);
    resultEl.classList.add('win');

    if (segment.multiplier >= 10) {
      resultEl.textContent = `🌟 JACKPOT!! +${winnings} gold!!!`;
      xpGain = 50;
      // Jackpot loot drop
      const loot = generateRandomLoot('rare');
      addLootItem(loot);
      showLootDrop(loot);
    } else if (segment.multiplier >= 5) {
      resultEl.textContent = `🎉 ${segment.label}! +${winnings} gold!`;
      xpGain = 30;
    } else {
      resultEl.textContent = `🎉 ${segment.label}! +${winnings} gold!`;
      xpGain = 15;
    }
    recordGame('wheel', true, winnings);
    playSound('win');
  }

  addXP(xpGain);
  wheelSpinning = false;
  document.getElementById('btn-spin').disabled = false;
}

// Initial draw
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(drawWheel, 100);
});
