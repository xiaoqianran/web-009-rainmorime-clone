// ============================================================
// GameHudFrame — Game nav buttons replacing GlobalHud's bottom-right
// Renders only the BR corner; TL/TR/BL are handled by GlobalHud
// ============================================================

import React from 'react';
import styles from '../../../styles/Game.module.scss';
import { UI } from '../../../data/game/strings';

export type NavView = 'map' | 'cabin' | null;

interface GameHudFrameProps {
  activeView: NavView;
  onToggleView: (view: 'map' | 'cabin') => void;
  onOpenLog?: () => void;
  onOpenSettings?: () => void;
  onOpenPause?: () => void;
}

export default function GameHudFrame({
  activeView,
  onToggleView,
  onOpenLog,
  onOpenSettings,
  onOpenPause,
}: GameHudFrameProps) {
  return (
    <div className={styles.gameNavBR}>
      <button
        className={`${styles.hudNavBtn} ${activeView === 'map' ? styles.hudNavBtnActive : ''}`}
        onClick={() => onToggleView('map')}
        title={UI.nav.mapTitle}
      >
        {UI.nav.map}
      </button>
      <button
        className={`${styles.hudNavBtn} ${activeView === 'cabin' ? styles.hudNavBtnActive : ''}`}
        onClick={() => onToggleView('cabin')}
        title={UI.nav.cabinTitle}
      >
        {UI.nav.cabin}
      </button>
      {onOpenLog && (
        <button className={styles.hudNavBtn} onClick={onOpenLog} title={UI.nav.logTitle}>
          {UI.nav.log}
        </button>
      )}
      {onOpenSettings && (
        <button className={styles.hudNavBtn} onClick={onOpenSettings} title={UI.nav.setTitle}>
          {UI.nav.set}
        </button>
      )}
      {onOpenPause && (
        <button className={styles.hudNavBtn} onClick={onOpenPause} title={UI.nav.escTitle}>
          {UI.nav.esc}
        </button>
      )}
    </div>
  );
}
