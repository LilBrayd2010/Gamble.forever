/* ========================= */
/*     DAILY LOGIN BONUS     */
/* ========================= */

function getDailyReward(streak) {
  if (streak >= 7) return 500;
  if (streak >= 3) return 250 + (streak - 1) * 25;
  return 250;
}

function shouldShowDailyBonus() {
  if (!gameState.lastClaim) return true;
  const now = new Date();
  const last = new Date(gameState.lastClaim);
  // Different calendar day
  return now.toDateString() !== last.toDateString();
}

function calculateStreak() {
  if (!gameState.lastClaim) return 1;
  const now = new Date();
  const last = new Date(gameState.lastClaim);
  const diffMs = now.getTime() - last.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return gameState.dailyStreak + 1;
  } else if (diffDays === 0) {
    return gameState.dailyStreak;
  } else {
    return 1;
  }
}

function initDailyScreen() {
  const streak = calculateStreak();
  const reward = getDailyReward(streak);

  document.getElementById('streak-count').textContent = streak;

  // Build streak bar (7 dots)
  const bar = document.getElementById('streak-bar');
  bar.innerHTML = '';
  for (let i = 1; i <= 7; i++) {
    const dot = document.createElement('div');
    dot.className = `streak-dot ${i <= streak ? 'filled' : ''}`;
    dot.textContent = i;
    bar.appendChild(dot);
  }

  document.getElementById('daily-reward-text').textContent = `+${reward} Gold!`;

  // Loot bonus on day 7+
  const lootBonus = document.getElementById('daily-loot-bonus');
  if (streak >= 7) {
    lootBonus.classList.remove('hidden');
    lootBonus.innerHTML = '🎁 <strong>Mystery Loot Chest!</strong> A bonus item awaits!';
  } else {
    lootBonus.classList.add('hidden');
  }

  document.getElementById('btn-claim-daily').classList.remove('hidden');
  document.getElementById('btn-skip-daily').classList.add('hidden');
}

function claimDailyBonus() {
  const streak = calculateStreak();
  const reward = getDailyReward(streak);

  gameState.dailyStreak = streak;
  gameState.lastClaim = new Date().toISOString();
  gameState.lastLogin = new Date().toISOString();

  addGold(reward);
  showGoldChange(reward);

  // Loot drop on 7-day streak
  if (streak >= 7) {
    const loot = generateRandomLoot('uncommon');
    addLootItem(loot);
    showLootDrop(loot);
  }

  document.getElementById('btn-claim-daily').classList.add('hidden');
  document.getElementById('btn-skip-daily').classList.remove('hidden');

  playSound('coins');
  saveGame();
}

document.addEventListener('DOMContentLoaded', () => {
  const claimBtn = document.getElementById('btn-claim-daily');
  if (claimBtn) {
    claimBtn.addEventListener('click', claimDailyBonus);
  }
  const skipBtn = document.getElementById('btn-skip-daily');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => showScreen('screen-tavern'));
  }
});
