// ============================================================
// GameLayout — Game shell: title -> playing -> settings
// Post-prologue: dialogue card state machine + GameViewport + BR nav
// ============================================================

import React, { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import styles from '../../styles/Game.module.scss';
import { GameProvider, useGame } from './engine/GameContext';
import { registerScript } from './engine/sceneEngine';
import { drawHand } from './engine/dialoguePool';
import { prologueScript } from '../../data/game/prologueScript';
import { day1MorningScript } from '../../data/game/day1MorningScript';
import { dialogueCards } from '../../data/game/dialogueCards';
import { deleteSave, loadGame } from './engine/saveManager';
import { createInitialState } from './engine/types';
import { getMoveCost } from './engine/mapHelpers';
import { SPEAKER, MSG } from '../../data/game/strings';
import SceneRenderer from './scenes/SceneRenderer';
import TitleScreen from './ui/TitleScreen';
import SettingsPanel from './ui/SettingsPanel';
import GameHudFrame from './ui/GameHudFrame';
import GameViewport from './views/GameViewport';
import CustomCursor from '../interactive/CustomCursor';
import type { GameState, DialogueCard } from './engine/types';
import type { MenuAction } from './ui/TitleScreen';
import type { NavView } from './ui/GameHudFrame';
import type { DialoguePhase } from './views/GameViewport';

const RainMorimeEffect = dynamic(
  () => import('../effects/RainMorimeEffect').catch(() => ({ default: () => null })),
  { ssr: false, loading: () => null }
);

registerScript(prologueScript);
registerScript(day1MorningScript);

type GameScreen = 'title' | 'playing';

function GameStateRouter({
  onOpenSettings,
  onBackToTitle,
}: {
  onOpenSettings: () => void;
  onBackToTitle: () => void;
}) {
  const { state, dispatch } = useGame();
  const [dialogueText, setDialogueText] = useState<string>(MSG.idle);
  const [dialogueSpeaker, setDialogueSpeaker] = useState<string | undefined>(undefined);
  const [activeView, setActiveView] = useState<NavView>(null);

  // Card dialogue state machine
  const [dialoguePhase, setDialoguePhase] = useState<DialoguePhase>('idle');
  const [hand, setHand] = useState<DialogueCard[]>([]);
  const [trustDelta, setTrustDelta] = useState<number | null>(null);
  const pendingCardRef = useRef<DialogueCard | null>(null);

  const handleAction = useCallback((action: string, payload?: any) => {
    // "talk" action triggers card draw
    if (action === 'talk') {
      const drawnHand = drawHand(dialogueCards, state);
      if (drawnHand.length === 0) {
        setDialogueSpeaker(SPEAKER.rainmorime);
        setDialogueText(MSG.noCards);
        return;
      }
      setHand(drawnHand);
      setDialoguePhase('hand');
      setDialogueSpeaker(undefined);
      setDialogueText(MSG.selectCard);
      return;
    }

    switch (action) {
      case 'move': {
        if (!payload?.row === undefined || payload?.col === undefined) {
          setDialogueSpeaker(SPEAKER.rainmorime);
          setDialogueText(MSG.movePrompt);
          return;
        }
        const tile = state.map[payload.row]?.[payload.col];
        const cost = tile?.explored ? getMoveCost(tile.terrain) : 1;
        if (state.actionPoints < cost) {
          setDialogueSpeaker(SPEAKER.rainmorime);
          setDialogueText(MSG.apNeed(cost, state.actionPoints));
          return;
        }
        dispatch({ type: 'MOVE_TO', row: payload.row, col: payload.col });
        const terrain = tile?.terrain ?? MSG.unknownTerrain;
        setDialogueSpeaker(SPEAKER.rainmorime);
        setDialogueText(MSG.moved(payload.row, payload.col, terrain, state.actionPoints - cost));
        return;
      }

      case 'search': {
        if (state.actionPoints < 2) {
          setDialogueSpeaker(SPEAKER.rainmorime);
          setDialogueText(MSG.apNeed(2, state.actionPoints));
          return;
        }
        dispatch({ type: 'EXPLORE_TILE' });
        setDialogueSpeaker(SPEAKER.rainmorime);
        setDialogueText(MSG.scanDone);
        return;
      }

      case 'gather': {
        if (state.actionPoints < 1) {
          setDialogueSpeaker(SPEAKER.rainmorime);
          setDialogueText(MSG.apShort);
          return;
        }
        dispatch({ type: 'CONSUME_AP', amount: 1 });
        const tile = state.map[state.playerPosition.row]?.[state.playerPosition.col];
        if (tile?.terrain === 'overgrown' || tile?.terrain === 'tide_margin') {
          dispatch({ type: 'ADD_RESOURCE', resource: 'bio', amount: 1 });
          setDialogueText(MSG.gathered(MSG.bioSample));
        } else {
          dispatch({ type: 'ADD_RESOURCE', resource: 'material', amount: 1 });
          setDialogueText(MSG.gathered(MSG.material));
        }
        return;
      }

      case 'return': {
        dispatch({ type: 'ADVANCE_TIME' });
        setDialogueSpeaker(SPEAKER.rainmorime);
        setDialogueText(MSG.returnNav);
        return;
      }

      case 'repair': {
        if (!payload) {
          setDialogueSpeaker(SPEAKER.rainmorime);
          setDialogueText(MSG.repairPrompt);
          return;
        }
        if (state.actionPoints < 2) {
          setDialogueSpeaker(SPEAKER.rainmorime);
          setDialogueText(MSG.repairApShort);
          return;
        }
        if ((state.resources.material ?? 0) < 5) {
          setDialogueSpeaker(SPEAKER.rainmorime);
          setDialogueText(MSG.repairMatShort);
          return;
        }
        dispatch({ type: 'REPAIR_FACILITY', facilityId: payload });
        const facility = state.facilities.find(f => f.id === payload);
        setDialogueSpeaker(SPEAKER.rainmorime);
        setDialogueText(MSG.repairing(facility?.name ?? payload));
        return;
      }

      case 'upgrade': {
        if (!payload) {
          setDialogueSpeaker(SPEAKER.rainmorime);
          setDialogueText(MSG.upgradePrompt);
          return;
        }
        dispatch({ type: 'UPGRADE_FACILITY', facilityId: payload });
        const facility = state.facilities.find(f => f.id === payload);
        setDialogueSpeaker(SPEAKER.rainmorime);
        setDialogueText(MSG.upgraded(facility?.name ?? payload));
        return;
      }

      case 'cook': {
        if ((state.resources.food ?? 0) < 2) {
          setDialogueSpeaker(SPEAKER.rainmorime);
          setDialogueText(MSG.cookFoodShort);
          return;
        }
        dispatch({ type: 'BATCH', actions: [
          { type: 'CONSUME_AP', amount: 1 },
          { type: 'CONSUME_RESOURCE', resource: 'food', amount: 2 },
          { type: 'UPDATE_RANGER', deltas: { stamina: 10, morale: 5 } },
        ]});
        setDialogueSpeaker(SPEAKER.ranger);
        setDialogueText(MSG.cookDone);
        return;
      }

      case 'research': {
        if (state.actionPoints < 1) {
          setDialogueSpeaker(SPEAKER.rainmorime);
          setDialogueText(MSG.apShort);
          return;
        }
        dispatch({ type: 'BATCH', actions: [
          { type: 'CONSUME_AP', amount: 1 },
          { type: 'CONSUME_RESOURCE', resource: 'data', amount: 5 },
        ]});
        setDialogueSpeaker(SPEAKER.rainmorime);
        setDialogueText(MSG.researchDone);
        return;
      }

      case 'rest': {
        dispatch({ type: 'ADVANCE_TIME' });
        setDialogueSpeaker(undefined);
        setDialogueText(MSG.restDone);
        return;
      }

      default: {
        setDialogueSpeaker(undefined);
        setDialogueText('');
      }
    }
  }, [state, dispatch]);

  const handlePlayCard = useCallback((card: DialogueCard) => {
    pendingCardRef.current = card;
    setDialoguePhase('showing_card');
    setDialogueSpeaker(SPEAKER.rainmorime);
    setDialogueText(card.text);
    setHand([]);
  }, []);

  const handleDialogueAdvance = useCallback(() => {
    const card = pendingCardRef.current;

    if (dialoguePhase === 'showing_card' && card) {
      // Transition: show ranger response
      const trustAfterCard = state.trust + (card.effect.trust_delta ?? 0);
      const response = (trustAfterCard >= 60 && card.ranger_response_high_trust)
        ? card.ranger_response_high_trust
        : card.ranger_response;

      setDialoguePhase('showing_response');
      setDialogueSpeaker(SPEAKER.ranger);
      setDialogueText(response);
      return;
    }

    if (dialoguePhase === 'showing_response' && card) {
      // Dispatch the card play to reducer, then show trust feedback
      dispatch({ type: 'PLAY_CARD', card });
      const delta = card.effect.trust_delta ?? 0;
      setTrustDelta(delta);
      setDialoguePhase('feedback');
      pendingCardRef.current = null;
      return;
    }

    if (dialoguePhase === 'idle') {
      setDialogueText('');
    }
  }, [dialoguePhase, state.trust, dispatch]);

  const handleTrustFeedbackDone = useCallback(() => {
    setTrustDelta(null);
    setDialoguePhase('idle');
    setDialogueSpeaker(undefined);
    setDialogueText(MSG.idle);
  }, []);

  const toggleView = useCallback((view: 'map' | 'cabin') => {
    setActiveView(prev => prev === view ? null : view);
  }, []);

  if (state.phase === 'prologue') {
    return (
      <SceneRenderer
        onOpenSettings={onOpenSettings}
        onBackToTitle={onBackToTitle}
      />
    );
  }

  const viewMode = activeView ?? (state.timePhase === 'daylight' ? 'map' : 'cabin');

  return (
    <>
      <GameHudFrame
        activeView={viewMode}
        onToggleView={toggleView}
        onOpenSettings={onOpenSettings}
        onOpenPause={onBackToTitle}
      />
      <div className={styles.gameContentArea}>
        <GameViewport
          mode={viewMode}
          state={state}
          onAction={handleAction}
          dialogueSpeaker={dialogueSpeaker}
          dialogueText={dialogueText}
          onDialogueAdvance={handleDialogueAdvance}
          dialoguePhase={dialoguePhase}
          hand={hand}
          onPlayCard={handlePlayCard}
          trustDelta={trustDelta}
          onTrustFeedbackDone={handleTrustFeedbackDone}
        />
      </div>
    </>
  );
}

export default function GameLayout() {
  const router = useRouter();
  const [screen, setScreen] = useState<GameScreen>('title');
  const [showSettings, setShowSettings] = useState(false);
  const [gameState, setGameState] = useState<GameState | undefined>(undefined);

  const handleMenuAction = useCallback(async (action: MenuAction) => {
    switch (action) {
      case 'new_game':
        await deleteSave().catch(() => {});
        setGameState(createInitialState());
        setScreen('playing');
        break;
      case 'continue': {
        const saved = await loadGame().catch(() => null);
        setGameState(saved ?? createInitialState());
        setScreen('playing');
        break;
      }
      case 'settings':
        setShowSettings(true);
        break;
      case 'exit':
        router.push('/');
        break;
      default:
        break;
    }
  }, [router]);

  const handleBackToTitle = useCallback(() => {
    setScreen('title');
    setGameState(undefined);
  }, []);

  return (
    <div className={styles.gameRoot}>
      <RainMorimeEffect />
      <div className={styles.gridBg} />
      <div className={styles.glowBg} />
      <CustomCursor />

      {screen === 'title' && (
        <TitleScreen onAction={handleMenuAction} />
      )}

      {screen === 'playing' && gameState && (
        <GameProvider initialState={gameState}>
          <GameStateRouter
            onOpenSettings={() => setShowSettings(true)}
            onBackToTitle={handleBackToTitle}
          />
        </GameProvider>
      )}

      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
