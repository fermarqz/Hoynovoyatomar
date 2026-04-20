import { assertValidCards } from './card-validator.js';

const UNSAFE_PATTERNS = [
  /\bshot\b/i,
  /fondea|fondeate|fondear/i,
  /\bb[aá]jate\b/i,
  /\bdm\b/i,
  /crush/i,
  /search history/i,
  /gallery/i,
  /arrestado/i
];

export function isSafeCard(card) {
  return !UNSAFE_PATTERNS.some((pattern) => pattern.test(card));
}

export function buildPlayableCards(cards, safeMode = false) {
  if (!safeMode) return [...cards];

  const filtered = cards.filter(isSafeCard);
  return filtered.length ? filtered : [...cards];
}

export function buildWeightedDeck(cards, reduceDuplicates = true) {
  if (!reduceDuplicates) return [...cards];

  const counts = cards.reduce((acc, card) => {
    acc.set(card, (acc.get(card) || 0) + 1);
    return acc;
  }, new Map());

  return [...cards]
    .map((card) => ({ card, score: Math.random() / (counts.get(card) || 1) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.card);
}

export function parseImportedDeckJson(jsonText) {
  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === 'string')) {
    throw new Error('Deck JSON must be an array of strings.');
  }

  assertValidCards(parsed);
  return parsed;
}
