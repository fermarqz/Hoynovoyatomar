import test from 'node:test';
import assert from 'node:assert/strict';

import {
  processActiveRules,
  parseRuleCard,
  resolveCard,
  resetDeck,
  shuffle,
  splitCardChain,
  drawCard
} from '../src/game-engine.js';

test('splitCardChain splits and trims multi-part cards', () => {
  const chain = splitCardChain('A ||NEXT|| B ||NEXT||  C  ');
  assert.deepEqual(chain, ['A', 'B', 'C']);
});

test('parseRuleCard returns start/end with bounded duration', () => {
  const parsed = parseRuleCard('Empieza regla||RULE||Termina regla');
  assert.ok(parsed);
  assert.equal(parsed.start, 'Empieza regla');
  assert.equal(parsed.end, 'Termina regla');
  assert.ok(parsed.duration >= 1 && parsed.duration <= 7);
});

test('parseRuleCard returns null when rule marker is absent', () => {
  assert.equal(parseRuleCard('Carta normal'), null);
});

test('resolveCard replaces {A} with current player', () => {
  const result = resolveCard('{A} toma dos tragos', ['Ana', 'Beto'], 1);
  assert.equal(result, 'Beto toma dos tragos');
});

test('resolveCard handles {B} without {A} using current player', () => {
  const result = resolveCard('{B} elige una canción', ['Ana', 'Beto', 'Cata'], 2);
  assert.equal(result, 'Cata elige una canción');
});

test('processActiveRules decrements and queues finished rule end cards', () => {
  const state = {
    activeRules: [
      { end: 'ya puedes parar', remaining: 1 },
      { end: 'otra regla', remaining: 2 }
    ],
    pendingCards: ['normal']
  };

  const due = processActiveRules(state);

  assert.deepEqual(due, ['ya puedes parar']);
  assert.deepEqual(state.pendingCards, ['ya puedes parar', 'normal']);
  assert.deepEqual(state.activeRules, [{ end: 'otra regla', remaining: 1 }]);
});

test('shuffle keeps same items and length', () => {
  const source = ['a', 'b', 'c', 'd', 'e'];
  const shuffled = shuffle(source);

  assert.equal(shuffled.length, source.length);
  assert.deepEqual([...shuffled].sort(), [...source].sort());
  assert.notEqual(shuffled, source, 'shuffle should return a new array reference');
});

test('resetDeck loads shuffled deck and clears transient queues', () => {
  const state = {
    deck: [],
    pendingCards: ['x'],
    activeRules: [{ end: 'y', remaining: 1 }]
  };
  const cards = ['c1', 'c2', 'c3'];

  resetDeck(state, cards);

  assert.equal(state.deck.length, 3);
  assert.deepEqual([...state.deck].sort(), [...cards].sort());
  assert.deepEqual(state.pendingCards, []);
  assert.deepEqual(state.activeRules, []);
});


test('parseRuleCard respects configured duration bounds', () => {
  const parsed = parseRuleCard('A||RULE||B', { ruleDurationMin: 3, ruleDurationMax: 3 });
  assert.equal(parsed.duration, 3);
});

test('drawCard returns source template used', () => {
  const state = {
    players: ['Ana', 'Beto'],
    deck: ['{A} hola'],
    lastCard: '',
    turnIndex: 0,
    pendingCards: [],
    history: [],
    historyIndex: -1,
    activeRules: []
  };
  const result = drawCard(state, ['{A} hola']);
  assert.equal(result.template, '{A} hola');
});
