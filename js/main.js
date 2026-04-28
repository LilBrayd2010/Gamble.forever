/* ========================= */
/*     MAIN INITIALIZATION   */
/* ========================= */

document.addEventListener('DOMContentLoaded', () => {
  // Character creation
  const classCards = document.querySelectorAll('.class-card');
  const nameInput = document.getElementById('char-name');
  const createBtn = document.getElementById('btn-create');
  let selectedClass = null;

  classCards.forEach(card => {
    card.addEventListener('click', () => {
      classCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedClass = card.dataset.class;
      checkCreateReady();
    });
  });

  nameInput.addEventListener('input', checkCreateReady);

  function checkCreateReady() {
    createBtn.disabled = !(nameInput.value.trim() && selectedClass);
  }

  createBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name || !selectedClass) return;

    gameState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    gameState.player = { name, class: selectedClass };
    gameState.gold = 0; // Will get gold from daily bonus
    gameState.stats.peakGold = 0;
    saveGame();

    // Go to daily login
    initDailyScreen();
    showScreen('screen-daily');
    playSound('coins');
  });

  // Load existing game
  if (loadGame() && gameState.player) {
    if (shouldShowDailyBonus()) {
      initDailyScreen();
      showScreen('screen-daily');
    } else {
      showScreen('screen-tavern');
    }
  } else {
    showScreen('screen-character');
  }

  // Draw wheel on load
  setTimeout(drawWheel, 200);
});
