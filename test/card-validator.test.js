import test from 'node:test';
import assert from 'node:assert/strict';

import { assertValidCards, validateCards } from '../src/card-validator.js';

test('validateCards accepts valid placeholders and structures', () => {
  const errors = validateCards([
    '{A} toma 2 tragos',
    '{A} inicia||RULE||{B} termina',
    '{A} di algo||NEXT||{B} responde'
  ]);

  assert.deepEqual(errors, []);
});

test('validateCards rejects unknown placeholders', () => {
  const errors = validateCards(['{Z} toma']);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /invalid placeholders/);
});

test('validateCards rejects malformed RULE cards', () => {
  const errors = validateCards(['inicio||RULE||medio||RULE||fin']);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /exactly one/);
});

test('validateCards rejects empty NEXT segments', () => {
  const errors = validateCards(['uno||NEXT||||NEXT||tres']);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /empty \|\|NEXT\|\| segments/);
});

test('assertValidCards throws when schema is invalid', () => {
  assert.throws(() => assertValidCards(['{X} nope']), /Invalid card schema/);
});
