// ============================================================
// Dialogue Pool Engine — gate filtering + weighted sampling + hand generation
// Used for free-form chapters (post-prologue)
// ============================================================

import type { DialogueCard, GameState } from './types';

/**
 * Filter cards by their gate conditions against current game state.
 * A card passes if ALL non-undefined gate fields are satisfied.
 */
export function filterByGate(cards: DialogueCard[], state: GameState): DialogueCard[] {
  return cards.filter((card) => {
    // Force-removed by a previous card effect
    if (state.poolRemovedIds.includes(card.id)) return false;

    // Force-injected bypasses all gate checks
    if (state.poolInjectedIds.includes(card.id)) return true;

    const g = card.gate;

    if (g.phase && g.phase.length > 0 && !g.phase.includes(state.phase)) {
      return false;
    }

    if (g.trust_min !== undefined && state.trust < g.trust_min) {
      return false;
    }

    if (g.trust_max !== undefined && state.trust > g.trust_max) {
      return false;
    }

    if (g.requires_relic && !state.relics.includes(g.requires_relic)) {
      return false;
    }

    if (g.requires_flags && g.requires_flags.length > 0) {
      if (!g.requires_flags.every((f) => state.flags.includes(f))) {
        return false;
      }
    }

    if (g.one_time && state.usedCardIds.includes(card.id)) {
      return false;
    }

    return true;
  });
}

/**
 * Weighted random sampling without replacement.
 * Uses cumulative distribution — picks `count` unique cards.
 */
export function weightedSample(cards: DialogueCard[], count: number): DialogueCard[] {
  if (cards.length === 0) return [];
  if (cards.length <= count) return [...cards];

  const pool = cards.map((c) => ({ card: c, weight: Math.max(c.weight, 0.1) }));
  const result: DialogueCard[] = [];

  for (let i = 0; i < count && pool.length > 0; i++) {
    const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
    let roll = Math.random() * totalWeight;

    let picked = pool.length - 1;
    for (let j = 0; j < pool.length; j++) {
      roll -= pool[j].weight;
      if (roll <= 0) {
        picked = j;
        break;
      }
    }

    result.push(pool[picked].card);
    pool.splice(picked, 1);
  }

  return result;
}

/**
 * Draw a hand: filter eligible cards then sample from them.
 */
export function drawHand(
  allCards: DialogueCard[],
  state: GameState,
  handSize: number = 3,
): DialogueCard[] {
  const eligible = filterByGate(allCards, state);
  return weightedSample(eligible, handSize);
}
