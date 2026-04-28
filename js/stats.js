/* ========================= */
/*     STATS / LEADERBOARD   */
/* ========================= */

function updateStatsDisplay() {
  const s = gameState.stats;

  document.getElementById('stat-total-games').textContent = s.totalGames;
  document.getElementById('stat-wins').textContent = s.wins;
  document.getElementById('stat-losses').textContent = s.losses;

  const winRate = s.totalGames > 0
    ? Math.round((s.wins / (s.wins + s.losses)) * 100)
    : 0;
  document.getElementById('stat-winrate').textContent = `${winRate}%`;
  document.getElementById('stat-peak-gold').textContent = s.peakGold.toLocaleString();
  document.getElementById('stat-biggest-win').textContent = s.biggestWin.toLocaleString();
  document.getElementById('stat-streak').textContent = s.currentStreak;
  document.getElementById('stat-best-streak').textContent = s.bestStreak;

  // Game breakdown
  const breakdown = document.getElementById('game-stats-breakdown');
  breakdown.innerHTML = '';

  const gameNames = {
    dice: '🎲 Dragon\'s Dice',
    blackjack: '🃏 Blackjack',
    wheel: '🎡 Fate\'s Wheel',
    battle: '⚔️ Monster Battle',
    chest: '🗡️ Dungeon Chests'
  };

  for (const [game, name] of Object.entries(gameNames)) {
    const gb = s.gameBreakdown[game];
    if (!gb || gb.played === 0) continue;

    const card = document.createElement('div');
    card.className = 'game-stat-card';
    const gameWinRate = gb.played > 0
      ? Math.round((gb.wins / gb.played) * 100)
      : 0;
    card.innerHTML = `
      <h4>${name}</h4>
      <p>Played: ${gb.played} | Wins: ${gb.wins} | Losses: ${gb.losses}</p>
      <p>Win Rate: ${gameWinRate}%</p>
      <p>Gold Won: ${gb.goldWon.toLocaleString()} | Lost: ${gb.goldLost.toLocaleString()}</p>
    `;
    breakdown.appendChild(card);
  }

  if (breakdown.children.length === 0) {
    breakdown.innerHTML = '<p class="empty-msg">No games played yet. Visit the tavern!</p>';
  }
}
