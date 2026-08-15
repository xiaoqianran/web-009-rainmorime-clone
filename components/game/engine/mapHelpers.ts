// ============================================================
// Map Helper Functions — pure utilities for map operations
// Used by reducer to keep MOVE_TO / EXPLORE_TILE logic clean
// ============================================================

import type { MapTile, TerrainType } from './types';

const MAP_SIZE = 16;

export function isAdjacent(
  a: { row: number; col: number },
  b: { row: number; col: number },
): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return (dr + dc) === 1;
}

export function getMoveCost(terrain: TerrainType): number {
  switch (terrain) {
    case 'overgrown': return 2;
    case 'highland':  return 2;
    default:          return 1;
  }
}

/**
 * Deep-clone and reveal fog around (row, col).
 * Default radius 1 (self + 4 neighbors). Highland uses radius 2.
 */
export function revealFog(
  map: MapTile[][],
  row: number,
  col: number,
  radius: number = 1,
): MapTile[][] {
  const next = map.map(r => r.map(t => ({ ...t })));
  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      if (Math.abs(dr) + Math.abs(dc) > radius) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < MAP_SIZE && nc >= 0 && nc < MAP_SIZE) {
        next[nr][nc].explored = true;
      }
    }
  }
  return next;
}

/**
 * Deterministic resource yield for exploring a tile.
 * Returns a Record of resource deltas.
 */
export function getExploreYield(terrain: TerrainType): Record<string, number> {
  switch (terrain) {
    case 'ruins':       return { material: 2 };
    case 'overgrown':   return { bio: 1 };
    case 'echo_city':   return { data: 3 };
    case 'wasteland':   return { material: 1 };
    case 'tide_margin': return { bio: 1, material: 1 };
    case 'highland':    return { material: 1 };
    case 'blank':       return { data: 1 };
    default:            return {};
  }
}

/**
 * Upgrade cost table: level → required resources.
 * Returns null if the level cannot be upgraded.
 */
export function getUpgradeCost(currentLevel: number): Record<string, number> | null {
  switch (currentLevel) {
    case 1: return { material: 10, energy: 5 };
    case 2: return { material: 25, energy: 15, data: 5 };
    default: return null;
  }
}

/** Energy production per day based on power facility level. */
export function getPowerOutput(level: number): number {
  switch (level) {
    case 1: return 5;
    case 2: return 8;
    case 3: return 12;
    default: return 0;
  }
}
