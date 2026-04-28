/* ========================= */
/*   BLACKJACK OF THE ABYSS  */
/* ========================= */

const BJ_SUITS = ['♠', '♥', '♦', '♣'];
const BJ_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const BJ_MONSTER_NAMES = {
  'J': 'Goblin',
  'Q': 'Mind Flayer',
  'K': 'Beholder'
};

let bjDeck = [];
let bjPlayerHand = [];
let bjDealerHand = [];
let bjBet = 0;
let bjGameActive = false;

function createDeck() {
  const deck = [];
  for (const suit of BJ_SUITS) {
    for (const rank of BJ_RANKS) {
      deck.push({ rank, suit });
    }
  }
  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function cardValue(card) {
  if (['J', 'Q', 'K'].includes(card.rank)) return 10;
  if (card.rank === 'A') return 11;
  return parseInt(card.rank);
}

function handValue(hand) {
  let total = 0;
  let aces = 0;
  for (const card of hand) {
    total += cardValue(card);
    if (card.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function renderCard(card, faceDown) {
  const div = document.createElement('div');
  const isRed = card.suit === '♥' || card.suit === '♦';
  div.className = `playing-card ${isRed ? 'red' : ''} ${faceDown ? 'face-down' : ''}`;

  if (!faceDown) {
    const displayRank = BJ_MONSTER_NAMES[card.rank] ? card.rank : card.rank;
    div.innerHTML = `<span>${displayRank}</span><span class="card-suit">${card.suit}</span>`;
  }
  return div;
}

function renderBlackjackHands(hideDealer) {
  const dealerCards = document.getElementById('dealer-cards');
  const playerCards = document.getElementById('player-cards');
  dealerCards.innerHTML = '';
  playerCards.innerHTML = '';

  bjDealerHand.forEach((card, i) => {
    dealerCards.appendChild(renderCard(card, hideDealer && i === 0));
  });

  bjPlayerHand.forEach(card => {
    playerCards.appendChild(renderCard(card, false));
  });

  const dealerTotal = document.getElementById('dealer-total');
  const playerTotal = document.getElementById('player-bj-total');

  if (hideDealer) {
    dealerTotal.textContent = `(${cardValue(bjDealerHand[1])} + ?)`;
  } else {
    dealerTotal.textContent = `(${handValue(bjDealerHand)})`;
  }
  playerTotal.textContent = `(${handValue(bjPlayerHand)})`;
}

function startBlackjack() {
  bjBet = bets.blackjack;
  if (bjBet > gameState.gold) {
    bets.blackjack = Math.max(10, gameState.gold);
    document.getElementById('blackjack-bet').textContent = bets.blackjack;
    return;
  }
  if (gameState.gold < 10) return;

  bjDeck = createDeck();
  bjPlayerHand = [bjDeck.pop(), bjDeck.pop()];
  bjDealerHand = [bjDeck.pop(), bjDeck.pop()];
  bjGameActive = true;

  document.getElementById('bj-bet-controls').classList.add('hidden');
  document.getElementById('btn-bj-deal').classList.add('hidden');
  document.getElementById('btn-bj-hit').classList.remove('hidden');
  document.getElementById('btn-bj-stand').classList.remove('hidden');
  document.getElementById('bj-result').classList.add('hidden');

  renderBlackjackHands(true);
  playSound('card');

  // Check for natural blackjack
  if (handValue(bjPlayerHand) === 21) {
    bjGameActive = false;
    setTimeout(() => endBlackjack(), 500);
  }
}

function blackjackHit() {
  if (!bjGameActive) return;
  bjPlayerHand.push(bjDeck.pop());
  renderBlackjackHands(true);
  playSound('card');

  if (handValue(bjPlayerHand) > 21) {
    bjGameActive = false;
    setTimeout(() => endBlackjack(), 500);
  }
}

function blackjackStand() {
  if (!bjGameActive) return;
  bjGameActive = false;

  // Dealer draws to 17
  renderBlackjackHands(false);

  function dealerDraw() {
    if (handValue(bjDealerHand) < 17) {
      bjDealerHand.push(bjDeck.pop());
      renderBlackjackHands(false);
      playSound('card');
      setTimeout(dealerDraw, 600);
    } else {
      endBlackjack();
    }
  }

  setTimeout(dealerDraw, 600);
}

function endBlackjack() {
  renderBlackjackHands(false);

  const playerVal = handValue(bjPlayerHand);
  const dealerVal = handValue(bjDealerHand);
  const resultEl = document.getElementById('bj-result');
  resultEl.classList.remove('hidden', 'win', 'lose', 'push');

  let xpGain = 10;

  if (playerVal > 21) {
    addGold(-bjBet);
    showGoldChange(-bjBet);
    resultEl.classList.add('lose');
    resultEl.textContent = `💀 Bust! You lose ${bjBet} gold.`;
    recordGame('blackjack', false, -bjBet);
    playSound('lose');
  } else if (dealerVal > 21) {
    const winnings = Math.floor(bjBet * getBardStreakBonus());
    addGold(winnings);
    showGoldChange(winnings);
    resultEl.classList.add('win');
    resultEl.textContent = `🎉 Dealer busts! +${winnings} gold!`;
    recordGame('blackjack', true, winnings);
    xpGain = 25;
    playSound('win');
  } else if (playerVal === 21 && bjPlayerHand.length === 2) {
    const winnings = Math.floor(bjBet * 1.5 * getBardStreakBonus());
    addGold(winnings);
    showGoldChange(winnings);
    resultEl.classList.add('win');
    resultEl.textContent = `🌟 BLACKJACK! +${winnings} gold!`;
    recordGame('blackjack', true, winnings);
    xpGain = 35;
    playSound('win');
  } else if (playerVal > dealerVal) {
    const winnings = Math.floor(bjBet * getBardStreakBonus());
    addGold(winnings);
    showGoldChange(winnings);
    resultEl.classList.add('win');
    resultEl.textContent = `🎉 You win! +${winnings} gold!`;
    recordGame('blackjack', true, winnings);
    xpGain = 25;
    playSound('win');
  } else if (playerVal < dealerVal) {
    addGold(-bjBet);
    showGoldChange(-bjBet);
    resultEl.classList.add('lose');
    resultEl.textContent = `💀 Dealer wins. -${bjBet} gold.`;
    recordGame('blackjack', false, -bjBet);
    playSound('lose');
  } else {
    resultEl.classList.add('push');
    resultEl.textContent = `⚖️ Push! Gold returned.`;
    recordGame('blackjack', null, 0);
  }

  addXP(xpGain);

  document.getElementById('btn-bj-hit').classList.add('hidden');
  document.getElementById('btn-bj-stand').classList.add('hidden');
  document.getElementById('btn-bj-deal').classList.remove('hidden');
  document.getElementById('btn-bj-deal').textContent = 'Deal Again';
  document.getElementById('bj-bet-controls').classList.remove('hidden');
}

function leaveBlackjack() {
  bjGameActive = false;
  document.getElementById('btn-bj-hit').classList.add('hidden');
  document.getElementById('btn-bj-stand').classList.add('hidden');
  document.getElementById('btn-bj-deal').classList.remove('hidden');
  document.getElementById('btn-bj-deal').textContent = 'Deal Cards';
  document.getElementById('bj-bet-controls').classList.remove('hidden');
  document.getElementById('bj-result').classList.add('hidden');
  document.getElementById('dealer-cards').innerHTML = '';
  document.getElementById('player-cards').innerHTML = '';
  document.getElementById('dealer-total').textContent = '';
  document.getElementById('player-bj-total').textContent = '';
  showScreen('screen-tavern');
}
