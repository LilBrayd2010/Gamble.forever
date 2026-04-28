/* ========================= */
/*      INVENTORY SYSTEM     */
/* ========================= */

function renderInventory() {
  const grid = document.getElementById('inventory-grid');
  const emptyMsg = document.getElementById('inventory-empty');

  if (!gameState.inventory || gameState.inventory.length === 0) {
    grid.innerHTML = '';
    emptyMsg.classList.remove('hidden');
    return;
  }

  emptyMsg.classList.add('hidden');
  grid.innerHTML = '';

  // Sort by rarity
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
  const sorted = [...gameState.inventory].sort((a, b) =>
    (rarityOrder[a.rarity] || 5) - (rarityOrder[b.rarity] || 5)
  );

  sorted.forEach(item => {
    const div = document.createElement('div');
    div.className = `inv-item rarity-${item.rarity}`;
    div.innerHTML = `
      <div class="item-icon">${item.icon}</div>
      <div class="item-name">${item.name}</div>
      <div class="item-rarity">${item.rarity}</div>
    `;
    div.title = item.desc;
    grid.appendChild(div);
  });
}
