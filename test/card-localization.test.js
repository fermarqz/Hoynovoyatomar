import test from 'node:test';
import assert from 'node:assert/strict';

import { localizeCard } from '../src/card-localization.js';

test('localizeCard keeps Spanish text unchanged in ES mode', () => {
  assert.equal(localizeCard('{A} toma dos tragos', 'es'), '{A} toma dos tragos');
});

test('localizeCard applies English replacements in EN mode', () => {
  assert.equal(localizeCard('{A} toma dos tragos', 'en'), '{A} take two sips');
});
