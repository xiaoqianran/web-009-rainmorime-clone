// ============================================================
// SceneRenderer — Renders current scene node with effects
// GameHudFrame provides BR nav buttons as a sibling element
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../../../styles/Game.module.scss';
import { useGame } from '../engine/GameContext';
import DialogueHistory from '../ui/DialogueHistory';
import GameHudFrame from '../ui/GameHudFrame';
import GameViewport from '../views/GameViewport';
import type { ChoiceOption, SceneNode, TimedInteractionNode } from '../engine/types';
import { nodeRequiresClick, nodeRequiresInput, getSystemNodeDuration } from '../engine/sceneEngine';
import { SPEAKER, UI, MSG } from '../../../data/game/strings';

const CHAR_SPEED = 40;
const BOOT_CHAR_SPEED = 25;

function useTypewriter(text: string, speed: number, active: boolean) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setDisplayed('');
      setDone(false);
      indexRef.current = 0;
      return;
    }

    setDisplayed('');
    setDone(false);
    indexRef.current = 0;

    const interval = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        setDone(true);
        clearInterval(interval);
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, active]);

  const skip = useCallback(() => {
    setDisplayed(text);
    setDone(true);
    indexRef.current = text.length;
  }, [text]);

  return { displayed, done, skip };
}

// ============================================================

interface SceneRendererProps {
  onOpenSettings?: () => void;
  onBackToTitle?: () => void;
}

