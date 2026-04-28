/* ========================= */
/*   MONSTER BATTLE BET GAME */
/* ========================= */

const MONSTERS = [
  { name: 'Dire Wolf', icon: '🐺', hp: 80, atk: 12, def: 6, speed: 10 },
  { name: 'Orc Berserker', icon: '👹', hp: 100, atk: 14, def: 8, speed: 6 },
  { name: 'Shadow Drake', icon: '🐉', hp: 70, atk: 16, def: 5, speed: 12 },
  { name: 'Iron Golem', icon: '🤖', hp: 130, atk: 10, def: 14, speed: 3 },
  { name: 'Lich King', icon: '💀', hp: 60, atk: 18, def: 4, speed: 9 },
  { name: 'Minotaur', icon: '🐂', hp: 110, atk: 13, def: 10, speed: 5 },
  { name: 'Basilisk', icon: '🐍', hp: 75, atk: 15, def: 7, speed: 11 },
  { name: 'Fire Elemental', icon: '🔥', hp: 65, atk: 17, def: 3, speed: 13 },
  { name: 'Troll', icon: '🧌', hp: 120, atk: 11, def: 9, speed: 4 },
  { name: 'Wraith', icon: '👻', hp: 55, atk: 19, def: 2, speed: 14 },
];

let battleMonsters = [];
let selectedMonster = null;
let battleActive = false;

