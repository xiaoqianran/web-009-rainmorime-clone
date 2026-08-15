// ============================================================
// Game Engine — Core Type Definitions
// ============================================================

// --- Story Phases ---
export type StoryPhase = 'prologue' | 'empty_city' | 'fracture' | 'choice';

// --- Time ---
export type TimePhase = 'dawn' | 'daylight' | 'dusk';

// --- Tone types for dialogue ---
export type ToneType = 'analytical' | 'advisory' | 'empathic' | 'silence';

// --- Dialogue card layers ---
export type CardLayer = 'base' | 'drift' | 'relic' | 'abyss';

// --- Card tone (expanded beyond basic ToneType) ---
export type CardTone =
  | 'analytical' | 'advisory'
  | 'observation' | 'empathic' | 'silence'
  | 'oracle' | 'quote' | 'echo' | 'private' | 'fragment' | 'broken';

// ============================================================
// Scene Script System (for scripted sequences like prologue)
// ============================================================

export interface NarrationNode {
  type: 'narration';
  text: string;
}

export interface SystemNode {
  type: 'system';
  action:
    | 'blackScreen'
    | 'fadeIn'
    | 'fadeOut'
    | 'shake'
    | 'bootSequence'
    | 'rebootSequence'
    | 'delay'
    | 'showHud'
    | 'typewriter'
    | 'flash'
    | 'glitch'
    | 'scanAnimation'
    | 'countdown';
  text?: string;
  duration?: number;
}

export interface DialogueNode {
  type: 'dialogue';
  speaker: 'rainmorime' | 'ranger';
  text: string;
}

export interface MonologueNode {
  type: 'monologue';
  text: string;
}

export interface ChoiceOption {
  id: string;
  tone: ToneType;
  toneLabel: string;
  text: string;
  result: SceneNode[];
  effects: {
    trust?: number;
    flags?: string[];
    morale?: number;
  };
}

export interface ChoiceNode {
  type: 'choice';
  options: ChoiceOption[];
}

export interface TransitionNode {
  type: 'transition';
  effect: 'blackScreen' | 'fadeOut' | 'fadeIn' | 'timeJump';
  duration?: number;
  text?: string;
}

export interface TimedInteractionNode {
  type: 'timedInteraction';
  action: string;
  timeout: number;
  prompt?: string;
  onExecute: SceneNode[];
  onTimeout: SceneNode[];
}

export type SceneNode =
  | NarrationNode
  | SystemNode
  | DialogueNode
  | MonologueNode
  | ChoiceNode
  | TransitionNode
  | TimedInteractionNode;

export interface SceneScript {
  id: string;
  title: string;
  nodes: SceneNode[];
}

// ============================================================
// Dialogue Pool System (for free-form chapters)
// ============================================================

export interface CardGate {
  phase?: StoryPhase[];
  trust_min?: number;
  trust_max?: number;
  requires_relic?: string | null;
  requires_flags?: string[];
  one_time?: boolean;
}

export interface CardEffect {
  trust_delta?: number;
  morale_delta?: number;
  flags_set?: string[];
  flags_remove?: string[];
  pool_inject?: string[];
  pool_remove?: string[];
}

export interface DialogueCard {
  id: string;
  text: string;
  inner?: string;
  layer: CardLayer;
  tone: CardTone;
  weight: number;
  gate: CardGate;
  effect: CardEffect;
  ranger_response: string;
  ranger_response_high_trust?: string;
}

// ============================================================
// Game State
// ============================================================

export interface RangerStats {
  stamina: number;
  morale: number;
  health: number;
}

export interface SaveData {
  version: number;
  timestamp: number;
  state: GameState;
}

export interface GameState {
  trust: number;
  flags: string[];
  phase: StoryPhase;
  day: number;
  timePhase: TimePhase;

  currentScriptId: string;
  currentNodeIndex: number;
  waitingForInput: boolean;

  ranger: RangerStats;

  resources: Record<string, number>;
  relics: string[];

  usedCardIds: string[];
  poolInjectedIds: string[];
  poolRemovedIds: string[];

  dialogueLog: DialogueLogEntry[];

  actionPoints: number;
  maxActionPoints: number;
  playerPosition: { row: number; col: number };
  map: MapTile[][];
  facilities: CabinFacility[];
}

export interface DialogueLogEntry {
  speaker: 'rainmorime' | 'ranger' | 'system' | 'monologue';
  text: string;
  timestamp: number;
}

// ============================================================
// Map System
// ============================================================

export type TerrainType =
  | 'fog'          // ░░ unexplored
  | 'wasteland'    // W· general terrain
  | 'ruins'        // R· ruins
  | 'overgrown'    // G· Green Tide covered
  | 'blank'        // B▪ The Blanks
  | 'base'         // ◆  Ship/base
  | 'echo_city'    // E* Echo City
  | 'highland'     // H· Highland
  | 'tide_margin'; // T· Tide Margin

export interface MapTile {
  terrain: TerrainType;
  explored: boolean;
  label?: string;
  event?: string;
}

export const TERRAIN_DISPLAY: Record<TerrainType, { char: string; color: string }> = {
  fog:         { char: '░░', color: 'var(--ark-primary)' },
  wasteland:   { char: 'W·', color: 'rgba(200,200,200,0.6)' },
  ruins:       { char: 'R·', color: 'rgba(220,220,220,0.7)' },
  overgrown:   { char: 'G·', color: 'rgba(100,160,100,0.6)' },
  blank:       { char: 'B▪', color: 'rgba(255,255,255,0.9)' },
  base:        { char: '◆·', color: 'rgba(255,255,255,1)' },
  echo_city:   { char: 'E*', color: 'rgba(255,255,255,0.8)' },
  highland:    { char: 'H·', color: 'rgba(200,200,200,0.6)' },
  tide_margin: { char: 'T·', color: 'rgba(160,200,160,0.5)' },
};

