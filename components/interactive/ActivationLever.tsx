import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './ActivationLever.module.scss';

const REST_Y = 15;
const ACTIVE_Y = 45;
const DRAG_THRESHOLD = 10;
const HOLD_MS = 140;

const icons = {
  discharge: (
    <g className={styles.leverIcon} transform="translate(0, 6)">
      <polyline points="28,72 22,78 26,78 22,84 28,78 24,78" strokeWidth="1" />
    </g>
  ),
  drain: (
    <g className={styles.leverIcon} transform="translate(0, 6)">
      <path d="M 20 74 Q 22.5 77, 25 74 T 30 74" strokeWidth="1" />
      <path d="M 20 78 Q 22.5 81, 25 78 T 30 78" strokeWidth="1" />
      <path d="M 20 82 Q 22.5 85, 25 82 T 30 82" strokeWidth="1" />
    </g>
  ),
};

const ActivationLever = ({
  onActivate,
  isActive,
  iconType,
  isAnimated,
  cursorLabel,
  ariaLabel,
  lockWhenActive = false,
}: {
  onActivate: () => void;
  isActive: boolean;
  iconType?: 'discharge' | 'drain';
  isAnimated?: boolean;
  cursorLabel?: string;
  ariaLabel?: string;
  lockWhenActive?: boolean;
}) => {
  const [dragY, setDragY] = useState<number | null>(null);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const onActivateRef = useRef(onActivate);
  onActivateRef.current = onActivate;

  const handleY = isActive ? ACTIVE_Y : (dragY ?? REST_Y);

  const stopHold = useCallback(() => {
    if (holdTimerRef.current != null) {
      window.clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const startHold = useCallback(() => {
    if (holdTimerRef.current != null) return;
    onActivateRef.current();
    holdTimerRef.current = window.setInterval(() => {
      onActivateRef.current();
    }, HOLD_MS);
  }, []);

  const endDrag = useCallback(() => {
    draggingRef.current = false;
    stopHold();
    setDragY(null);
    const id = pointerIdRef.current;
    const node = containerRef.current;
    if (id != null && node && node.hasPointerCapture?.(id)) {
      try { node.releasePointerCapture(id); } catch {}
    }
    pointerIdRef.current = null;
  }, [stopHold]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const delta = e.clientY - startYRef.current;
      const next = Math.max(REST_Y, Math.min(ACTIVE_Y, REST_Y + delta));
      setDragY(next);
      if (delta >= DRAG_THRESHOLD) startHold();
      else stopHold();
    };
    const onUp = () => {
      if (draggingRef.current) endDrag();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [endDrag, startHold, stopHold]);

  useEffect(() => () => stopHold(), [stopHold]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (lockWhenActive && isActive) return;
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = true;
    startYRef.current = e.clientY;
    pointerIdRef.current = e.pointerId;
    setDragY(REST_Y);
    try { containerRef.current?.setPointerCapture(e.pointerId); } catch {}
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (lockWhenActive && isActive) return;
    onActivateRef.current();
    setDragY(REST_Y + 16);
    window.setTimeout(() => setDragY(null), 220);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (lockWhenActive && isActive) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      onActivateRef.current();
    }
  };

  const IconComponent = icons[iconType] || null;

  return (
    <div
      ref={containerRef}
      className={`
        ${styles.leverContainer}
        ${isActive ? styles.activeState : ''}
        ${isAnimated ? styles.animated : ''}
      `}
      onPointerDown={handlePointerDown}
      onLostPointerCapture={endDrag}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      aria-label={ariaLabel || (iconType === 'drain' ? '向下拖动放电' : '向下拖动充电')}
      data-cursor-label={cursorLabel || 'DRAG TO CHANGE'}
      style={{ touchAction: 'none' }}
    >
      <svg viewBox="0 0 50 90" className={styles.leverSvg}>
        <rect x="15" y="5" width="20" height="70" className={styles.base} />
        <line x1="25" y1="15" x2="25" y2="65" className={styles.slotLine} />
        <g transform={`translate(0, ${handleY - 15})`}>
          <line x1="10" y1="15" x2="40" y2="15" className={styles.handleTop} />
          <line x1="25" y1="15" x2="25" y2="35" className={styles.handleShaft} />
        </g>
        <circle
          cx="25"
          cy="70"
          r="3.5"
          className={`${styles.indicatorLight} ${isActive ? styles.on : styles.off}`}
        />
        {IconComponent}
      </svg>
    </div>
  );
};

export default ActivationLever;
