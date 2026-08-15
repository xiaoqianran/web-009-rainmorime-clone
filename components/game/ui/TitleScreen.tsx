// ============================================================
// TitleScreen — Main menu with loading-animation-style logo
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import styles from '../../../styles/Game.module.scss';
import { hasSave } from '../engine/saveManager';
import { UI } from '../../../data/game/strings';

export type MenuAction = 'new_game' | 'continue' | 'settings' | 'about' | 'exit';

interface TitleScreenProps {
  onAction: (action: MenuAction) => void;
}

const TITLE_CHARS = UI.title.logoChars.split('');
const SUBTITLE = UI.title.subtitle;

export default function TitleScreen({ onAction }: TitleScreenProps) {
  const [saveExists, setSaveExists] = useState(false);
  const [phase, setPhase] = useState<'boot' | 'logo' | 'menu'>('boot');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    hasSave().then(setSaveExists).catch(() => {});
    const t1 = setTimeout(() => setPhase('logo'), 400);
    const t2 = setTimeout(() => setPhase('menu'), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleAction = useCallback((action: MenuAction) => {
    if (action === 'about') { setShowAbout(true); return; }
    onAction(action);
  }, [onAction]);

  if (showAbout) {
    return (
      <div className={styles.titleRoot}>
        <div className={styles.aboutPanel}>
          <div className={styles.aboutHeader}>{UI.title.aboutHeader}</div>
          <div className={styles.aboutBody}>
            <p className={styles.aboutTitle}>{UI.title.aboutTitle}</p>
            <p className={styles.aboutVersion}>{UI.title.aboutVersion}</p>
            <div className={styles.aboutDivider} />
            <p className={styles.aboutLine}>{UI.title.aboutGenre}</p>
            <p className={styles.aboutLine}>{UI.title.aboutTagline}</p>
            <div className={styles.aboutDivider} />
            <p className={styles.aboutLine}>{UI.title.aboutCredits}</p>
            <p className={styles.aboutLine}>{UI.title.aboutEngine}</p>
            <div className={styles.aboutDivider} />
            <p className={styles.aboutCredit}>{UI.title.aboutLore}</p>
          </div>
          <button className={styles.aboutBack} onClick={() => setShowAbout(false)}>
            {UI.title.aboutBack}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.titleRoot}>
      {/* Center logo area — matches loading animation */}
      <div className={styles.logoArea}>
        <h1 className={styles.logoTitle}>
          {TITLE_CHARS.map((char, i) => (
            <span key={i} className={styles.charWrap}>
              <span
                className={`${styles.charInner} ${phase !== 'boot' ? styles.charVisible : ''}`}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                {char}
              </span>
            </span>
          ))}
        </h1>
        <div className={`${styles.logoSubtitle} ${phase !== 'boot' ? styles.logoSubtitleVisible : ''}`}>
          {SUBTITLE}
        </div>
      </div>

      {/* Left-side menu */}
      <nav className={`${styles.titleMenuLeft} ${phase === 'menu' ? styles.titleMenuLeftVisible : ''}`}>
        {saveExists && (
          <MenuBtn label={UI.title.continueBtn} hovered={hoveredItem === 'continue'}
            onHover={() => setHoveredItem('continue')} onLeave={() => setHoveredItem(null)}
            onClick={() => handleAction('continue')} idx={0} />
        )}
        <MenuBtn label={UI.title.newGame} hovered={hoveredItem === 'new_game'}
          onHover={() => setHoveredItem('new_game')} onLeave={() => setHoveredItem(null)}
          onClick={() => handleAction('new_game')} idx={saveExists ? 1 : 0} />
        <MenuBtn label={UI.title.settings} hovered={hoveredItem === 'settings'}
          onHover={() => setHoveredItem('settings')} onLeave={() => setHoveredItem(null)}
          onClick={() => handleAction('settings')} idx={saveExists ? 2 : 1} />
        <MenuBtn label={UI.title.about} hovered={hoveredItem === 'about'}
          onHover={() => setHoveredItem('about')} onLeave={() => setHoveredItem(null)}
          onClick={() => handleAction('about')} idx={saveExists ? 3 : 2} />
        <MenuBtn label={UI.title.exit} hovered={hoveredItem === 'exit'}
          onHover={() => setHoveredItem('exit')} onLeave={() => setHoveredItem(null)}
          onClick={() => handleAction('exit')} idx={saveExists ? 4 : 3} />
      </nav>

      {/* Bottom info */}
      <div className={styles.titleFooter}>
        <span>{UI.title.footerDay}</span>
        <span>{UI.title.footerSignal}</span>
      </div>
    </div>
  );
}

function MenuBtn({ label, hovered, onHover, onLeave, onClick, idx }: {
  label: string; hovered: boolean;
  onHover: () => void; onLeave: () => void; onClick: () => void; idx: number;
}) {
  return (
    <button
      className={`${styles.menuItem} ${hovered ? styles.menuItemHovered : ''}`}
      style={{ animationDelay: `${idx * 100}ms` }}
      onMouseEnter={onHover} onMouseLeave={onLeave} onClick={onClick}
    >
      <span className={styles.menuItemLabel}>{label}</span>
    </button>
  );
}
