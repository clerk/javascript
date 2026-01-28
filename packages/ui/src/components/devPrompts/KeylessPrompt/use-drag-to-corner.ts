import type { PointerEventHandler } from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const STORAGE_KEY = 'clerk-keyless-prompt-corner';
const CORNER_OFFSET = '1.25rem';
const CORNER_OFFSET_PX = 20; // 1.25rem ≈ 20px
const DRAG_THRESHOLD = 5;
const VELOCITY_SAMPLE_INTERVAL_MS = 10;
const VELOCITY_HISTORY_SIZE = 5;
const INERTIA_DECELERATION_RATE = 0.999;
const SPRING_DURATION = '350ms';
const SPRING_EASING = 'cubic-bezier(0.34, 1.2, 0.64, 1)';
const SPRING_TRANSITION = `transform ${SPRING_DURATION} ${SPRING_EASING}`;
const ZERO_TRANSFORM = 'translate3d(0px, 0px, 0)';
const ZERO_POINT: Point = { x: 0, y: 0 };

interface Point {
  x: number;
  y: number;
}

interface Velocity {
  position: Point;
  timestamp: number;
}

interface CornerTranslation {
  corner: Corner;
  translation: Point;
}

interface UseDragToCornerResult {
  corner: Corner;
  isDragging: boolean;
  cornerStyle: React.CSSProperties;
  containerRef: React.RefObject<HTMLDivElement>;
  onPointerDown: PointerEventHandler;
  preventClick: boolean;
  isInitialized: boolean;
}

function getNearestCorner(projectedTranslation: Point, corners: Record<Corner, Point>): Corner {
  let nearestCorner: Corner = 'bottom-right';
  let minDistance = Infinity;

  for (const [corner, translation] of Object.entries(corners)) {
    const dx = projectedTranslation.x - translation.x;
    const dy = projectedTranslation.y - translation.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCorner = corner as Corner;
    }
  }

  return nearestCorner;
}

function getCornerStyles(corner: Corner): React.CSSProperties {
  switch (corner) {
    case 'top-left':
      return { top: CORNER_OFFSET, left: CORNER_OFFSET };
    case 'top-right':
      return { top: CORNER_OFFSET, right: CORNER_OFFSET };
    case 'bottom-left':
      return { bottom: CORNER_OFFSET, left: CORNER_OFFSET };
    case 'bottom-right':
      return { bottom: CORNER_OFFSET, right: CORNER_OFFSET };
  }
}

const VALID_CORNERS: Corner[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

function saveCornerPreference(corner: Corner): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, corner);
  } catch {
    // Ignore localStorage errors
  }
}

function project(initialVelocity: number): number {
  return ((initialVelocity / 1000) * INERTIA_DECELERATION_RATE) / (1 - INERTIA_DECELERATION_RATE);
}

function calculateVelocity(history: Velocity[]): Point {
  if (history.length < 2) {
    return ZERO_POINT;
  }

  const oldest = history[0];
  const latest = history[history.length - 1];
  const timeDelta = latest.timestamp - oldest.timestamp;

  if (timeDelta === 0) {
    return ZERO_POINT;
  }

  return {
    x: ((latest.position.x - oldest.position.x) / timeDelta) * 1000,
    y: ((latest.position.y - oldest.position.y) / timeDelta) * 1000,
  };
}

