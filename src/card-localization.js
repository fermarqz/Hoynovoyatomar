const REPLACEMENTS = [
  [/toma cinco tragos/gi, 'take five sips'],
  [/toma tres tragos/gi, 'take three sips'],
  [/toma dos tragos/gi, 'take two sips'],
  [/toma un shot/gi, 'take a shot'],
  [/tómate un shot/gi, 'take a shot'],
  [/reparte cinco tragos/gi, 'give out five sips'],
  [/reparte tres tragos/gi, 'give out three sips'],
  [/todos/gi, 'everyone'],
  [/jugador/gi, 'player'],
  [/pregunta/gi, 'question'],
  [/verdad o reto/gi, 'truth or dare'],
  [/izquierda/gi, 'left'],
  [/derecha/gi, 'right'],
  [/si fallas/gi, 'if you fail'],
  [/si no/gi, 'if not'],
  [/empieza/gi, 'starts'],
  [/tema:/gi, 'topic:'],
  [/agua|waterfall/gi, 'waterfall']
];

export function localizeCard(template, language) {
  if (language !== 'en') return template;

  return REPLACEMENTS.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), template);
}
