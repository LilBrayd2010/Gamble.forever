/* ========================= */
/*     DRAGON'S DICE GAME    */
/* ========================= */

let diceRolling = false;

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function playDice() {
  if (diceRolling) return;
  const bet = bets.dice;
  if (bet > gameState.gold) {
    bets.dice = Math.max(10, gameState.gold);
    document.getElementById('dice-bet').textContent = bets.dice;
    return;
  }
  if (gameState.gold < 10) return;

  diceRolling = true;
  const resultEl = document.getElementById('dice-result');
  resultEl.classList.add('hidden');

  const rollBtn = document.getElementById('btn-roll-dice');
  rollBtn.disabled = true;

  // Animate dice
  const dice = ['player-die-1', 'player-die-2', 'house-die-1', 'house-die-2'];
  dice.forEach(id => {
    document.getElementById(id).classList.add('rolling');
    document.getElementById(id).textContent = '?';
  });

  document.getElementById('player-dice-total').textContent = '-';
  document.getElementById('house-dice-total').textContent = '-';

  playSound('dice');

  // Roll animation
  let rollCount = 0;
  const rollInterval = setInterval(() => {
    dice.forEach(id => {
      document.getElementById(id).textContent = rollDie();
    });
    rollCount++;
    if (rollCount >= 15) {
      clearInterval(rollInterval);
      finishDiceRoll(bet);
    }
  }, 80);
}

function finishDiceRoll(bet) {
  let p1 = rollDie(), p2 = rollDie();
  let h1 = rollDie(), h2 = rollDie();

  // Rogue perk: +10% odds (re-roll if player total < house total, 10% chance)
  if (gameState.player.class === 'rogue' && Math.random() < 0.10) {
    if (p1 + p2 < h1 + h2) {
      p1 = rollDie();
      p2 = rollDie();
    }
  }

  const playerTotal = p1 + p2;
  const houseTotal = h1 + h2;

  document.getElementById('player-die-1').textContent = p1;
  document.getElementById('player-die-2').textContent = p2;
  document.getElementById('house-die-1').textContent = h1;
  document.getElementById('house-die-2').textContent = h2;
  document.getElementById('player-dice-total').textContent = playerTotal;
  document.getElementById('house-dice-total').textContent = houseTotal;

  ['player-die-1', 'player-die-2', 'house-die-1', 'house-die-2'].forEach(id => {
    document.getElementById(id).classList.remove('rolling');
  });

  const resultEl = document.getElementById('dice-result');
  resultEl.classList.remove('hidden', 'win', 'lose', 'push');

  let xpGain = 10;

  if (playerTotal > houseTotal) {
    const winnings = Math.floor(bet * getBardStreakBonus());
    addGold(winnings);
    showGoldChange(winnings);
    resultEl.classList.add('win');
    resultEl.textContent = `🎉 You win! +${winnings} gold!`;
    recordGame('dice', true, winnings);
    xpGain = 20;
    playSound('win');
  } else if (playerTotal < houseTotal) {
    addGold(-bet);
    showGoldChange(-bet);
    resultEl.classList.add('lose');
    resultEl.textContent = `💀 House wins! -${bet} gold`;
    recordGame('dice', false, -bet);
    playSound('lose');
  } else {
    resultEl.classList.add('push');
    resultEl.textContent = `⚖️ Tie! Gold returned.`;
    recordGame('dice', null, 0);
  }

  addXP(xpGain);
  document.getElementById('btn-roll-dice').disabled = false;
  diceRolling = false;
}
