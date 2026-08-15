// ============================================================
// CabinView — Facility grid with repair/upgrade interactions
// ============================================================

import React, { useState, useCallback } from 'react';
import styles from '../../../styles/Game.module.scss';
import type { GameState, CabinFacility } from '../engine/types';
import { getUpgradeCost } from '../engine/mapHelpers';
import { UI } from '../../../data/game/strings';

interface CabinViewProps {
  state: GameState;
  onAction: (action: string, facilityId?: string) => void;
}

function facilityStatusLabel(f: CabinFacility): string {
  if (f.status === 'unbuilt') return UI.cabin.unbuilt;
  if (f.status === 'damaged') {
    return f.repairProgress != null ? UI.cabin.repairProgress(f.repairProgress) : UI.cabin.damaged;
  }
  return UI.cabin.level(f.level);
}

function costLabel(f: CabinFacility): string | null {
  if (f.status === 'damaged') return UI.cabin.repairCost;
  if (f.status === 'operational' && f.level < f.maxLevel) {
    const cost = getUpgradeCost(f.level);
    if (!cost) return null;
    const parts = Object.entries(cost).map(([k, v]) => `${v}${k}`);
    return UI.cabin.upgradeCost(parts.join(' + '));
  }
  return null;
}

export default function CabinView({ state, onAction }: CabinViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { facilities, resources, actionPoints } = state;

  const handleClick = useCallback((f: CabinFacility) => {
    if (f.status === 'damaged') {
      onAction('repair', f.id);
      setSelectedId(f.id);
      return;
    }
    if (f.status === 'operational' && f.level < f.maxLevel) {
      onAction('upgrade', f.id);
      setSelectedId(f.id);
      return;
    }
    setSelectedId(prev => prev === f.id ? null : f.id);
  }, [onAction]);

  const selectedFacility = facilities.find(f => f.id === selectedId);

  return (
    <div className={styles.cabinViewCompact}>
      <div className={styles.cabinGrid}>
        {facilities.map((f) => {
          const hint = costLabel(f);
          return (
            <button
              key={f.id}
              className={`
                ${styles.facilityBlock}
                ${f.status === 'operational' ? styles.facilityOperational : ''}
                ${f.status === 'damaged' ? styles.facilityDamaged : ''}
                ${f.status === 'unbuilt' ? styles.facilityUnbuilt : ''}
                ${selectedId === f.id ? styles.facilitySelected : ''}
              `}
              style={{ gridRow: f.row + 1, gridColumn: f.col + 1 }}
              onClick={() => handleClick(f)}
              title={hint ?? undefined}
            >
              <span className={styles.facilityName}>{f.name}</span>
              <span className={styles.facilityStatus}>{facilityStatusLabel(f)}</span>
              {hint && <span className={styles.facilityCost}>{hint}</span>}
            </button>
          );
        })}

        <div className={styles.cabinConnections}>
          {facilities.map((f) => {
            const right = facilities.find(g => g.row === f.row && g.col === f.col + 1);
            const below = facilities.find(g => g.row === f.row + 1 && g.col === f.col);
            return (
              <React.Fragment key={`conn-${f.id}`}>
                {right && (
                  <div
                    className={styles.cabinLineH}
                    style={{ gridRow: f.row + 1, gridColumn: f.col + 1 }}
                  />
                )}
                {below && (
                  <div
                    className={styles.cabinLineV}
                    style={{ gridRow: f.row + 1, gridColumn: f.col + 1 }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