export default function SceneRenderer({ onOpenSettings, onBackToTitle }: SceneRendererProps) {
  const { state, dispatch, currentNode, advance, choose, isComplete } = useGame();
  const [phase, setPhase] = useState<'typing' | 'waiting' | 'transition'>('typing');
  const [choiceResult, setChoiceResult] = useState<ChoiceOption | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [screenEffect, setScreenEffect] = useState<string | null>(null);
  const [transitionText, setTransitionText] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [overlayView, setOverlayView] = useState<'map' | 'cabin' | null>(null);
  const [overlayDialogue, setOverlayDialogue] = useState<{ speaker: string; text: string }>({ speaker: '', text: MSG.idle });

  // --- Timed interaction state ---
  const [timedResult, setTimedResult] = useState<SceneNode[] | null>(null);
  const [showTimedResult, setShowTimedResult] = useState(false);
  const [timedExpired, setTimedExpired] = useState(false);
  const timedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentNode?.type !== 'timedInteraction') {
      if (timedTimerRef.current) clearTimeout(timedTimerRef.current);
      setTimedResult(null);
      setShowTimedResult(false);
      setTimedExpired(false);
      return;
    }
    const node = currentNode as TimedInteractionNode;
    setTimedExpired(false);
    setTimedResult(null);
    setShowTimedResult(false);
    timedTimerRef.current = setTimeout(() => {
      setTimedExpired(true);
      setTimedResult(node.onTimeout);
      setShowTimedResult(true);
    }, node.timeout);
    return () => { if (timedTimerRef.current) clearTimeout(timedTimerRef.current); };
  }, [currentNode]);

  const handleTimedExecute = useCallback(() => {
    if (!currentNode || currentNode.type !== 'timedInteraction') return;
    if (timedTimerRef.current) clearTimeout(timedTimerRef.current);
    const node = currentNode as TimedInteractionNode;
    setTimedResult(node.onExecute);
    setShowTimedResult(true);
  }, [currentNode]);

  const handleTimedAdvance = useCallback(() => {
    if (timedResult) {
      timedResult.forEach((n) => {
        if (n.type === 'dialogue' || n.type === 'narration' || n.type === 'monologue') {
          dispatch({
            type: 'ADD_LOG',
            entry: {
              speaker: n.type === 'dialogue' ? n.speaker : n.type === 'monologue' ? 'monologue' : 'system',
              text: n.text,
              timestamp: Date.now(),
            },
          });
        }
      });
    }
    setTimedResult(null);
    setShowTimedResult(false);
    dispatch({ type: 'ADVANCE' });
  }, [dispatch, timedResult]);

  // Auto-chain scripts: prologue → day1_morning → free play
  useEffect(() => {
    if (!isComplete) return;
    if (state.currentScriptId === 'prologue') {
      dispatch({ type: 'TRANSITION_TO_SCRIPT', scriptId: 'day1_morning' });
    } else if (state.currentScriptId === 'day1_morning') {
      dispatch({ type: 'ENTER_FREE_PLAY', phase: 'empty_city', day: 1 });
    }
  }, [isComplete, state.currentScriptId, dispatch]);
  const containerRef = useRef<HTMLDivElement>(null);

  const isTextNode = currentNode &&
    (currentNode.type === 'narration' || currentNode.type === 'dialogue' || currentNode.type === 'monologue');

  const isBootNode = currentNode?.type === 'system' &&
    (currentNode.action === 'bootSequence' || currentNode.action === 'rebootSequence' || currentNode.action === 'typewriter');

  const typeText = isTextNode ? currentNode.text :
    isBootNode && currentNode.type === 'system' ? (currentNode.text ?? '') : '';

  const typeSpeed = isBootNode ? BOOT_CHAR_SPEED : CHAR_SPEED;

  const { displayed, done: typeDone, skip } = useTypewriter(
    typeText,
    typeSpeed,
    !!currentNode && (!!isTextNode || !!isBootNode)
  );

  useEffect(() => {
    if (!currentNode) return;

    if (currentNode.type === 'narration' || currentNode.type === 'dialogue'
      || currentNode.type === 'monologue' || currentNode.type === 'choice') {
      setScreenEffect(null);
      return;
    }

    if (isBootNode) {
      setScreenEffect(null);
      return;
    }

    if (currentNode.type === 'system') {
      const effect = currentNode.action;
      if (effect === 'blackScreen' || effect === 'fadeOut' || effect === 'shake' || effect === 'flash' || effect === 'glitch') {
        setScreenEffect(effect);
      }
      if (effect === 'fadeIn') {
        setScreenEffect(null);
      }
      const dur = getSystemNodeDuration(currentNode);
      const timer = setTimeout(() => advance(), dur);
      return () => clearTimeout(timer);
    }

    if (currentNode.type === 'transition') {
      setScreenEffect('fadeOut');
      setTransitionText(currentNode.text ?? null);
      const dur = getSystemNodeDuration(currentNode);
      const timer = setTimeout(() => {
        setScreenEffect(null);
        setTransitionText(null);
        advance();
      }, dur);
      return () => clearTimeout(timer);
    }
  }, [currentNode, advance, isBootNode]);

  useEffect(() => {
    setChoiceResult(null);
    setShowResult(false);
    setPhase('typing');
  }, [state.currentNodeIndex]);

  const handleClick = useCallback(() => {
    if (!currentNode || overlayView) return;

    if (showResult) {
      setShowResult(false);
      setChoiceResult(null);
      advance();
      return;
    }

    if (showTimedResult && timedResult) {
      handleTimedAdvance();
      return;
    }

    if (nodeRequiresInput(currentNode)) return;

    if (!typeDone) {
      skip();
      return;
    }

    if (nodeRequiresClick(currentNode) || isBootNode) {
      advance();
    }
  }, [currentNode, typeDone, skip, advance, showResult, isBootNode, overlayView, showTimedResult, handleTimedAdvance]);

  const handleChoice = useCallback((option: ChoiceOption) => {
    setChoiceResult(option);
    setShowResult(true);
    choose(option.id);
  }, [choose]);

  const toggleOverlay = useCallback((view: 'map' | 'cabin') => {
    setOverlayView(prev => prev === view ? null : view);
    setShowPauseMenu(false);
  }, []);

  const handleOverlayAction = useCallback((action: string, payload?: any) => {
    const r = MSG.overlay[action] ?? { speaker: '', text: '' };
    setOverlayDialogue({ speaker: r.speaker ?? '', text: r.text });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleClick();
        return;
      }
      if (e.key === 'Escape') {
        if (overlayView) { setOverlayView(null); return; }
        setShowPauseMenu((p) => !p);
        setHistoryOpen(false);
      }
      if (e.key === 'm' || e.key === 'M') toggleOverlay('map');
      if (e.key === 'c' || e.key === 'C') toggleOverlay('cabin');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overlayView, toggleOverlay, handleClick]);

  // --- Complete screen (only for scripts without auto-chain) ---
  const isAutoChained = state.currentScriptId === 'prologue' || state.currentScriptId === 'day1_morning';
  if (isComplete && !isAutoChained) {
    return (
      <>
        <GameHudFrame
          activeView={null}
          onToggleView={toggleOverlay}
          onOpenLog={() => setHistoryOpen(true)}
          onOpenSettings={onOpenSettings}
          onOpenPause={() => setShowPauseMenu(p => !p)}
        />
        <div className={styles.sceneContainer}>
          <div className={styles.sceneEnd}>
            <div className={styles.sceneEndTitle}>{UI.scene.saveComplete}</div>
            <div className={styles.sceneEndText}>{UI.scene.scriptDone}</div>
            <button className={styles.sceneEndBtn} onClick={onBackToTitle}>
              {UI.scene.backToMenu}
            </button>
          </div>
        </div>
      </>
    );
  }
  // Auto-chained scripts: useEffect handles transition, render null briefly
  if (isComplete && isAutoChained) return null;

  if (!currentNode) return null;

  // --- Main render ---
  return (
    <>
      {/* BR nav buttons */}
      <GameHudFrame
        activeView={overlayView}
        onToggleView={toggleOverlay}
        onOpenLog={() => setHistoryOpen(true)}
        onOpenSettings={onOpenSettings}
        onOpenPause={() => setShowPauseMenu(p => !p)}
      />

      {/* Map/Cabin viewport OR scene content */}
      {overlayView ? (
        <div className={styles.gameContentArea}>
          <GameViewport
            mode={overlayView}
            state={state}
            onAction={handleOverlayAction}
            dialogueSpeaker={overlayDialogue.speaker || undefined}
            dialogueText={overlayDialogue.text}
            onDialogueAdvance={() => setOverlayDialogue({ speaker: '', text: '' })}
            dialoguePhase="idle"
            hand={[]}
            onPlayCard={() => {}}
            trustDelta={null}
            onTrustFeedbackDone={() => {}}
          />
        </div>
      ) : (
        <div
          ref={containerRef}
          className={`${styles.sceneContainer} ${screenEffect ? styles[`effect_${screenEffect}`] : ''}`}
          onClick={handleClick}
        >
          {screenEffect === 'blackScreen' && <div className={styles.blackOverlay} />}
          {screenEffect === 'fadeOut' && (
            <div className={styles.fadeOverlay}>
              {transitionText && <div className={styles.transitionText}>{transitionText}</div>}
            </div>
          )}
          {screenEffect === 'shake' && <div className={styles.shakeOverlay} />}

          {showResult && choiceResult && (
            <div className={styles.sceneContent}>
              <ResultDisplay option={choiceResult} />
            </div>
          )}

          {!showResult && (
            <>
              {currentNode.type === 'narration' && (
                <div className={styles.sceneContent}>
                  <div className={styles.narrationText}>
                    {displayed}
                    {!typeDone && <span className={styles.cursor}>▊</span>}
                  </div>
                  <div className={`${styles.clickPrompt} ${typeDone ? styles.clickPromptVisible : ''}`}>▼</div>
                </div>
              )}

              {currentNode.type === 'dialogue' && (
                <div className={styles.sceneContent}>
                  <div className={styles.dialogueSpeaker}>
                    [{SPEAKER[currentNode.speaker]}]
                  </div>
                  <div className={styles.dialogueContent}>
                    {displayed}
                    {!typeDone && <span className={styles.cursor}>▊</span>}
                  </div>
                  <div className={`${styles.clickPrompt} ${typeDone ? styles.clickPromptVisible : ''}`}>▼</div>
                </div>
              )}

              {currentNode.type === 'monologue' && (
                <div className={`${styles.sceneContent} ${styles.monologueMode}`}>
                  <div className={styles.monologueLabel}>{UI.scene.internalLog}</div>
                  <div className={styles.monologueText}>
                    {displayed}
                    {!typeDone && <span className={styles.cursor}>▊</span>}
                  </div>
                  <div className={`${styles.clickPrompt} ${typeDone ? styles.clickPromptVisible : ''}`}>▼</div>
                </div>
              )}

              {currentNode.type === 'system' && isBootNode && (
                <div className={`${styles.sceneContent} ${styles.bootMode}`}>
                  <pre className={styles.bootText}>
                    {displayed}
                    {!typeDone && <span className={styles.cursor}>▊</span>}
                  </pre>
                  <div className={`${styles.clickPrompt} ${typeDone ? styles.clickPromptVisible : ''}`}>▼</div>
                </div>
              )}

              {currentNode.type === 'choice' && (
                <div className={styles.sceneContent}>
                  <div className={styles.sceneChoices}>
                    {currentNode.options.map((opt) => (
                      <button
                        key={opt.id}
                        className={styles.sceneChoiceBtn}
                        onClick={(e) => { e.stopPropagation(); handleChoice(opt); }}
                      >
                        {opt.toneLabel && (
                          <span className={styles.sceneChoiceTone}>[{opt.toneLabel}]</span>
                        )}
                        <span className={styles.sceneChoiceText}>{opt.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentNode.type === 'timedInteraction' && !showTimedResult && (
                <div className={styles.sceneContent}>
                  <div className={styles.scanContainer}>
                    <div className={styles.scanWaveform}>
                      <div className={styles.scanLine} />
                      <div className={styles.scanLine} />
                      <div className={styles.scanLine} />
                    </div>
                    <div className={styles.scanLabel}>FULL BAND SCAN</div>
                    <button
                      className={styles.scanExecuteBtn}
                      onClick={(e) => { e.stopPropagation(); handleTimedExecute(); }}
                    >
                      {(currentNode as TimedInteractionNode).prompt || '执行'}
                    </button>
                  </div>
                </div>
              )}

              {currentNode.type === 'timedInteraction' && showTimedResult && timedResult && (
                <div className={styles.sceneContent} onClick={(e) => { e.stopPropagation(); handleTimedAdvance(); }}>
                  <TimedResultDisplay nodes={timedResult} />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Pause menu overlay */}
      {showPauseMenu && (
        <div className={styles.pauseOverlay} onClick={(e) => e.stopPropagation()}>
          <div className={styles.pauseMenu}>
            <div className={styles.pauseTitle}>{UI.scene.paused}</div>
            <button className={styles.pauseBtn} onClick={() => setShowPauseMenu(false)}>
              {UI.scene.resume}
            </button>
            <button className={styles.pauseBtn} onClick={() => { setHistoryOpen(true); setShowPauseMenu(false); }}>
              {UI.scene.dialogueHistory}
            </button>
            <button className={styles.pauseBtn} onClick={() => { onOpenSettings?.(); setShowPauseMenu(false); }}>
              {UI.nav.setTitle}
            </button>
            <button className={`${styles.pauseBtn} ${styles.pauseBtnDanger}`} onClick={onBackToTitle}>
              {UI.scene.backToMenu}
            </button>
          </div>
        </div>
      )}

      <DialogueHistory open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}

// --- Result display subcomponent ---
function ResultDisplay({ option }: { option: ChoiceOption }) {
  const { displayed, done } = useTypewriter(
    option.result
      .map((n) => {
        if (n.type === 'dialogue') return `[${SPEAKER[n.speaker]}] ${n.text}`;
        if (n.type === 'narration') return n.text;
        if (n.type === 'monologue') return n.text;
        return '';
      })
      .filter(Boolean)
      .join('\n'),
    CHAR_SPEED,
    true
  );

  return (
    <div className={styles.resultDisplay}>
      <div className={styles.resultText}>
        {displayed.split('\n').map((line, i) => (
          <p key={i}>{line}</p>
        ))}
        {!done && <span className={styles.cursor}>▊</span>}
      </div>
      {option.effects.trust !== undefined && option.effects.trust !== 0 && (
        <div className={`${styles.trustChange} ${option.effects.trust > 0 ? styles.trustUp : styles.trustDown}`}>
          {option.effects.trust > 0 ? '+' : ''}{option.effects.trust} TRUST
        </div>
      )}
      <div className={`${styles.clickPrompt} ${done ? styles.clickPromptVisible : ''}`}>▼</div>
    </div>
  );
}

// --- Timed interaction result display ---
function TimedResultDisplay({ nodes }: { nodes: SceneNode[] }) {
  const text = nodes
    .map((n) => {
      if (n.type === 'dialogue') return `[${SPEAKER[n.speaker]}] ${n.text}`;
      if (n.type === 'narration') return n.text;
      if (n.type === 'monologue') return n.text;
      return '';
    })
    .filter(Boolean)
    .join('\n');

  const { displayed, done } = useTypewriter(text, CHAR_SPEED, true);

  return (
    <div className={styles.resultDisplay}>
      <div className={styles.resultText}>
        {displayed.split('\n').map((line, i) => (
          <p key={i}>{line}</p>
        ))}
        {!done && <span className={styles.cursor}>▊</span>}
      </div>
      <div className={`${styles.clickPrompt} ${done ? styles.clickPromptVisible : ''}`}>▼</div>
    </div>
  );
}
