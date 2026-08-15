// ============================================================
// CardHand — Renders the player's current hand of dialogue cards.
// Each card shows tone label, truncated text, and a layer color bar.
// ============================================================

import React, { useState } from 'react';
import styles from '../../../styles/Game.module.scss';
import type { DialogueCard } from '../engine/types';
import { UI } from '../../../data/game/strings';

interface CardHandProps {
  cards: DialogueCard[];
  onPlay: (card: DialogueCard) => void;
  disabled?: boolean;
}

export default function CardHand({ cards, onPlay, disabled }: CardHandProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleClick = (card: DialogueCard) => {
    if (disabled) return;
    if (selectedId === card.id) return;
    setSelectedId(card.id);
    setTimeout(() => onPlay(card), 300);
  };

  return (
    <div className={styles.cardHand}>
      {cards.map((card) => (
        <button
          key={card.id}
          className={`${styles.dialogueCard} ${selectedId === card.id ? styles.cardSelected : ''}`}
          onClick={() => handleClick(card)}
          disabled={disabled}
        >
          <span className={styles.cardTone}>
            {UI.card.tones[card.tone] ?? card.tone}
          </span>
          <span className={styles.cardText}>
            {card.text.length > 42 ? card.text.slice(0, 42) + '…' : card.text}
          </span>
          <span className={`${styles.cardLayer} ${styles[`layer_${card.layer}`]}`}>
            {UI.card.layers[card.layer] ?? card.layer}
          </span>
        </button>
      ))}
    </div>
  );
}
