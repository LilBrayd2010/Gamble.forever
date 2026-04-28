/* ========================= */
/*  CORE GAME STATE ENGINE   */
/* ========================= */

const SAVE_KEY = 'gambleForever';

const DEFAULT_STATE = {
  player: null,
  gold: 0,
  xp: 0,
  level: 1,
  dailyStreak: 0,
  lastLogin: null,
  lastClaim: null,
  inventory: [],
  stats: {
    totalGames: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    peakGold: 0,
    biggestWin: 0,
    currentStreak: 0,
    bestStreak: 0,
    gameBreakdown: {
      dice: { played: 0, wins: 0, losses: 0, goldWon: 0, goldLost: 0 },
      blackjack: { played: 0, wins: 0, losses: 0, goldWon: 0, goldLost: 0 },
      wheel: { played: 0, wins: 0, losses: 0, goldWon: 0, goldLost: 0 },
      battle: { played: 0, wins: 0, losses: 0, goldWon: 0, goldLost: 0 },
      chest: { played: 0, wins: 0, losses: 0, goldWon: 0, goldLost: 0 }
    }
  }
};

const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000,
  5200, 6600, 8200, 10000, 12500, 15500, 19000, 23000, 28000, 35000
];

const LEVEL_UNLOCKS = {
  1: ['Dragon\'s Dice', 'Blackjack of the Abyss', 'Fate\'s Wheel'],
  3: ['Monster Battle Bet'],
  5: ['Dungeon Chests'],
  7: ['Higher bet limits (500)'],
  10: ['Maximum bet limits (1000)', 'Title: High Roller'],
  15: ['Title: Dragon Slayer']
};

let gameState = null;
let bets = { dice: 50, blackjack: 50, wheel: 50, battle: 50, chest: 50 };

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
}

function loadGame() {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) {
    gameState = JSON.parse(saved);
    // Merge in any missing default fields
    if (!gameState.stats.gameBreakdown) {
      gameState.stats.gameBreakdown = DEFAULT_STATE.stats.gameBreakdown;
    }
    for (const g of ['dice','blackjack','wheel','battle','chest']) {
      if (!gameState.stats.gameBreakdown[g]) {
        gameState.stats.gameBreakdown[g] = { played:0, wins:0, losses:0, goldWon:0, goldLost:0 };
      }
    }
    if (!gameState.inventory) gameState.inventory = [];
    return true;
  }
  return false;
}

function addGold(amount) {
  gameState.gold += amount;
  if (gameState.gold < 0) gameState.gold = 0;
  if (gameState.gold > gameState.stats.peakGold) {
    gameState.stats.peakGold = gameState.gold;
  }
  updateGoldDisplays();
  saveGame();
}

function addXP(amount) {
  gameState.xp += amount;
  checkLevelUp();
  updateXPDisplay();
  saveGame();
}

function checkLevelUp() {
  const maxLevel = LEVEL_THRESHOLDS.length;
  while (gameState.level < maxLevel && gameState.xp >= LEVEL_THRESHOLDS[gameState.level]) {
    gameState.level++;
    showLevelUp(gameState.level);
  }
}

function getMaxBet() {
  if (gameState.level >= 10) return 1000;
  if (gameState.level >= 7) return 500;
  return 250;
}

function getXPForNextLevel() {
  if (gameState.level >= LEVEL_THRESHOLDS.length) return '∞';
  return LEVEL_THRESHOLDS[gameState.level];
}

function isGameUnlocked(game) {
  switch (game) {
    case 'dice':
    case 'blackjack':
    case 'wheel':
      return true;
    case 'battle':
      return gameState.level >= 3;
    case 'chest':
      return gameState.level >= 5;
    default:
      return false;
  }
}

function recordGame(game, won, goldDelta) {
  const s = gameState.stats;
  const gb = s.gameBreakdown[game];
  s.totalGames++;
  gb.played++;

  if (won === true) {
    s.wins++;
    gb.wins++;
    s.currentStreak++;
    if (s.currentStreak > s.bestStreak) s.bestStreak = s.currentStreak;
    if (goldDelta > s.biggestWin) s.biggestWin = goldDelta;
    gb.goldWon += goldDelta;
  } else if (won === false) {
    s.losses++;
    gb.losses++;
    s.currentStreak = 0;
    gb.goldLost += Math.abs(goldDelta);
  } else {
    s.pushes++;
  }

  saveGame();
}