export function useDragToCorner(): UseDragToCornerResult {
  // Initialize with deterministic server-safe value to avoid SSR/hydration mismatch
  const [corner, setCorner] = useState<Corner>('bottom-right');
  const [isDragging, setIsDragging] = useState(false);
  const [preventClick, setPreventClick] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const pendingCornerUpdate = useRef<Corner | null>(null);

  // Defer localStorage read to client-side only after mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsInitialized(true);
      return;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && VALID_CORNERS.includes(stored as Corner)) {
        setCorner(stored as Corner);
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const machine = useRef<{ state: 'idle' | 'press' | 'animating' } | { state: 'drag'; pointerId: number }>({
    state: 'idle',
  });

  const cleanup = useRef<(() => void) | null>(null);
  const origin = useRef<Point>({ x: 0, y: 0 });
  const translation = useRef<Point>({ x: 0, y: 0 });
  const lastTimestamp = useRef<number>(0);
  const velocities = useRef<Velocity[]>([]);

  const setTranslation = useCallback((position: Point) => {
    if (!containerRef.current) {
      return;
    }
    translation.current = position;
    containerRef.current.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
  }, []);

  const getCorners = useCallback((): Record<Corner, Point> => {
    const container = containerRef.current;
    if (!container) {
      return {
        'top-left': ZERO_POINT,
        'top-right': ZERO_POINT,
        'bottom-left': ZERO_POINT,
        'bottom-right': ZERO_POINT,
      };
    }

    const triggerWidth = container.offsetWidth || 0;
    const triggerHeight = container.offsetHeight || 0;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    function getAbsolutePosition(c: Corner): Point {
      const isRight = c.includes('right');
      const isBottom = c.includes('bottom');
      return {
        x: isRight ? window.innerWidth - scrollbarWidth - CORNER_OFFSET_PX - triggerWidth : CORNER_OFFSET_PX,
        y: isBottom ? window.innerHeight - CORNER_OFFSET_PX - triggerHeight : CORNER_OFFSET_PX,
      };
    }

    const base = getAbsolutePosition(corner);

    function toRelative(c: Corner): Point {
      const pos = getAbsolutePosition(c);
      return { x: pos.x - base.x, y: pos.y - base.y };
    }

    return {
      'top-left': toRelative('top-left'),
      'top-right': toRelative('top-right'),
      'bottom-left': toRelative('bottom-left'),
      'bottom-right': toRelative('bottom-right'),
    };
  }, [corner]);

  const animate = useCallback(
    (cornerTranslation: CornerTranslation) => {
      const el = containerRef.current;
      if (!el) {
        return;
      }

      const handleAnimationEnd = (e: TransitionEvent) => {
        if (e.propertyName === 'transform') {
          machine.current = { state: 'animating' };
          pendingCornerUpdate.current = cornerTranslation.corner;
          setCorner(cornerTranslation.corner);
          saveCornerPreference(cornerTranslation.corner);
        }
      };

      el.style.transition = SPRING_TRANSITION;
      el.addEventListener('transitionend', handleAnimationEnd, { once: true });
      setTranslation(cornerTranslation.translation);
    },
    [setTranslation],
  );

  const resetTranslation = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }

    const hasTranslation = translation.current.x !== 0 || translation.current.y !== 0;
    translation.current = ZERO_POINT;
    el.style.transform = ZERO_TRANSFORM;

    if (hasTranslation) {
      el.style.transition = SPRING_TRANSITION;
      el.addEventListener(
        'transitionend',
        () => {
          el.style.transition = '';
          setPreventClick(false);
        },
        { once: true },
      );
    } else {
      el.style.transition = '';
      setPreventClick(false);
    }
  }, []);

  const cancel = useCallback(() => {
    const currentState = machine.current.state;
    const wasDragging = currentState === 'drag';

    if (machine.current.state === 'drag') {
      containerRef.current?.releasePointerCapture(machine.current.pointerId);
      machine.current = { state: 'animating' };
    } else {
      machine.current = { state: 'idle' };
    }

    if (cleanup.current) {
      cleanup.current();
      cleanup.current = null;
    }

    velocities.current = [];
    setIsDragging(false);
    containerRef.current?.classList.remove('dev-tools-grabbing');
    document.body.style.removeProperty('user-select');
    document.body.style.removeProperty('-webkit-user-select');

    if (!wasDragging) {
      resetTranslation();
    }
  }, [resetTranslation]);

  useLayoutEffect(() => {
    if (pendingCornerUpdate.current === corner) {
      const el = containerRef.current;
      if (el && machine.current.state === 'animating') {
        translation.current = ZERO_POINT;
        el.style.transition = '';
        el.style.transform = ZERO_TRANSFORM;
        machine.current = { state: 'idle' };
        setPreventClick(false);
        pendingCornerUpdate.current = null;
      }
    }
  }, [corner]);

  useLayoutEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  const handlePointerDown: PointerEventHandler = useCallback(
    e => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.closest('a')) {
        return;
      }

      if (e.button !== 0) {
        return;
      }

      const container = containerRef.current;
      if (!container) {
        return;
      }

      origin.current = { x: e.clientX, y: e.clientY };
      machine.current = { state: 'press' };
      velocities.current = [];
      translation.current = ZERO_POINT;
      lastTimestamp.current = Date.now();

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (machine.current.state === 'press') {
          const dx = moveEvent.clientX - origin.current.x;
          const dy = moveEvent.clientY - origin.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < DRAG_THRESHOLD) {
            return;
          }

          machine.current = { state: 'drag', pointerId: moveEvent.pointerId };
          try {
            container.setPointerCapture(moveEvent.pointerId);
          } catch {
            // Pointer capture may fail - drag still works without it
          }
          container.classList.add('dev-tools-grabbing');
          document.body.style.userSelect = 'none';
          document.body.style.webkitUserSelect = 'none';
          setIsDragging(true);
        }

        if (machine.current.state !== 'drag') {
          return;
        }

        const currentPosition = { x: moveEvent.clientX, y: moveEvent.clientY };
        const dx = currentPosition.x - origin.current.x;
        const dy = currentPosition.y - origin.current.y;

        origin.current = currentPosition;

        setTranslation({
          x: translation.current.x + dx,
          y: translation.current.y + dy,
        });

        const now = Date.now();
        if (now - lastTimestamp.current >= VELOCITY_SAMPLE_INTERVAL_MS) {
          velocities.current = [
            ...velocities.current.slice(-VELOCITY_HISTORY_SIZE + 1),
            { position: currentPosition, timestamp: now },
          ];
          lastTimestamp.current = now;
        }
      };

      const handlePointerUp = () => {
        const wasDragging = machine.current.state === 'drag';

        if (wasDragging) {
          const velocity = calculateVelocity(velocities.current);
          cancel();

          const container = containerRef.current;
          if (!container) {
            return;
          }

          const projectedTranslation = {
            x: translation.current.x + project(velocity.x),
            y: translation.current.y + project(velocity.y),
          };

          const allCorners = getCorners();
          const newCorner = getNearestCorner(projectedTranslation, allCorners);
          const targetTranslation = allCorners[newCorner];

          setPreventClick(true);
          animate({ corner: newCorner, translation: targetTranslation });
        } else {
          cancel();
        }
      };

      const handleClick = (clickEvent: MouseEvent) => {
        const target = clickEvent.target as HTMLElement;
        const isButton = target.tagName === 'BUTTON' || target.closest('button');
        const isLink = target.tagName === 'A' || target.closest('a');

        if (machine.current.state === 'animating' && !isButton && !isLink) {
          clickEvent.preventDefault();
          clickEvent.stopPropagation();
        }
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp, { once: true });
      window.addEventListener('pointercancel', cancel, { once: true });
      container.addEventListener('click', handleClick);

      if (cleanup.current) {
        cleanup.current();
      }

      cleanup.current = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', cancel);
        container.removeEventListener('click', handleClick);
      };
    },
    [cancel, setTranslation, animate, getCorners],
  );

  return {
    corner,
    isDragging,
    cornerStyle: getCornerStyles(corner),
    containerRef,
    onPointerDown: handlePointerDown,
    preventClick,
    isInitialized,
  };
}
