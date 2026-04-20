import { CARDS } from './cards.js';
import { assertValidCards } from './card-validator.js';
import { buildPlayableCards, buildWeightedDeck, parseImportedDeckJson } from './deck-tools.js';
import { drawCard, resetDeck } from './game-engine.js';
import { loadState, saveState } from './storage.js';
import { getUI, renderCurrentCard, renderPlayers, setCardText } from './ui.js';

assertValidCards(CARDS);

const I18N = {
  es: {
    subtitle: 'THE GAME', playersHeading: 'Jugadores', deckHeading: 'Mazo', cardLabel: 'CARTA',
    placeholderName: 'Nombre', add: '+ Agregar', clear: 'Reset', copyDeck: 'Copiar JSON',
    exportDeck: 'Exportar JSON', importDeck: 'Importar JSON', safeMode: 'Modo seguro',
    start: 'Empezar', previous: 'Anterior', next: 'Siguiente', resetDeck: 'Reset Mazo',
    defaultCardText: 'Listos?', resetDone: 'Reiniciado', noPlayers: 'Agrega al menos 2 jugadores para empezar.',
    duplicatePlayer: (name) => `"${name}" ya está en la lista.`, copiedDeck: 'JSON del mazo copiado.',
    importedDeck: (count) => `Mazo importado (${count} cartas).`, exportedDeck: 'Archivo del mazo exportado.',
    importFailed: (reason) => `No se pudo importar: ${reason}`,
    safeModeOn: 'Modo seguro activado.', safeModeOff: 'Modo seguro desactivado.',
    cardFallback: 'No hay cartas disponibles',
    ruleMin: 'Duración regla min', ruleMax: 'Duración regla max', reduceDupes: 'Reducir repetidas',
    feedbackHeading: 'Feedback rápido', markConfusing: 'Confusa', markPacing: 'Pacing', markFavorite: 'Favorita',
    exportFeedback: 'Exportar feedback', feedbackSaved: 'Feedback guardado.'
  },
  en: {
    subtitle: 'THE GAME', playersHeading: 'Players', deckHeading: 'Deck', cardLabel: 'CARD',
    placeholderName: 'Name', add: '+ Add', clear: 'Reset', copyDeck: 'Copy JSON',
    exportDeck: 'Export JSON', importDeck: 'Import JSON', safeMode: 'Safe mode',
    start: 'Start', previous: 'Previous', next: 'Next', resetDeck: 'Reset Deck',
    defaultCardText: 'Ready?', resetDone: 'Reset done', noPlayers: 'Add at least 2 players to start.',
    duplicatePlayer: (name) => `"${name}" is already in the list.`, copiedDeck: 'Deck JSON copied.',
    importedDeck: (count) => `Deck imported (${count} cards).`, exportedDeck: 'Deck file exported.',
    importFailed: (reason) => `Import failed: ${reason}`,
    safeModeOn: 'Safe mode enabled.', safeModeOff: 'Safe mode disabled.',
    cardFallback: 'No cards available',
    ruleMin: 'Rule duration min', ruleMax: 'Rule duration max', reduceDupes: 'Reduce duplicates',
    feedbackHeading: 'Quick feedback', markConfusing: 'Confusing', markPacing: 'Pacing', markFavorite: 'Favorite',
    exportFeedback: 'Export feedback', feedbackSaved: 'Feedback saved.'
  }
};

const state = loadState();
state.feedback = state.feedback || [];
state.tuning = state.tuning || { ruleDurationMin: 1, ruleDurationMax: 7, reduceDuplicates: true };
const ui = getUI();

function t(key, ...args) {
  const value = (I18N[state.language] || I18N.es)[key];
  return typeof value === 'function' ? value(...args) : value;
}

function getDeckSource() {
  return state.customCards?.length ? state.customCards : CARDS;
}

function getPlayableCards() {
  const base = buildPlayableCards(getDeckSource(), state.safeMode);
  return buildWeightedDeck(base, state.tuning.reduceDuplicates);
}

