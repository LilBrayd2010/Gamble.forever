/* ========================= */
/*   DUNGEON CHESTS GAME     */
/* ========================= */

let chestContents = [];
let chestsPicked = false;

function resetChests() {
  chestsPicked = false;

  // Randomly assign: treasure, even, mimic
  const types = ['treasure', 'even', 'mimic'];
  // Shuffle
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }
  chestContents = types;

  const chests = document.querySelectorAll('.dungeon-chest');
  chests.forEach((chest, i) => {
    chest.className = 'dungeon-chest';
    chest.querySelector('.chest-body').textContent = '🎁';
    chest.querySelector('p').textContent = ['Chest I', 'Chest II', 'Chest III'][i];
    chest.onclick = () => pickChest(i);
  });

  document.getElementById('chest-result').classList.add('hidden');
  document.getElementById('btn-new-chests').classList.add('hidden');
}

function pickChest(index) {
  if (chestsPicked) return;

  const bet = bets.chest;
  if (bet > gameState.gold) {
    bets.chest = Math.max(10, gameState.gold);
    document.getElementById('chest-bet').textContent = bets.chest;
    return;
  }
  if (gameState.gold < 10) return;

  chestsPicked = true;
  playSound('chest');

  const chests = document.querySelectorAll('.dungeon-chest');
  const type = chestContents[index];

  // Reveal picked chest first
  setTimeout(() => {
    revealChest(chests[index], type, true);

    // Reveal others after delay
    setTimeout(() => {
      chests.forEach((chest, i) => {
        if (i !== index) {
          revealChest(chest, chestContents[i], false);
        }
      });

      resolveChest(type, bet);
    }, 800);
  }, 300);
}

function revealChest(chestEl, type, isPicked) {
  chestEl.classList.add('revealed', type);
  if (isPicked) chestEl.classList.add('picked');

  const body = chestEl.querySelector('.chest-body');
  const label = chestEl.querySelector('p');

  switch (type) {
    case 'treasure':
      body.textContent = '💰';
      label.textContent = 'Treasure!';
      label.style.color = 'var(--gold-bright)';
      break;
    case 'even':
      body.textContent = '🪙';
      label.textContent = 'Break Even';
      label.style.color = 'var(--text-dim)';
      break;
    case 'mimic':
      body.textContent = '👅';
      label.textContent = 'Mimic!';
      label.style.color = 'var(--red)';
      break;
  }
}

function resolveChest(type, bet) {
  const resultEl = document.getElementById('chest-result');
  resultEl.classList.remove('hidden', 'win', 'lose', 'push');

  let xpGain = 10;

  switch (type) {
    case 'treasure': {
      const winnings = Math.floor(bet * 2.5 * getBardStreakBonus());
      addGold(winnings);
      showGoldChange(winnings);
      resultEl.classList.add('win');
      resultEl.textContent = `🎉 Treasure! +${winnings} gold!`;
      recordGame('chest', true, winnings);
      xpGain = 25;
      playSound('win');

      // Chance for loot drop
      if (Math.random() < 0.3) {
        const loot = generateRandomLoot('uncommon');
        addLootItem(loot);
        showLootDrop(loot);
      }
      break;
    }
    case 'even':
      resultEl.classList.add('push');
      resultEl.textContent = `⚖️ Break even. Gold returned.`;
      recordGame('chest', null, 0);
      break;
    case 'mimic':
      addGold(-bet);
      showGoldChange(-bet);
      resultEl.classList.add('lose');
      resultEl.textContent = `💀 A Mimic! It devours ${bet} gold!`;
      recordGame('chest', false, -bet);
      playSound('lose');
      break;
  }

  addXP(xpGain);
  document.getElementById('btn-new-chests').classList.remove('hidden');
}
