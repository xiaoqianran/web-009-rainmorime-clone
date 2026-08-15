// ============================================================
// Game Context — Global state management for the game engine
// ============================================================

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import type {
  GameState,
  GameAction,
  SceneNode,
  DialogueLogEntry,
  DialogueCard,
} from './types';
import { createInitialState } from './types';
import {
  getCurrentNode,
  nodeRequiresInput,
  nodeRequiresClick,
  getSystemNodeDuration,
  findChoiceOption,
  applyChoiceEffects,
  isScriptComplete,
  getTotalNodes,
} from './sceneEngine';
import {
  isAdjacent,
  getMoveCost,
  revealFog,
  getExploreYield,
  getUpgradeCost,
  getPowerOutput,
} from './mapHelpers';
import { saveGame } from './saveManager';

// --- Reducer ---

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADVANCE':
      return {
        ...state,
        currentNodeIndex: state.currentNodeIndex + 1,
        waitingForInput: false,
      };

    case 'CHOOSE': {
      const node = getCurrentNode(state);
      if (!node || node.type !== 'choice') return state;
      const option = findChoiceOption(node, action.optionId);
      if (!option) return state;

      const withEffects = applyChoiceEffects(state, option);

      const resultLog: DialogueLogEntry[] = option.result
        .filter((n): n is Extract<SceneNode, { type: 'dialogue' | 'narration' | 'monologue' }> =>
          n.type === 'dialogue' || n.type === 'narration' || n.type === 'monologue'
        )
        .map((n) => ({
          speaker: n.type === 'dialogue' ? n.speaker : n.type === 'monologue' ? 'monologue' : 'system',
          text: n.type === 'dialogue' ? n.text : n.text,
          timestamp: Date.now(),
        }));

      return {
        ...withEffects,
        currentNodeIndex: state.currentNodeIndex + 1,
        waitingForInput: false,
        dialogueLog: [...state.dialogueLog, ...resultLog],
      };
    }

    case 'SET_NODE_INDEX':
      return { ...state, currentNodeIndex: action.index };

    case 'SET_WAITING':
      return { ...state, waitingForInput: action.waiting };

    case 'APPLY_EFFECTS': {
      const e = action.effects;
      let next = { ...state };
      if (e.trust_delta) next.trust = Math.max(0, Math.min(100, state.trust + e.trust_delta));
      if (e.morale_delta) next.ranger = { ...state.ranger, morale: Math.max(0, Math.min(100, state.ranger.morale + e.morale_delta)) };
      if (e.flags_set) {
        const flags = new Set(state.flags);
        e.flags_set.forEach((f) => flags.add(f));
        next.flags = Array.from(flags);
      }
      if (e.flags_remove) {
        next.flags = state.flags.filter((f) => !e.flags_remove!.includes(f));
      }
      if (e.pool_inject) {
        const ids = new Set(state.poolInjectedIds);
        e.pool_inject.forEach((id) => ids.add(id));
        next.poolInjectedIds = Array.from(ids);
      }
      if (e.pool_remove) {
        const ids = new Set(state.poolRemovedIds);
        e.pool_remove.forEach((id) => ids.add(id));
        next.poolRemovedIds = Array.from(ids);
      }
      return next;
    }

    case 'PLAY_CARD': {
      const { card } = action;
      const e = card.effect;
      const now = Date.now();
      let next = { ...state };

      // Apply trust/morale deltas
      if (e.trust_delta) next.trust = Math.max(0, Math.min(100, state.trust + e.trust_delta));
      if (e.morale_delta) next.ranger = { ...state.ranger, morale: Math.max(0, Math.min(100, state.ranger.morale + e.morale_delta)) };

      // Apply flag changes
      if (e.flags_set) {
        const flags = new Set(state.flags);
        e.flags_set.forEach((f) => flags.add(f));
        next.flags = Array.from(flags);
      }
      if (e.flags_remove) {
        next.flags = (next.flags || state.flags).filter((f) => !e.flags_remove!.includes(f));
      }

      // Apply pool mutations
      if (e.pool_inject) {
        const ids = new Set(state.poolInjectedIds);
        e.pool_inject.forEach((id) => ids.add(id));
        next.poolInjectedIds = Array.from(ids);
      }
      if (e.pool_remove) {
        const ids = new Set(state.poolRemovedIds);
        e.pool_remove.forEach((id) => ids.add(id));
        next.poolRemovedIds = Array.from(ids);
      }

      // Mark one-time cards as used
      if (card.gate.one_time) {
        next.usedCardIds = [...state.usedCardIds, card.id];
      }

      // Pick ranger response based on trust threshold
      const response = (next.trust >= 60 && card.ranger_response_high_trust)
        ? card.ranger_response_high_trust
        : card.ranger_response;

      // Append dialogue log entries
      next.dialogueLog = [
        ...state.dialogueLog,
        { speaker: 'rainmorime' as const, text: card.text, timestamp: now },
        { speaker: 'ranger' as const, text: response, timestamp: now + 1 },
      ];

      return next;
    }

    case 'ADD_LOG':
      return { ...state, dialogueLog: [...state.dialogueLog, action.entry] };

    case 'SET_TRUST':
      return { ...state, trust: Math.max(0, Math.min(100, action.value)) };

    case 'ADD_FLAG': {
      if (state.flags.includes(action.flag)) return state;
      return { ...state, flags: [...state.flags, action.flag] };
    }

    case 'ADD_RELIC': {
      if (state.relics.includes(action.relic)) return state;
      return { ...state, relics: [...state.relics, action.relic] };
    }

    case 'SET_PHASE':
      return { ...state, phase: action.phase };

    case 'LOAD_STATE':
      return { ...action.state };

    case 'TRANSITION_TO_SCRIPT':
      return {
        ...state,
        currentScriptId: action.scriptId,
        currentNodeIndex: 0,
        waitingForInput: false,
      };

    case 'ENTER_FREE_PLAY':
      return {
        ...state,
        phase: action.phase,
        day: action.day,
        timePhase: 'dawn',
        actionPoints: state.maxActionPoints,
        currentScriptId: '',
        currentNodeIndex: 0,
        waitingForInput: false,
      };

    // ========== Shared Primitives ==========

    case 'CONSUME_AP':
      return { ...state, actionPoints: Math.max(0, state.actionPoints - action.amount) };

    case 'ADD_RESOURCE':
      return {
        ...state,
        resources: { ...state.resources, [action.resource]: (state.resources[action.resource] ?? 0) + action.amount },
      };

    case 'CONSUME_RESOURCE': {
      const current = state.resources[action.resource] ?? 0;
      if (current < action.amount) return state;
      return {
        ...state,
        resources: { ...state.resources, [action.resource]: current - action.amount },
      };
    }

    case 'UPDATE_RANGER': {
      const r = state.ranger;
      const d = action.deltas;
      const clamp = (v: number) => Math.max(0, Math.min(100, v));
      return {
        ...state,
        ranger: {
          stamina: clamp(r.stamina + (d.stamina ?? 0)),
          morale:  clamp(r.morale + (d.morale ?? 0)),
          health:  clamp(r.health + (d.health ?? 0)),
        },
      };
    }

    case 'ADVANCE_TIME': {
      const { timePhase } = state;
      if (timePhase === 'dawn') {
        return { ...state, timePhase: 'daylight' };
      }
      if (timePhase === 'daylight') {
        return {
          ...state,
          timePhase: 'dusk',
          playerPosition: { row: 8, col: 7 },
        };
      }
      // dusk → dawn: new day settlement
      const powerFacility = state.facilities.find(f => f.id === 'power');
      const energyProduced = getPowerOutput(powerFacility?.status === 'operational' ? powerFacility.level : 0);
      const energyConsumed = state.facilities
        .filter(f => f.status === 'operational')
        .reduce((sum, f) => sum + f.energyCost, 0);

      const nextResources = { ...state.resources };
      nextResources.energy = Math.max(0, (nextResources.energy ?? 0) + energyProduced - energyConsumed);

      const foodAvailable = (nextResources.food ?? 0) >= 1;
      if (foodAvailable) {
        nextResources.food = nextResources.food - 1;
      }

      const healthDelta = foodAvailable ? 0 : -10;
      const r2 = state.ranger;
      const clamp2 = (v: number) => Math.max(0, Math.min(100, v));

      return {
        ...state,
        timePhase: 'dawn' as const,
        day: state.day + 1,
        actionPoints: state.maxActionPoints,
        resources: nextResources,
        ranger: {
          stamina: clamp2(r2.stamina + 20),
          morale: clamp2(r2.morale - 2),
          health: clamp2(r2.health + healthDelta),
        },
      };
    }

    // ========== P3 Map Actions ==========

    case 'MOVE_TO': {
      const target = { row: action.row, col: action.col };
      if (!isAdjacent(state.playerPosition, target)) return state;

      const tile = state.map[action.row]?.[action.col];
      if (!tile) return state;

      const terrain = tile.explored ? tile.terrain : 'fog';
      const cost = terrain === 'fog' ? 1 : getMoveCost(tile.terrain);
      if (state.actionPoints < cost) return state;

      const radius = tile.terrain === 'highland' ? 2 : 1;
      const revealedMap = revealFog(state.map, action.row, action.col, radius);

      return {
        ...state,
        playerPosition: target,
        actionPoints: state.actionPoints - cost,
        map: revealedMap,
      };
    }

    case 'EXPLORE_TILE': {
      if (state.actionPoints < 2) return state;
      const { row, col } = state.playerPosition;
      const tile = state.map[row]?.[col];
      if (!tile || !tile.explored) return state;

      const yields = getExploreYield(tile.terrain);
      const nextResources = { ...state.resources };
      for (const [key, amount] of Object.entries(yields)) {
        nextResources[key] = (nextResources[key] ?? 0) + amount;
      }

      // Clear the tile event if any
      let nextMap = state.map;
      if (tile.event) {
        nextMap = state.map.map(r => r.map(t => ({ ...t })));
        nextMap[row][col] = { ...nextMap[row][col], event: undefined };
      }

      return {
        ...state,
        actionPoints: state.actionPoints - 2,
        resources: nextResources,
        map: nextMap,
      };
    }

    // ========== P4 Cabin Actions ==========

    case 'REPAIR_FACILITY': {
      const idx = state.facilities.findIndex(f => f.id === action.facilityId);
      if (idx === -1) return state;
      const facility = state.facilities[idx];
      if (facility.status !== 'damaged') return state;
      if (state.actionPoints < 2) return state;
      if ((state.resources.material ?? 0) < 5) return state;

      const newProgress = (facility.repairProgress ?? 0) + 34;
      const repaired = newProgress >= 100;

      const nextFacilities = [...state.facilities];
      nextFacilities[idx] = {
        ...facility,
        repairProgress: repaired ? undefined : newProgress,
        status: repaired ? 'operational' : 'damaged',
        level: repaired ? Math.max(facility.level, 1) : facility.level,
      };

      return {
        ...state,
        actionPoints: state.actionPoints - 2,
        resources: { ...state.resources, material: state.resources.material - 5 },
        facilities: nextFacilities,
      };
    }

    case 'UPGRADE_FACILITY': {
      const idx = state.facilities.findIndex(f => f.id === action.facilityId);
      if (idx === -1) return state;
      const facility = state.facilities[idx];
      if (facility.status !== 'operational') return state;
      if (facility.level >= facility.maxLevel) return state;

      const cost = getUpgradeCost(facility.level);
      if (!cost) return state;

      // Check all required resources are available
      for (const [res, amount] of Object.entries(cost)) {
        if ((state.resources[res] ?? 0) < amount) return state;
      }

      const nextResources = { ...state.resources };
      for (const [res, amount] of Object.entries(cost)) {
        nextResources[res] = (nextResources[res] ?? 0) - amount;
      }

      const nextFacilities = [...state.facilities];
      nextFacilities[idx] = { ...facility, level: facility.level + 1 };

      return {
        ...state,
        resources: nextResources,
        facilities: nextFacilities,
      };
    }

    case 'BATCH':
      return action.actions.reduce(gameReducer, state);

    default:
      return state;
  }
}

