import test from 'node:test';
import assert from 'node:assert/strict';

import { buildPlayableCards, buildWeightedDeck, isSafeCard, parseImportedDeckJson } from '../src/deck-tools.js';

test('isSafeCard detects unsafe keyword patterns', () => {
  assert.equal(isSafeCard('{A} toma un shot'), false);
  assert.equal(isSafeCard('{A} toma dos tragos'), true);
});

test('buildPlayableCards filters unsafe cards in safe mode', () => {
  const cards = ['{A} toma dos tragos', '{A} tómate un shot'];
  const result = buildPlayableCards(cards, true);
  assert.deepEqual(result, ['{A} toma dos tragos']);
});

test('buildPlayableCards falls back to original deck if all cards are filtered', () => {
  const cards = ['shot', 'DM a tu crush'];
  const result = buildPlayableCards(cards, true);
  assert.deepEqual(result, cards);
});

test('parseImportedDeckJson parses and validates deck JSON', () => {
  const deck = parseImportedDeckJson(JSON.stringify(['{A} hola', '{A} x||NEXT||{B} y']));
  assert.equal(deck.length, 2);
});

test('parseImportedDeckJson rejects invalid JSON schema', () => {
  assert.throws(() => parseImportedDeckJson(JSON.stringify({ deck: [] })), /array of strings/);
});


test('buildWeightedDeck keeps card count and values', () => {
  const cards = ['a', 'a', 'b', 'c'];
  const weighted = buildWeightedDeck(cards, true);
  assert.equal(weighted.length, cards.length);
  assert.deepEqual([...weighted].sort(), [...cards].sort());
});
