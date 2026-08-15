import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './ActivationLever.module.scss';

const REST_Y = 15;
const ACTIVE_Y = 45;
const DRAG_THRESHOLD = 22;

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
}: {
  onActivate: () => void;
  isActive: boolean;
  iconType?: 'discharge' | 'drain';
  isAnimated?: boolean;
  cursorLabel?: string;
  ariaLabel?: string;
}) => {
  const [dragY, setDragY] = useState<number | null>(null);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const activatedThisDragRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);

  const handleY = isActive ? ACTIVE_Y : (dragY ?? REST_Y);

  const endDrag = useCallback(() => {
    draggingRef.current = false;
    activatedThisDragRef.current = false;
    setDragY(null);
    const id = pointerIdRef.current;
    const node = containerRef.current;
    if (id != null && node && node.hasPointerCapture?.(id)) {
      try { node.releasePointerCapture(id); } catch {}
    }
    pointerIdRef.current = null;
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const delta = e.clientY - startYRef.current;
      const next = Math.max(REST_Y, Math.min(ACTIVE_Y, REST_Y + delta));
      setDragY(next);
      if (!activatedThisDragRef.current && delta >= DRAG_THRESHOLD) {
        activatedThisDragRef.current = true;
        onActivate();
      }
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
  }, [onActivate, endDrag]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isActive) return;
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = true;
    activatedThisDragRef.current = false;
    startYRef.current = e.clientY;
    pointerIdRef.current = e.pointerId;
    setDragY(REST_Y);
    try { containerRef.current?.setPointerCapture(e.pointerId); } catch {}
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isActive || draggingRef.current) return;
    // Nudge the handle so a click teaches "drag down" instead of feeling broken.
    setDragY(REST_Y + 14);
    window.setTimeout(() => setDragY(null), 280);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isActive) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      onActivate();
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
      role="button"
      tabIndex={0}
      aria-label={ariaLabel || (iconType === 'drain' ? '向下拖动放电' : '向下拖动充电')}
      data-cursor-label={cursorLabel || 'DRAG DOWN'}
      data-cursor-magnetic
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
