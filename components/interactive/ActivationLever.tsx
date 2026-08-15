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
}: {
  onActivate: () => void;
  isActive: boolean;
  iconType?: 'discharge' | 'drain';
  isAnimated?: boolean;
}) => {
  const [dragY, setDragY] = useState<number | null>(null);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const activatedThisDragRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleY = isActive ? ACTIVE_Y : (dragY ?? REST_Y);

  const endDrag = useCallback(() => {
    draggingRef.current = false;
    activatedThisDragRef.current = false;
    setDragY(null);
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
    setDragY(REST_Y);
    containerRef.current?.setPointerCapture?.(e.pointerId);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Plain click does nothing — activation is drag-down only.
    e.preventDefault();
    e.stopPropagation();
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
      onClick={handleClick}
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