// ============================================================
// Cabin System
// ============================================================

export type FacilityStatus = 'operational' | 'damaged' | 'unbuilt';

export interface CabinFacility {
  id: string;
  name: string;
  nameEn: string;
  level: number;
  maxLevel: number;
  status: FacilityStatus;
  repairProgress?: number;
  energyCost: number;
  row: number;
  col: number;
}

// ============================================================
// Engine Actions (for reducer)
// ============================================================

export type GameAction =
  | { type: 'ADVANCE' }
  | { type: 'CHOOSE'; optionId: string }
  | { type: 'SET_NODE_INDEX'; index: number }
  | { type: 'SET_WAITING'; waiting: boolean }
  | { type: 'APPLY_EFFECTS'; effects: CardEffect }
  | { type: 'ADD_LOG'; entry: DialogueLogEntry }
  | { type: 'SET_TRUST'; value: number }
  | { type: 'ADD_FLAG'; flag: string }
  | { type: 'ADD_RELIC'; relic: string }
  | { type: 'SET_PHASE'; phase: StoryPhase }
  | { type: 'LOAD_STATE'; state: GameState }
  | { type: 'TRANSITION_TO_SCRIPT'; scriptId: string }
  | { type: 'PLAY_CARD'; card: DialogueCard }
  // Shared primitives
  | { type: 'CONSUME_AP'; amount: number }
  | { type: 'ADD_RESOURCE'; resource: string; amount: number }
  | { type: 'CONSUME_RESOURCE'; resource: string; amount: number }
  | { type: 'UPDATE_RANGER'; deltas: Partial<RangerStats> }
  | { type: 'ADVANCE_TIME' }
  // P3 Map
  | { type: 'MOVE_TO'; row: number; col: number }
  | { type: 'EXPLORE_TILE' }
  // P4 Cabin
  | { type: 'REPAIR_FACILITY'; facilityId: string }
  | { type: 'UPGRADE_FACILITY'; facilityId: string }
  // Phase transitions
  | { type: 'ENTER_FREE_PLAY'; phase: StoryPhase; day: number }
  | { type: 'BATCH'; actions: GameAction[] };

// ============================================================
// Initial State Factory
// ============================================================

function createInitialMap(): MapTile[][] {
  const size = 16;
  const map: MapTile[][] = [];
  for (let r = 0; r < size; r++) {
    map[r] = [];
    for (let c = 0; c < size; c++) {
      map[r][c] = { terrain: 'fog', explored: false };
    }
  }

  const cx = 7, cy = 8;
  map[cy][cx] = { terrain: 'base', explored: true, label: '飞船基地' };

  const near: [number, number, TerrainType, string?][] = [
    [cy - 1, cx, 'wasteland'], [cy + 1, cx, 'wasteland'],
    [cy, cx - 1, 'wasteland'], [cy, cx + 1, 'wasteland'],
    [cy - 1, cx - 1, 'ruins'], [cy - 1, cx + 1, 'tide_margin'],
    [cy + 1, cx - 1, 'highland'], [cy + 1, cx + 1, 'overgrown'],
    [cy - 2, cx, 'ruins'], [cy - 2, cx - 1, 'ruins'],
    [cy - 2, cx + 1, 'echo_city', '回声城'],
    [cy, cx + 2, 'overgrown'], [cy + 1, cx + 2, 'overgrown'],
    [cy, cx - 2, 'blank', '空白地'],
  ];
  for (const [r, c, t, label] of near) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      map[r][c] = { terrain: t, explored: true, label };
    }
  }
  return map;
}

const INITIAL_FACILITIES: CabinFacility[] = [
  { id: 'comm', name: '通讯阵列', nameEn: 'COMM', level: 2, maxLevel: 3, status: 'operational', energyCost: 2, row: 0, col: 0 },
  { id: 'lab', name: '分析室', nameEn: 'LAB', level: 1, maxLevel: 3, status: 'operational', energyCost: 1, row: 0, col: 1 },
  { id: 'fab', name: '制造终端', nameEn: 'FAB', level: 0, maxLevel: 3, status: 'damaged', repairProgress: 0, energyCost: 3, row: 0, col: 2 },
  { id: 'power', name: '能源核心', nameEn: 'PWR', level: 1, maxLevel: 3, status: 'operational', energyCost: 0, row: 1, col: 0 },
  { id: 'water', name: '净水系统', nameEn: 'H₂O', level: 1, maxLevel: 3, status: 'operational', energyCost: 1, row: 1, col: 1 },
  { id: 'data', name: '数据终端', nameEn: 'DATA', level: 0, maxLevel: 3, status: 'damaged', repairProgress: 42, energyCost: 2, row: 1, col: 2 },
];

export function createInitialState(): GameState {
  return {
    trust: 50,
    flags: [],
    phase: 'prologue',
    day: 0,
    timePhase: 'dusk',

    currentScriptId: 'prologue',
    currentNodeIndex: 0,
    waitingForInput: false,

    ranger: {
      stamina: 75,
      morale: 60,
      health: 90,
    },

    resources: {
      energy: 5,
      food: 10,
      water: 8,
      material: 5,
      data: 50,
      bio: 0,
    },

    relics: [],
    usedCardIds: [],
    poolInjectedIds: [],
    poolRemovedIds: [],
    dialogueLog: [],

    actionPoints: 6,
    maxActionPoints: 6,
    playerPosition: { row: 8, col: 7 },
    map: createInitialMap(),
    facilities: INITIAL_FACILITIES,
  };
}
