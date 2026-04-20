export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function splitCardChain(template) {
  return template
    .split('||NEXT||')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseRuleCard(template, options = {}) {
  if (!template.includes('||RULE||')) return null;

  const parts = template
    .split('||RULE||')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) return null;

  return {
    start: parts[0],
    end: parts[1],
    duration: randomInt(options.ruleDurationMin ?? 1, options.ruleDurationMax ?? 7)
  };
}

export function pickRandomPlayer(players, exclude = []) {
  const pool = players.filter((player) => !exclude.includes(player));
  if (!pool.length) return players[0] || 'Jugador';
  return pool[Math.floor(Math.random() * pool.length)];
}

export function resolveCard(template, players, turnIndex) {
  const currentPlayer = players.length ? players[turnIndex % players.length] : 'Jugador';

  const A = currentPlayer;
  let B = players.length > 1 ? pickRandomPlayer(players, [A]) : A;

  if (template.includes('{B}') && !template.includes('{A}')) {
    B = currentPlayer;
  }

  const random = pickRandomPlayer(players);
  const C = players.length > 2
    ? pickRandomPlayer(players, [A, B])
    : pickRandomPlayer(players, [A]);
  const D = players.length > 3
    ? pickRandomPlayer(players, [A, B, C])
    : pickRandomPlayer(players, [A, B]);
  const all = players.join(', ');

  return template
    .replaceAll('{A}', A)
    .replaceAll('{B}', B)
    .replaceAll('{C}', C)
    .replaceAll('{D}', D)
    .replaceAll('{random}', random)
    .replaceAll('{all}', all);
}

export function processActiveRules(state) {
  const dueCards = [];

  state.activeRules = state.activeRules
    .map((rule) => ({ ...rule, remaining: rule.remaining - 1 }))
    .filter((rule) => {
      if (rule.remaining <= 0) {
        dueCards.push(rule.end);
        return false;
      }
      return true;
    });

  if (dueCards.length) {
    state.pendingCards.unshift(...dueCards.reverse());
  }

  return dueCards;
}

export function pushHistory(state, card) {
  if (state.historyIndex < state.history.length - 1) {
    state.history = state.history.slice(0, state.historyIndex + 1);
  }
  state.history.push(card);
  state.historyIndex = state.history.length - 1;
}

export function resetDeck(state, cards) {
  state.deck = shuffle(cards);
  state.pendingCards = [];
  state.activeRules = [];
}

export function drawCard(state, cards, options = {}) {
  if (!state.players.length) {
    return { error: 'Agrega jugadores primero', card: null, template: null };
  }

  processActiveRules(state);

  let template;
  if (state.pendingCards.length) {
    template = state.pendingCards.shift();
  } else {
    if (!state.deck.length) resetDeck(state, cards);

    const rawTemplate = state.deck.shift();
    const ruleCard = parseRuleCard(rawTemplate, options);

    if (ruleCard) {
      template = ruleCard.start;
      state.activeRules.push({
        end: ruleCard.end,
        remaining: ruleCard.duration
      });
    } else {
      const chain = splitCardChain(rawTemplate);
      template = chain.shift();
      if (chain.length) {
        state.pendingCards.push(...chain);
      }
    }
  }

  if (!template) {
    return { error: 'No hay cartas disponibles', card: null, template: null };
  }

  const resolved = resolveCard(template, state.players, state.turnIndex);
  state.lastCard = resolved;
  pushHistory(state, resolved);
  state.turnIndex += 1;

  return { error: null, card: resolved, template };
}