function applyLanguage() {
  ui.subtitle.textContent = t('subtitle');
  ui.playersHeading.textContent = t('playersHeading');
  ui.deckHeading.textContent = t('deckHeading');
  ui.cardLabel.textContent = t('cardLabel');
  ui.playerInput.placeholder = t('placeholderName');
  ui.addPlayerBtn.textContent = t('add');
  ui.clearPlayersBtn.textContent = t('clear');
  ui.copyDeckBtn.textContent = t('copyDeck');
  ui.exportDeckBtn.textContent = t('exportDeck');
  ui.importDeckBtn.textContent = t('importDeck');
  ui.safeModeLabel.textContent = t('safeMode');
  ui.ruleMinLabel.textContent = t('ruleMin');
  ui.ruleMaxLabel.textContent = t('ruleMax');
  ui.reduceDupesLabel.textContent = t('reduceDupes');
  ui.feedbackHeading.textContent = t('feedbackHeading');
  ui.markConfusingBtn.textContent = t('markConfusing');
  ui.markPacingBtn.textContent = t('markPacing');
  ui.markFavoriteBtn.textContent = t('markFavorite');
  ui.exportFeedbackBtn.textContent = t('exportFeedback');
  ui.startBtn.textContent = t('start');
  ui.prevBtn.textContent = t('previous');
  ui.nextBtn.textContent = t('next');
  ui.resetBtn.textContent = t('resetDeck');
  ui.langToggleBtn.textContent = state.language === 'es' ? 'EN' : 'ES';
}

function tuningOptions() {
  return {
    ruleDurationMin: Number(state.tuning.ruleDurationMin) || 1,
    ruleDurationMax: Number(state.tuning.ruleDurationMax) || 7
  };
}

function resetGameDeckOnly() {
  state.turnIndex = 0;
  state.pendingCards = [];
  state.history = [];
  state.historyIndex = -1;
  state.activeRules = [];
  resetDeck(state, getPlayableCards());
}

function addFeedback(type) {
  const template = state.history[state.historyIndex] || state.lastCard || null;
  state.feedback.push({ type, template, ts: new Date().toISOString(), players: state.players.length });
  saveState(state);
  setCardText(ui, t('feedbackSaved'));
}