function getRandomMonsters(count) {
  const shuffled = [...MONSTERS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function newBattle() {
  battleMonsters = getRandomMonsters(3);
  selectedMonster = null;
  battleActive = false;

  const grid = document.getElementById('monster-select');
  grid.innerHTML = '';

  battleMonsters.forEach((monster, i) => {
    const card = document.createElement('div');
    card.className = 'monster-card';
    card.innerHTML = `
      <div class="monster-icon">${monster.icon}</div>
      <h4>${monster.name}</h4>
      <p>HP: ${monster.hp} | ATK: ${monster.atk}</p>
      <p>DEF: ${monster.def} | SPD: ${monster.speed}</p>
    `;
    card.onclick = () => selectMonster(i);
    grid.appendChild(card);
  });

  document.getElementById('battle-arena').classList.add('hidden');
  document.getElementById('battle-log').classList.add('hidden');
  document.getElementById('battle-result').classList.add('hidden');
  document.getElementById('btn-fight').classList.remove('hidden');
  document.getElementById('btn-fight').disabled = true;
  document.getElementById('btn-new-battle').classList.add('hidden');
}

function selectMonster(index) {
  if (battleActive) return;
  selectedMonster = index;

  document.querySelectorAll('.monster-card').forEach((card, i) => {
    card.classList.toggle('selected', i === index);
  });

  document.getElementById('btn-fight').disabled = false;
}

function rollD20() {
  return Math.floor(Math.random() * 20) + 1;
}

function startBattle() {
  if (selectedMonster === null || battleActive) return;

  const bet = bets.battle;
  if (bet > gameState.gold) {
    bets.battle = Math.max(10, gameState.gold);
    document.getElementById('battle-bet').textContent = bets.battle;
    return;
  }
  if (gameState.gold < 10) return;

  battleActive = true;
  document.getElementById('btn-fight').classList.add('hidden');

  // Pick opponent (random from remaining)
  const remaining = battleMonsters.filter((_, i) => i !== selectedMonster);
  const opponentIdx = Math.floor(Math.random() * remaining.length);
  const opponent = { ...remaining[opponentIdx] };
  const player = { ...battleMonsters[selectedMonster] };

  // Warrior perk: +15% win rate (boost stats)
  if (gameState.player.class === 'warrior') {
    player.atk = Math.floor(player.atk * 1.15);
    player.def = Math.floor(player.def * 1.15);
  }

  // Setup arena
  const arena = document.getElementById('battle-arena');
  arena.classList.remove('hidden');

  document.getElementById('fighter-left-icon').textContent = player.icon;
  document.getElementById('fighter-left-name').textContent = player.name;
  document.getElementById('fighter-right-icon').textContent = opponent.icon;
  document.getElementById('fighter-right-name').textContent = opponent.name;

  let playerHP = player.hp;
  let opponentHP = opponent.hp;

  document.getElementById('fighter-left-hp').style.width = '100%';
  document.getElementById('fighter-right-hp').style.width = '100%';
  document.getElementById('fighter-left-hp-text').textContent = `${playerHP}/${player.hp}`;
  document.getElementById('fighter-right-hp-text').textContent = `${opponentHP}/${opponent.hp}`;

  const log = document.getElementById('battle-log');
  log.classList.remove('hidden');
  log.innerHTML = '<p>⚔️ Battle begins!</p>';

  // Determine turn order
  const fighters = [
    { data: player, side: 'left', hp: playerHP, maxHp: player.hp },
    { data: opponent, side: 'right', hp: opponentHP, maxHp: opponent.hp }
  ];

  if (opponent.speed > player.speed) {
    fighters.reverse();
  }

  let round = 0;
  const maxRounds = 30;

  function battleRound() {
    round++;
    if (round > maxRounds) {
      // Timeout — whoever has more HP wins
      finishBattle(fighters[0].hp >= fighters[1].hp ? fighters[0] : fighters[1], bet);
      return;
    }

    for (let i = 0; i < 2; i++) {
      const attacker = fighters[i];
      const defender = fighters[1 - i];

      if (attacker.hp <= 0 || defender.hp <= 0) continue;

      const roll = rollD20();
      const isCrit = roll === 20;
      const isMiss = roll === 1;

      let logEntry;

      if (isMiss) {
        logEntry = `<p class="miss">Round ${round}: ${attacker.data.name} misses! (rolled 1)</p>`;
      } else {
        let damage = Math.max(1, attacker.data.atk - defender.data.def + roll - 10);
        if (isCrit) {
          damage = Math.floor(damage * 2);
          logEntry = `<p class="crit">Round ${round}: ${attacker.data.name} CRITS for ${damage}! (rolled 20)</p>`;
        } else {
          logEntry = `<p>Round ${round}: ${attacker.data.name} hits for ${damage} (rolled ${roll})</p>`;
        }
        defender.hp = Math.max(0, defender.hp - damage);
      }

      log.innerHTML += logEntry;
      log.scrollTop = log.scrollHeight;

      // Update HP bars
      const defHpBar = document.getElementById(`fighter-${defender.side}-hp`);
      const defHpText = document.getElementById(`fighter-${defender.side}-hp-text`);
      defHpBar.style.width = `${(defender.hp / defender.maxHp) * 100}%`;
      defHpText.textContent = `${defender.hp}/${defender.maxHp}`;

      if (defender.hp <= 0) {
        finishBattle(attacker, bet);
        return;
      }
    }

    setTimeout(battleRound, 800);
  }

  playSound('battle');
  setTimeout(battleRound, 500);
}

function finishBattle(winner, bet) {
  battleActive = false;
  const resultEl = document.getElementById('battle-result');
  resultEl.classList.remove('hidden', 'win', 'lose');

  const isPlayerWin = winner.side === 'left';
  let xpGain = 15;

  if (isPlayerWin) {
    const winnings = Math.floor(bet * 1.5 * getBardStreakBonus());
    addGold(winnings);
    showGoldChange(winnings);
    resultEl.classList.add('win');
    resultEl.textContent = `🎉 ${winner.data.name} wins! +${winnings} gold!`;
    recordGame('battle', true, winnings);
    xpGain = 30;
    playSound('win');
  } else {
    addGold(-bet);
    showGoldChange(-bet);
    resultEl.classList.add('lose');
    resultEl.textContent = `💀 ${winner.data.name} defeats your champion! -${bet} gold`;
    recordGame('battle', false, -bet);
    playSound('lose');
  }

  addXP(xpGain);
  document.getElementById('btn-new-battle').classList.remove('hidden');
}
