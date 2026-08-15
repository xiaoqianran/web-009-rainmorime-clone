// ============================================================
// DialogueHistory — Slide-out panel showing past dialogue
// ============================================================

import React, { useRef, useEffect } from 'react';
import styles from '../../../styles/Game.module.scss';
import { useGame } from '../engine/GameContext';
import { SPEAKER, UI } from '../../../data/game/strings';

interface DialogueHistoryProps {
  open: boolean;
  onClose: () => void;
}

export default function DialogueHistory({ open, onClose }: DialogueHistoryProps) {
  const { state } = useGame();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, state.dialogueLog.length]);

  return (
    <>
      {open && <div className={styles.historyBackdrop} onClick={onClose} />}
      <div className={`${styles.historyPanel} ${open ? styles.historyOpen : ''}`}>
        <div className={styles.historyHeader}>
          <span>{UI.history.header}</span>
          <span className={styles.historyCount}>{UI.history.entries(state.dialogueLog.length)}</span>
          <button className={styles.historyClose} onClick={onClose}>×</button>
        </div>

        <div className={styles.historyBody}>
          {state.dialogueLog.length === 0 && (
            <div className={styles.historyEmpty}>{UI.history.empty}</div>
          )}

          {state.dialogueLog.map((entry, i) => (
            <div
              key={i}
              className={`${styles.historyEntry} ${
                entry.speaker === 'monologue' ? styles.historyEntryMonologue : ''
              }`}
            >
              <span className={styles.historySpeaker}>
                [{SPEAKER[entry.speaker as keyof typeof SPEAKER] ?? entry.speaker}]
              </span>
              <span className={styles.historyText}>{entry.text}</span>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>
      </div>
    </>
  );
}
