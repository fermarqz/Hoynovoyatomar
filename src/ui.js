export function getUI(documentRef = document) {
  return {
    subtitle: documentRef.getElementById('subtitle'),
    playersHeading: documentRef.getElementById('playersHeading'),
    settingsHeading: documentRef.getElementById('settingsHeading'),
    cardLabel: documentRef.getElementById('cardLabel'),
    safeModeLabel: documentRef.getElementById('safeModeLabel'),
    ruleMinLabel: documentRef.getElementById('ruleMinLabel'),
    ruleMaxLabel: documentRef.getElementById('ruleMaxLabel'),
    reduceDupesLabel: documentRef.getElementById('reduceDupesLabel'),
    feedbackHeading: documentRef.getElementById('feedbackHeading'),
    settingsHelp: documentRef.getElementById('settingsHelp'),
    playerInput: documentRef.getElementById('playerInput'),
    playersList: documentRef.getElementById('playersList'),
    cardText: documentRef.getElementById('cardText'),
    addPlayerBtn: documentRef.getElementById('addPlayerBtn'),
    clearPlayersBtn: documentRef.getElementById('clearPlayersBtn'),
    startBtn: documentRef.getElementById('startBtn'),
    prevBtn: documentRef.getElementById('prevBtn'),
    nextBtn: documentRef.getElementById('nextBtn'),
    resetBtn: documentRef.getElementById('resetBtn'),
    safeModeToggle: documentRef.getElementById('safeModeToggle'),
    ruleMinInput: documentRef.getElementById('ruleMinInput'),
    ruleMaxInput: documentRef.getElementById('ruleMaxInput'),
    reduceDupesToggle: documentRef.getElementById('reduceDupesToggle'),
    markConfusingBtn: documentRef.getElementById('markConfusingBtn'),
    markPacingBtn: documentRef.getElementById('markPacingBtn'),
    markFavoriteBtn: documentRef.getElementById('markFavoriteBtn'),
    exportFeedbackBtn: documentRef.getElementById('exportFeedbackBtn'),
    langToggleBtn: documentRef.getElementById('langToggleBtn')
  };
}

export function setCardText(ui, text) {
  ui.cardText.textContent = text;
}

export function renderCurrentCard(ui, state, fallbackText, formatCard = (text) => text) {
  if (state.historyIndex >= 0 && state.history[state.historyIndex]) {
    setCardText(ui, formatCard(state.history[state.historyIndex]));
    return;
  }

  setCardText(ui, state.lastCard ? formatCard(state.lastCard) : fallbackText);
}

export function renderPlayers(ui, state, onRemovePlayer) {
  ui.playersList.innerHTML = '';

  state.players.forEach((player, index) => {
    const chip = document.createElement('div');
    chip.className = 'chip';

    const label = document.createElement('span');
    label.textContent = player;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'x';
    removeBtn.addEventListener('click', () => onRemovePlayer(index));

    chip.appendChild(label);
    chip.appendChild(removeBtn);
    ui.playersList.appendChild(chip);
  });
}
