/* ========================= */
/*   LEVELING & PROGRESSION  */
/* ========================= */

const LOOT_TABLE = {
  common: [
    { icon: '🎲', name: 'Wooden Dice', desc: 'Simple tavern dice' },
    { icon: '🕯️', name: 'Tallow Candle', desc: 'Dim light for dark corners' },
    { icon: '🍺', name: 'Cheap Ale', desc: 'Tastes like water' },
    { icon: '🪶', name: 'Quill Pen', desc: 'For signing IOUs' },
    { icon: '🧵', name: 'Frayed Rope', desc: 'Barely holds together' },
    { icon: '🥖', name: 'Stale Bread', desc: 'Hard enough to be a weapon' },
  ],
  uncommon: [
    { icon: '💎', name: 'Polished Gem', desc: 'Catches the candlelight' },
    { icon: '🗝️', name: 'Brass Key', desc: 'Opens... something' },
    { icon: '📜', name: 'Old Map', desc: 'X marks the spot (maybe)' },
    { icon: '🧪', name: 'Mystery Potion', desc: 'Smells like courage' },
    { icon: '🪙', name: 'Lucky Coin', desc: 'Slightly weighted to heads' },
    { icon: '🎭', name: 'Masquerade Mask', desc: 'Hide your poker face' },
  ],
  rare: [
    { icon: '⚔️', name: 'Enchanted Blade', desc: 'Glows faintly blue' },
    { icon: '🛡️', name: 'Dragon Scale Shield', desc: 'Warm to the touch' },
    { icon: '👑', name: 'Silver Crown', desc: 'Fit for a tavern king' },
    { icon: '📿', name: 'Amulet of Fortune', desc: 'Luck follows the wearer' },
    { icon: '🔮', name: 'Crystal Ball', desc: 'Shows cloudy visions' },
  ],
  epic: [
    { icon: '🌟', name: 'Star Fragment', desc: 'Fell from the heavens' },
    { icon: '🗡️', name: 'Vorpal Dagger', desc: 'Cuts through anything' },
    { icon: '📖', name: 'Ancient Tome', desc: 'Whispers forbidden knowledge' },
    { icon: '🎪', name: 'Jester\'s Crown', desc: 'The house always loses to this' },
  ],
  legendary: [
    { icon: '🐉', name: 'Dragon\'s Heart', desc: 'Pulses with ancient power' },
    { icon: '⭐', name: 'Wish Stone', desc: 'One wish... choose wisely' },
    { icon: '👁️', name: 'All-Seeing Eye', desc: 'Sees past, present, and future' },
  ]
};

const RARITY_WEIGHTS = {
  common: { common: 0.6, uncommon: 0.3, rare: 0.08, epic: 0.019, legendary: 0.001 },
  uncommon: { common: 0.3, uncommon: 0.4, rare: 0.2, epic: 0.08, legendary: 0.02 },
  rare: { common: 0.1, uncommon: 0.25, rare: 0.4, epic: 0.2, legendary: 0.05 },
  epic: { common: 0, uncommon: 0.1, rare: 0.3, epic: 0.45, legendary: 0.15 },
};

function generateRandomLoot(minRarity) {
  const weights = RARITY_WEIGHTS[minRarity] || RARITY_WEIGHTS.common;
  const roll = Math.random();
  let cumulative = 0;
  let chosenRarity = 'common';

  for (const [rarity, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (roll <= cumulative) {
      chosenRarity = rarity;
      break;
    }
  }

  const items = LOOT_TABLE[chosenRarity];
  const item = items[Math.floor(Math.random() * items.length)];

  return {
    ...item,
    rarity: chosenRarity,
    id: Date.now() + Math.random()
  };
}

function addLootItem(item) {
  gameState.inventory.push(item);
  saveGame();
}

function showLootDrop(item) {
  const modal = document.getElementById('modal-loot');
  const display = document.getElementById('loot-item-display');

  display.innerHTML = `
    <div class="item-icon">${item.icon}</div>
    <div class="item-name">${item.name}</div>
    <div class="item-rarity rarity-${item.rarity}" style="color: var(--${item.rarity})">${item.rarity.toUpperCase()}</div>
    <p style="color: var(--text-dim); font-size: 0.85rem; margin-top: 8px;">${item.desc}</p>
  `;

  modal.classList.remove('hidden');
}

const TITLES = {
  1: 'Newcomer',
  3: 'Tavern Regular',
  5: 'Card Sharp',
  7: 'Fortune Seeker',
  10: 'High Roller',
  15: 'Dragon Slayer',
  20: 'Legend of the Tavern'
};

function getPlayerTitle() {
  let title = 'Newcomer';
  for (const [level, t] of Object.entries(TITLES)) {
    if (gameState.level >= parseInt(level)) {
      title = t;
    }
  }
  return title;
}
