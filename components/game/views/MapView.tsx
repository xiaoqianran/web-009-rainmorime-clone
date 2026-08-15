// ============================================================
// MapView — 16x16 grid with player position, click-to-move, click-to-search
// ============================================================

import React, { useState, useCallback } from 'react';
import styles from '../../../styles/Game.module.scss';
import type { GameState, TerrainType } from '../engine/types';
import { TERRAIN_DISPLAY } from '../engine/types';
import { isAdjacent, getMoveCost } from '../engine/mapHelpers';
import { UI } from '../../../data/game/strings';

interface MapViewProps {
  state: GameState;
  onAction: (action: string, payload?: any) => void;
}

export default function MapView({ state, onAction }: MapViewProps) {
  const [selectedTile, setSelectedTile] = useState<{ r: number; c: number } | null>(null);
  const { map, playerPosition, actionPoints } = state;

  const handleTileClick = useCallback((r: number, c: number) => {
    const tile = map[r]?.[c];
    if (!tile) return;

    // Click on current position → search
    if (r === playerPosition.row && c === playerPosition.col) {
      onAction('search');
      return;
    }

    // Click adjacent tile (explored or fog) → move
    if (isAdjacent(playerPosition, { row: r, col: c })) {
      onAction('move', { row: r, col: c });
      return;
    }

    // Click any explored tile → select for info
    if (tile.explored) {
      setSelectedTile({ r, c });
    }
  }, [map, playerPosition, onAction]);

  const sel = selectedTile ? map[selectedTile.r]?.[selectedTile.c] : null;
  const isPlayer = (r: number, c: number) => r === playerPosition.row && c === playerPosition.col;
  const isMovable = (r: number, c: number) => isAdjacent(playerPosition, { row: r, col: c });

  return (
    <div className={styles.mapViewCompact}>
      <div className={styles.mapGrid}>
        {map.map((row, r) =>
          row.map((tile, c) => {
            const player = isPlayer(r, c);
            const movable = isMovable(r, c);
            const cost = tile.explored ? getMoveCost(tile.terrain) : 1;
            const canAfford = actionPoints >= cost;

            return (
              <button
                key={`${r}-${c}`}
                className={`
                  ${styles.mapTile}
                  ${tile.explored ? styles.mapTileExplored : ''}
                  ${tile.terrain === 'overgrown' && tile.explored ? styles.mapTileOvergrown : ''}
                  ${tile.terrain === 'base' ? styles.mapTileBase : ''}
                  ${player ? styles.mapTilePlayer : ''}
                  ${movable && canAfford ? styles.mapTileMovable : ''}
                  ${selectedTile?.r === r && selectedTile?.c === c ? styles.mapTileSelected : ''}
                `}
                style={tile.explored ? { color: TERRAIN_DISPLAY[tile.terrain].color } : undefined}
                onClick={() => handleTileClick(r, c)}
                disabled={!tile.explored && !movable}
                title={
                  player ? UI.map.currentTile
                    : movable ? UI.map.moveCost(cost)
                    : tile.label || ''
                }
              >
                {player ? '▣·' : tile.explored ? TERRAIN_DISPLAY[tile.terrain].char : movable ? '··' : '░░'}
              </button>
            );
          })
        )}
      </div>

      {sel && sel.label && (
        <div className={styles.mapTileInfo}>
          {TERRAIN_DISPLAY[sel.terrain].char} {sel.label}
        </div>
      )}
    </div>
  );
}
