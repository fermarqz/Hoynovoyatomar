import { CARDS } from './cards.js';
import { assertValidCards } from './card-validator.js';
import { buildPlayableCards, buildWeightedDeck } from './deck-tools.js';
import { drawCard, resetDeck } from './game-engine.js';
import { localizeCard } from './card-localization.js';
import { loadState, saveState } from './storage.js';
import { getUI, renderCurrentCard, renderPlayers, setCardText } from './ui.js';

assertValidCards(CARDS);

const I18N = {
  es: {
    subtitle: 'THE GAME', playersHeading: 'Jugadores', settingsHeading: 'Ajustes', cardLabel: 'CARTA',
    placeholderName: 'Nombre', add: '+ Agregar', clear: 'Reset', safeMode: 'Modo seguro',
    start: 'Empezar', previous: 'Anterior', next: 'Siguiente', resetDeck: 'Reset Mazo',
    defaultCardText: 'Listos?', resetDone: 'Reiniciado', noPlayers: 'Agrega al menos 2 jugadores para empezar.',
    duplicatePlayer: (name) => `"${name}" ya está en la lista.`, safeModeOn: 'Modo seguro activado.',
    safeModeOff: 'Modo seguro desactivado.', cardFallback: 'No hay cartas disponibles',
    ruleMin: 'Duración regla min', ruleMax: 'Duración regla max', reduceDupes: 'Reducir repetidas',
    feedbackHeading: 'Feedback rápido', markConfusing: 'Confusa', markPacing: 'Pacing', markFavorite: 'Favorita',
    exportFeedback: 'Exportar feedback', feedbackSaved: 'Feedback guardado.',
    settingsHelp: 'Duración regla min/max define cuántas rondas dura una regla temporal (por ejemplo: “ladra”). Modo seguro filtra cartas más intensas. Reducir repetidas baja la frecuencia de cartas duplicadas.'
  },
  en: {
    subtitle: 'THE GAME', playersHeading: 'Players', settingsHeading: 'Settings', cardLabel: 'CARD',
    placeholderName: 'Name', add: '+ Add', clear: 'Reset', safeMode: 'Safe mode',
    start: 'Start', previous: 'Previous', next: 'Next', resetDeck: 'Reset Deck',
    defaultCardText: 'Ready?', resetDone: 'Reset done', noPlayers: 'Add at least 2 players to start.',
    duplicatePlayer: (name) => `"${name}" is already in the list.`, safeModeOn: 'Safe mode enabled.',
    safeModeOff: 'Safe mode disabled.', cardFallback: 'No cards available',
    ruleMin: 'Rule duration min', ruleMax: 'Rule duration max', reduceDupes: 'Reduce duplicates',
    feedbackHeading: 'Quick feedback', markConfusing: 'Confusing', markPacing: 'Pacing', markFavorite: 'Favorite',
    exportFeedback: 'Export feedback', feedbackSaved: 'Feedback saved.',
    settingsHelp: 'Rule duration min/max controls how many turns temporary rules last. Safe mode filters stronger cards. Reduce duplicates lowers repeated prompts.'
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

function showCardText(text) {
  setCardText(ui, localizeCard(text, state.language));
}

function getPlayableCards() {
  const base = buildPlayableCards(CARDS, state.safeMode);
  return buildWeightedDeck(base, state.tuning.reduceDuplicates);
}

function applyLanguage() {
  ui.subtitle.textContent = t('subtitle');
  ui.playersHeading.textContent = t('playersHeading');
  ui.settingsHeading.textContent = t('settingsHeading');
  ui.cardLabel.textContent = t('cardLabel');
  ui.playerInput.placeholder = t('placeholderName');
  ui.addPlayerBtn.textContent = t('add');
  ui.clearPlayersBtn.textContent = t('clear');
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
  ui.settingsHelp.textContent = t('settingsHelp');
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
    showCardText(state.history[state.historyIndex]);
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

  showCardText(result.card);
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
  renderCurrentCard(ui, state, t('defaultCardText'), (text) => localizeCard(text, state.language));
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
    showCardText(state.history[state.historyIndex]);
    saveState(state);
  }
}

function resetGame() {
  resetGameDeckOnly();
  setCardText(ui, t('resetDone'));
  saveState(state);
}

function toggleSafeMode() {
  state.safeMode = ui.safeModeToggle.checked;
  resetGame();
  setCardText(ui, state.safeMode ? t('safeModeOn') : t('safeModeOff'));
}

function toggleLanguage() {
  state.language = state.language === 'es' ? 'en' : 'es';
  applyLanguage();
  renderCurrentCard(ui, state, t('defaultCardText'), (text) => localizeCard(text, state.language));
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
renderCurrentCard(ui, state, t('defaultCardText'), (text) => localizeCard(text, state.language));
saveState(state);