// --- Context ---

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  currentNode: SceneNode | null;
  advance: () => void;
  choose: (optionId: string) => void;
  isComplete: boolean;
  totalNodes: number;
}

const GameCtx = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

// --- Provider ---

interface GameProviderProps {
  children: React.ReactNode;
  initialState?: GameState;
}

export function GameProvider({ children, initialState }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState ?? createInitialState());
  const stateRef = useRef(state);
  stateRef.current = state;

  const currentNode = useMemo(() => getCurrentNode(state), [state.currentScriptId, state.currentNodeIndex]);
  const isComplete = useMemo(() => isScriptComplete(state), [state.currentScriptId, state.currentNodeIndex]);
  const totalNodes = useMemo(() => getTotalNodes(state.currentScriptId), [state.currentScriptId]);

  const advance = useCallback(() => {
    const node = getCurrentNode(stateRef.current);
    if (!node) return;
    if (nodeRequiresInput(node)) return;

    if (node.type === 'dialogue' || node.type === 'narration' || node.type === 'monologue') {
      dispatch({
        type: 'ADD_LOG',
        entry: {
          speaker: node.type === 'dialogue' ? node.speaker : node.type === 'monologue' ? 'monologue' : 'system',
          text: node.text,
          timestamp: Date.now(),
        },
      });
    }

    dispatch({ type: 'ADVANCE' });
  }, []);

  const choose = useCallback((optionId: string) => {
    dispatch({ type: 'CHOOSE', optionId });
  }, []);

  // Auto-save on scene advancement
  const lastSaveIndex = useRef(-1);
  useEffect(() => {
    if (state.currentNodeIndex > 0 && state.currentNodeIndex !== lastSaveIndex.current) {
      if (state.currentNodeIndex % 5 === 0) {
        lastSaveIndex.current = state.currentNodeIndex;
        saveGame(state).catch(() => {});
      }
    }
  }, [state.currentNodeIndex]);

  const value = useMemo<GameContextValue>(() => ({
    state,
    dispatch,
    currentNode,
    advance,
    choose,
    isComplete,
    totalNodes,
  }), [state, currentNode, advance, choose, isComplete, totalNodes]);

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}