function exportFeedback() {
  const payload = JSON.stringify(state.feedback, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'hoynovoyatomar-feedback.json';
  anchor.click();
  URL.revokeObjectURL(url);
}

function handleDrawCard() {
  if (state.historyIndex < state.history.length - 1) {
    state.historyIndex += 1;
    setCardText(ui, state.history[state.historyIndex]);
    saveState(state);
    return;
  }

  if (state.players.length < 2) {
    setCardText(ui, t('noPlayers'));
    return;
  }

  const result = drawCard(state, state.deck.length ? state.deck : getPlayableCards(), tuningOptions());
  if (result.error) {
    setCardText(ui, t('cardFallback'));
    return;
  }

  setCardText(ui, result.card);
  saveState(state);
}

function addPlayer() {
  const name = ui.playerInput.value.trim();
  if (!name) return;
  const exists = state.players.some((player) => player.toLowerCase() === name.toLowerCase());
  if (exists) {
    setCardText(ui, t('duplicatePlayer', name));
    return;
  }
  state.players.push(name);
  ui.playerInput.value = '';
  saveState(state);
  renderPlayers(ui, state, removePlayer);
}

function removePlayer(index) {
  state.players.splice(index, 1);
  saveState(state);
  renderPlayers(ui, state, removePlayer);
  renderCurrentCard(ui, state, t('defaultCardText'));
}

function clearPlayers() {
  state.players = [];
  state.lastCard = '';
  resetGameDeckOnly();
  saveState(state);
  renderPlayers(ui, state, removePlayer);
  setCardText(ui, t('defaultCardText'));
}

function startGame() {
  if (state.players.length < 2) {
    setCardText(ui, t('noPlayers'));
    return;
  }
  resetGameDeckOnly();
  handleDrawCard();
}

function showPreviousCard() {
  if (state.historyIndex > 0) {
    state.historyIndex -= 1;
    setCardText(ui, state.history[state.historyIndex]);
    saveState(state);
  }
}

function resetGame() {
  resetGameDeckOnly();
  setCardText(ui, t('resetDone'));
  saveState(state);
}

async function copyDeckJson() {
  await navigator.clipboard.writeText(JSON.stringify(getDeckSource(), null, 2));
  setCardText(ui, t('copiedDeck'));
}

function exportDeckJson() {
  const blob = new Blob([JSON.stringify(getDeckSource(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'hoynovoyatomar-deck.json';
  anchor.click();
  URL.revokeObjectURL(url);
  setCardText(ui, t('exportedDeck'));
}

async function importDeckFromFile(file) {
  try {
    const imported = parseImportedDeckJson(await file.text());
    state.customCards = imported;
    resetGame();
    setCardText(ui, t('importedDeck', imported.length));
  } catch (error) {
    setCardText(ui, t('importFailed', error.message));
  }
}

function toggleSafeMode() {
  state.safeMode = ui.safeModeToggle.checked;
  resetGame();
  setCardText(ui, state.safeMode ? t('safeModeOn') : t('safeModeOff'));
}

function toggleLanguage() {
  state.language = state.language === 'es' ? 'en' : 'es';
  applyLanguage();
  renderCurrentCard(ui, state, t('defaultCardText'));
  saveState(state);
}

function updateTuning() {
  const min = Math.max(1, Number(ui.ruleMinInput.value) || 1);
  const max = Math.max(min, Number(ui.ruleMaxInput.value) || min);
  state.tuning.ruleDurationMin = min;
  state.tuning.ruleDurationMax = max;
  state.tuning.reduceDuplicates = ui.reduceDupesToggle.checked;
  ui.ruleMinInput.value = String(min);
  ui.ruleMaxInput.value = String(max);
  resetGame();
}

ui.addPlayerBtn.addEventListener('click', addPlayer);
ui.playerInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    addPlayer();
  }
});
ui.clearPlayersBtn.addEventListener('click', clearPlayers);
ui.startBtn.addEventListener('click', startGame);
ui.prevBtn.addEventListener('click', showPreviousCard);
ui.nextBtn.addEventListener('click', handleDrawCard);
ui.resetBtn.addEventListener('click', resetGame);
ui.copyDeckBtn.addEventListener('click', () => copyDeckJson().catch((error) => setCardText(ui, t('importFailed', error.message))));
ui.exportDeckBtn.addEventListener('click', exportDeckJson);
ui.importDeckBtn.addEventListener('click', () => ui.importDeckInput.click());
ui.importDeckInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  await importDeckFromFile(file);
  ui.importDeckInput.value = '';
});
ui.safeModeToggle.addEventListener('change', toggleSafeMode);
ui.langToggleBtn.addEventListener('click', toggleLanguage);
ui.ruleMinInput.addEventListener('change', updateTuning);
ui.ruleMaxInput.addEventListener('change', updateTuning);
ui.reduceDupesToggle.addEventListener('change', updateTuning);
ui.markConfusingBtn.addEventListener('click', () => addFeedback('confusing'));
ui.markPacingBtn.addEventListener('click', () => addFeedback('pacing'));
ui.markFavoriteBtn.addEventListener('click', () => addFeedback('favorite'));
ui.exportFeedbackBtn.addEventListener('click', exportFeedback);

ui.safeModeToggle.checked = Boolean(state.safeMode);
ui.ruleMinInput.value = String(state.tuning.ruleDurationMin);
ui.ruleMaxInput.value = String(state.tuning.ruleDurationMax);
ui.reduceDupesToggle.checked = Boolean(state.tuning.reduceDuplicates);
applyLanguage();
renderPlayers(ui, state, removePlayer);
renderCurrentCard(ui, state, t('defaultCardText'));
saveState(state);
