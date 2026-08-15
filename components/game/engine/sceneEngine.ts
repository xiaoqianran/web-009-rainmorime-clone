// ============================================================
// Scene Engine — Script processing logic
// ============================================================

import type { SceneNode, SceneScript, ChoiceOption, GameState } from './types';

const scriptRegistry = new Map<string, SceneScript>();

export function registerScript(script: SceneScript): void {
  scriptRegistry.set(script.id, script);
}

export function getScript(id: string): SceneScript | undefined {
  return scriptRegistry.get(id);
}

export function getCurrentNode(state: GameState): SceneNode | null {
  const script = scriptRegistry.get(state.currentScriptId);
  if (!script) return null;
  if (state.currentNodeIndex >= script.nodes.length) return null;
  return script.nodes[state.currentNodeIndex];
}

export function getTotalNodes(scriptId: string): number {
  const script = scriptRegistry.get(scriptId);
  return script?.nodes.length ?? 0;
}

export function isScriptComplete(state: GameState): boolean {
  const total = getTotalNodes(state.currentScriptId);
  if (total === 0) return false;
  return state.currentNodeIndex >= total;
}

export function nodeRequiresInput(node: SceneNode): boolean {
  return node.type === 'choice' || node.type === 'timedInteraction';
}

export function nodeRequiresClick(node: SceneNode): boolean {
  switch (node.type) {
    case 'narration':
    case 'dialogue':
    case 'monologue':
      return true;
    case 'system':
    case 'transition':
    case 'choice':
    case 'timedInteraction':
      return false;
    default:
      return true;
  }
}

export function getSystemNodeDuration(node: SceneNode): number {
  if (node.type !== 'system' && node.type !== 'transition') return 0;

  if (node.type === 'system') {
    if (node.duration) return node.duration;
    switch (node.action) {
      case 'blackScreen': return 500;
      case 'fadeIn': return 800;
      case 'fadeOut': return 800;
      case 'shake': return 600;
      case 'delay': return node.duration ?? 2000;
      case 'flash': return 300;
      case 'glitch': return 1500;
      case 'bootSequence': return 0;
      case 'rebootSequence': return 0;
      case 'typewriter': return 0;
      case 'scanAnimation': return 3000;
      case 'countdown': return 0;
      default: return 1000;
    }
  }

  if (node.type === 'transition') {
    return node.duration ?? 1500;
  }

  return 0;
}

export function findChoiceOption(
  node: SceneNode,
  optionId: string
): ChoiceOption | undefined {
  if (node.type !== 'choice') return undefined;
  return node.options.find((o) => o.id === optionId);
}

export function applyChoiceEffects(
  state: GameState,
  option: ChoiceOption
): GameState {
  const next = { ...state };

  if (option.effects.trust) {
    next.trust = Math.max(0, Math.min(100, state.trust + option.effects.trust));
  }
  if (option.effects.morale) {
    next.ranger = {
      ...state.ranger,
      morale: Math.max(0, Math.min(100, state.ranger.morale + option.effects.morale)),
    };
  }
  if (option.effects.flags) {
    const flagSet = new Set(state.flags);
    option.effects.flags.forEach((f) => flagSet.add(f));
    next.flags = Array.from(flagSet);
  }

  return next;
}
