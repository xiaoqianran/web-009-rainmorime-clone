// ============================================================
// GameViewport — Unified panel: content (map/cabin) + dialogue + actions/cards
// Replaces the old 60/40 split and full-screen overlay approach
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../../../styles/Game.module.scss';
import MapView from './MapView';
import CabinView from './CabinView';
import CardHand from '../ui/CardHand';
import TrustFeedback from '../ui/TrustFeedback';
import type { GameState, DialogueCard } from '../engine/types';
import { UI } from '../../../data/game/strings';

const CHAR_SPEED = 40;

interface ActionDef {
  id: string;
  label: string;
}

const MAP_ACTIONS: ActionDef[] = [
  { id: 'move', label: UI.actions.move },
  { id: 'search', label: UI.actions.search },
  { id: 'gather', label: UI.actions.gather },
  { id: 'return', label: UI.actions.return },
  { id: 'talk', label: UI.actions.talk },
];

const CABIN_ACTIONS: ActionDef[] = [
  { id: 'repair', label: UI.actions.repair },
  { id: 'cook', label: UI.actions.cook },
  { id: 'research', label: UI.actions.research },
  { id: 'rest', label: UI.actions.rest },
  { id: 'talk', label: UI.actions.talk },
];

export type DialoguePhase = 'idle' | 'hand' | 'showing_card' | 'showing_response' | 'feedback';

interface GameViewportProps {
  mode: 'map' | 'cabin';
  state: GameState;
  onAction: (action: string, payload?: any) => void;
  dialogueSpeaker?: string;
  dialogueText: string;
  onDialogueAdvance?: () => void;
  // Card dialogue system
  dialoguePhase: DialoguePhase;
  hand: DialogueCard[];
  onPlayCard: (card: DialogueCard) => void;
  trustDelta: number | null;
  onTrustFeedbackDone: () => void;
}

export default function GameViewport({
  mode,
  state,
  onAction,
  dialogueSpeaker,
  dialogueText,
  onDialogueAdvance,
  dialoguePhase,
  hand,
  onPlayCard,
  trustDelta,
  onTrustFeedbackDone,
}: GameViewportProps) {
  const energyUsed = state.facilities.filter(f => f.status === 'operational').reduce((s, f) => s + f.energyCost, 0);
  const headerLabel = mode === 'map'
    ? UI.viewport.mapHeader(state.day, String(state.facilities.find(f => f.id === 'comm')?.level ?? '?'))
    : UI.viewport.cabinHeader(state.day, energyUsed, (state.resources.energy ?? 0) + energyUsed);

  const actions = mode === 'map' ? MAP_ACTIONS : CABIN_ACTIONS;
  const showCards = dialoguePhase === 'hand' && hand.length > 0;
  const actionsDisabled = dialoguePhase !== 'idle';

  // Typewriter for dialogue
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;
    if (!dialogueText) { setDone(true); return; }

    const interval = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= dialogueText.length) {
        setDisplayed(dialogueText);
        setDone(true);
        clearInterval(interval);
      } else {
        setDisplayed(dialogueText.slice(0, indexRef.current));
      }
    }, CHAR_SPEED);

    return () => clearInterval(interval);
  }, [dialogueText]);

  const handleDialogueClick = useCallback(() => {
    if (!done) {
      setDisplayed(dialogueText);
      setDone(true);
      indexRef.current = dialogueText.length;
      return;
    }
    onDialogueAdvance?.();
  }, [done, dialogueText, onDialogueAdvance]);

  return (
    <div className={styles.gameViewport}>
      <div className={styles.viewportHeader}>{headerLabel}</div>

      <div className={styles.viewportContent}>
        {mode === 'map' ? (
          <MapView state={state} onAction={onAction} />
        ) : (
          <CabinView state={state} onAction={onAction} />
        )}

        {dialoguePhase === 'feedback' && trustDelta !== null && (
          <TrustFeedback delta={trustDelta} onComplete={onTrustFeedbackDone} />
        )}
      </div>

      <div className={styles.viewportDivider} />

      <div className={styles.viewportDialogue} onClick={handleDialogueClick}>
        <div className={styles.vpDialogueInner}>
          {dialogueSpeaker && (
            <span className={styles.vpDialogueSpeaker}>[{dialogueSpeaker}]</span>
          )}
          <span className={styles.vpDialogueText}>
            {displayed}
            {!done && <span className={styles.cursor}>▊</span>}
          </span>
        </div>
        <div className={`${styles.clickPrompt} ${done ? styles.clickPromptVisible : ''}`}>▼</div>
      </div>

      {showCards ? (
        <CardHand cards={hand} onPlay={onPlayCard} />
      ) : (
        <div className={styles.viewportActions}>
          {actions.map(a => (
            <button
              key={a.id}
              className={styles.vpActionBtn}
              onClick={() => onAction(a.id)}
              disabled={actionsDisabled}
            >
              [{a.label}]
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