function updateGoldDisplays() {
  const displays = document.querySelectorAll('#gold-display, .gold-mini-display');
  displays.forEach(el => {
    el.textContent = gameState.gold.toLocaleString();
  });
}

function updateXPDisplay() {
  const xpEl = document.getElementById('xp-display');
  if (xpEl) {
    xpEl.textContent = `${gameState.xp} / ${getXPForNextLevel()}`;
  }
  const levelEl = document.getElementById('player-level-display');
  if (levelEl) {
    levelEl.textContent = `Lvl ${gameState.level}`;
  }
}

function updateTavernUI() {
  const nameEl = document.getElementById('player-name-display');
  const classEl = document.getElementById('player-class-display');
  if (nameEl) nameEl.textContent = gameState.player.name;
  if (classEl) {
    classEl.textContent = gameState.player.class.charAt(0).toUpperCase() + gameState.player.class.slice(1);
  }
  updateGoldDisplays();
  updateXPDisplay();
  updateUnlockBadges();
}

function updateUnlockBadges() {
  const games = ['dice', 'blackjack', 'wheel', 'battle', 'chest'];
  games.forEach(g => {
    const badge = document.getElementById(`unlock-${g}`);
    const table = document.querySelector(`.game-table[data-game="${g}"]`);
    if (!badge || !table) return;

    if (isGameUnlocked(g)) {
      badge.textContent = 'Unlocked';
      badge.classList.remove('locked-badge');
      table.classList.remove('locked');
    } else {
      const req = g === 'battle' ? 'Level 3' : 'Level 5';
      badge.textContent = `🔒 ${req}`;
      badge.classList.add('locked-badge');
      table.classList.add('locked');
    }
  });
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.add('active');
  }
  if (screenId === 'screen-tavern') {
    updateTavernUI();
  }
  if (screenId === 'screen-stats') {
    updateStatsDisplay();
  }
  if (screenId === 'screen-inventory') {
    renderInventory();
  }
  updateGoldDisplays();
}

function openGame(game) {
  if (!isGameUnlocked(game)) {
    return;
  }
  showScreen(`screen-${game}`);
  if (game === 'battle') {
    newBattle();
  }
  if (game === 'chest') {
    resetChests();
  }
}

function adjustBet(game, delta) {
  const maxBet = getMaxBet();
  bets[game] = Math.max(10, Math.min(maxBet, Math.min(gameState.gold, bets[game] + delta)));
  document.getElementById(`${game}-bet`).textContent = bets[game];
}

function setBet(game, type) {
  const maxBet = getMaxBet();
  switch (type) {
    case 'min': bets[game] = 10; break;
    case 'half': bets[game] = Math.max(10, Math.floor(gameState.gold / 2)); break;
    case 'all': bets[game] = Math.max(10, gameState.gold); break;
  }
  bets[game] = Math.min(bets[game], maxBet);
  document.getElementById(`${game}-bet`).textContent = bets[game];
}

function showGoldChange(amount) {
  const el = document.createElement('div');
  el.className = `gold-change ${amount >= 0 ? 'positive' : 'negative'}`;
  el.textContent = amount >= 0 ? `+${amount}` : `${amount}`;
  el.style.left = `${50 + (Math.random() * 20 - 10)}%`;
  el.style.top = '40%';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

function showLevelUp(newLevel) {
  const modal = document.getElementById('modal-levelup');
  const text = document.getElementById('levelup-text');
  const unlocks = document.getElementById('levelup-unlocks');

  text.textContent = `You are now Level ${newLevel}!`;

  const unlocksForLevel = LEVEL_UNLOCKS[newLevel];
  if (unlocksForLevel) {
    unlocks.innerHTML = '<p style="color:var(--green)">Unlocked:</p>' +
      unlocksForLevel.map(u => `<p>⭐ ${u}</p>`).join('');
  } else {
    unlocks.innerHTML = '<p>Your power grows...</p>';
  }

  modal.classList.remove('hidden');
  updateUnlockBadges();
}

function closeLevelUp() {
  document.getElementById('modal-levelup').classList.add('hidden');
}

function closeLootModal() {
  document.getElementById('modal-loot').classList.add('hidden');
}

function getBardStreakBonus() {
  if (gameState.player && gameState.player.class === 'bard' && gameState.stats.currentStreak >= 3) {
    return 2;
  }
  return 1;
}
