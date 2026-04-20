export const STORAGE_KEYS = {
  players: 'dg_players',
  deck: 'dg_deck',
  lastCard: 'dg_lastCard',
  turnIndex: 'dg_turnIndex',
  pendingCards: 'dg_pendingCards',
  history: 'dg_history',
  historyIndex: 'dg_historyIndex',
  activeRules: 'dg_activeRules',
  customCards: 'dg_customCards',
  safeMode: 'dg_safeMode',
  language: 'dg_language',
  feedback: 'dg_feedback',
  tuning: 'dg_tuning'
};

const DEFAULT_TUNING = {
  ruleDurationMin: 1,
  ruleDurationMax: 7,
  reduceDuplicates: true
};

export function loadState(storage = localStorage) {
  return {
    players: JSON.parse(storage.getItem(STORAGE_KEYS.players) || '[]'),
    deck: JSON.parse(storage.getItem(STORAGE_KEYS.deck) || '[]'),
    lastCard: storage.getItem(STORAGE_KEYS.lastCard) || '',
    turnIndex: Number(storage.getItem(STORAGE_KEYS.turnIndex) || '0'),
    pendingCards: JSON.parse(storage.getItem(STORAGE_KEYS.pendingCards) || '[]'),
    history: JSON.parse(storage.getItem(STORAGE_KEYS.history) || '[]'),
    historyIndex: Number(storage.getItem(STORAGE_KEYS.historyIndex) || '-1'),
    activeRules: JSON.parse(storage.getItem(STORAGE_KEYS.activeRules) || '[]'),
    customCards: JSON.parse(storage.getItem(STORAGE_KEYS.customCards) || 'null'),
    safeMode: storage.getItem(STORAGE_KEYS.safeMode) === 'true',
    language: storage.getItem(STORAGE_KEYS.language) || 'es',
    feedback: JSON.parse(storage.getItem(STORAGE_KEYS.feedback) || '[]'),
    tuning: { ...DEFAULT_TUNING, ...(JSON.parse(storage.getItem(STORAGE_KEYS.tuning) || '{}')) }
  };
}

export function saveState(state, storage = localStorage) {
  storage.setItem(STORAGE_KEYS.players, JSON.stringify(state.players));
  storage.setItem(STORAGE_KEYS.deck, JSON.stringify(state.deck));
  storage.setItem(STORAGE_KEYS.lastCard, state.lastCard || '');
  storage.setItem(STORAGE_KEYS.turnIndex, String(state.turnIndex || 0));
  storage.setItem(STORAGE_KEYS.pendingCards, JSON.stringify(state.pendingCards));
  storage.setItem(STORAGE_KEYS.history, JSON.stringify(state.history));
  storage.setItem(STORAGE_KEYS.historyIndex, String(state.historyIndex ?? -1));
  storage.setItem(STORAGE_KEYS.activeRules, JSON.stringify(state.activeRules));
  storage.setItem(STORAGE_KEYS.customCards, JSON.stringify(state.customCards));
  storage.setItem(STORAGE_KEYS.safeMode, String(Boolean(state.safeMode)));
  storage.setItem(STORAGE_KEYS.language, state.language || 'es');
  storage.setItem(STORAGE_KEYS.feedback, JSON.stringify(state.feedback || []));
  storage.setItem(STORAGE_KEYS.tuning, JSON.stringify(state.tuning || DEFAULT_TUNING));
}
