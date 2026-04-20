const ALLOWED_PLACEHOLDERS = new Set(['{A}', '{B}', '{C}', '{D}', '{random}', '{all}']);
const PLACEHOLDER_REGEX = /\{[^}]+\}/g;

function findInvalidPlaceholders(card) {
  const placeholders = card.match(PLACEHOLDER_REGEX) || [];
  return placeholders.filter((token) => !ALLOWED_PLACEHOLDERS.has(token));
}

function validateRuleStructure(card) {
  if (!card.includes('||RULE||')) return null;

  const parts = card.split('||RULE||');
  if (parts.length !== 2) {
    return 'must contain exactly one ||RULE|| separator';
  }

  const [start, end] = parts.map((part) => part.trim());
  if (!start || !end) {
    return 'must have non-empty text on both sides of ||RULE||';
  }

  return null;
}

function validateNextStructure(card) {
  if (!card.includes('||NEXT||')) return null;

  const parts = card.split('||NEXT||').map((part) => part.trim());
  const hasEmpty = parts.some((part) => !part);

  if (hasEmpty) {
    return 'cannot contain empty ||NEXT|| segments';
  }

  return null;
}

export function validateCards(cards) {
  const errors = [];

  cards.forEach((card, index) => {
    const invalidPlaceholders = findInvalidPlaceholders(card);
    if (invalidPlaceholders.length) {
      errors.push(`Card ${index + 1}: invalid placeholders ${invalidPlaceholders.join(', ')}`);
    }

    const ruleError = validateRuleStructure(card);
    if (ruleError) {
      errors.push(`Card ${index + 1}: ${ruleError}`);
    }

    const nextError = validateNextStructure(card);
    if (nextError) {
      errors.push(`Card ${index + 1}: ${nextError}`);
    }
  });

  return errors;
}

export function assertValidCards(cards) {
  const errors = validateCards(cards);

  if (errors.length) {
    const message = ['Invalid card schema:', ...errors].join('\n- ');
    throw new Error(message);
  }
}

export { ALLOWED_PLACEHOLDERS };
