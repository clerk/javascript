import type { PointerEventHandler } from 'react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const STORAGE_KEY = 'clerk-keyless-prompt-corner';
const CORNER_OFFSET = '1.25rem';
const CORNER_OFFSET_PX = 20; // 1.25rem ≈ 20px
const DRAG_THRESHOLD = 5;
const VELOCITY_SAMPLE_INTERVAL_MS = 10;
const VELOCITY_HISTORY_SIZE = 5;
const INERTIA_DECELERATION_RATE = 0.999;

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
}

const getCornerFromPosition = (x: number, y: number): Corner => {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const isLeft = x < centerX;
  const isTop = y < centerY;

  if (isTop && isLeft) {
    return 'top-left';
  }
  if (isTop && !isLeft) {
    return 'top-right';
  }
  if (!isTop && isLeft) {
    return 'bottom-left';
  }
  return 'bottom-right';
};

const getCornerStyles = (corner: Corner): React.CSSProperties => {
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
};

const loadCornerPreference = (): Corner => {
  if (typeof window === 'undefined') {
    return 'bottom-right';
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(stored)) {
      return stored as Corner;
    }
  } catch {
    // Ignore localStorage errors
  }
  return 'bottom-right';
};

const saveCornerPreference = (corner: Corner): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, corner);
  } catch {
    // Ignore localStorage errors
  }
};

const project = (initialVelocity: number): number => {
  return ((initialVelocity / 1000) * INERTIA_DECELERATION_RATE) / (1 - INERTIA_DECELERATION_RATE);
};

const calculateVelocity = (history: Velocity[]): Point => {
  if (history.length < 2) {
    return { x: 0, y: 0 };
  }

  const oldestPoint = history[0];
  const latestPoint = history[history.length - 1];
  const timeDelta = latestPoint.timestamp - oldestPoint.timestamp;

  if (timeDelta === 0) {
    return { x: 0, y: 0 };
  }

  // Calculate pixels per millisecond
  const velocityX = (latestPoint.position.x - oldestPoint.position.x) / timeDelta;
  const velocityY = (latestPoint.position.y - oldestPoint.position.y) / timeDelta;

  // Convert to pixels per second for more intuitive values
  return { x: velocityX * 1000, y: velocityY * 1000 };
};

export const useDragToCorner = (): UseDragToCornerResult => {
  const [corner, setCorner] = useState<Corner>(loadCornerPreference);
  const [isDragging, setIsDragging] = useState(false);
  const [preventClick, setPreventClick] = useState(false);
  const pendingCornerUpdate = useRef<Corner | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const machine = useRef<{ state: 'idle' | 'press' | 'animating' } | { state: 'drag'; pointerId: number }>({
    state: 'idle',
  });

  const cleanup = useRef<(() => void) | null>(null);
  const origin = useRef<Point>({ x: 0, y: 0 });
  const translation = useRef<Point>({ x: 0, y: 0 });
  const lastTimestamp = useRef<number>(0);
  const velocities = useRef<Velocity[]>([]);

  const set = useCallback((position: Point) => {
    if (containerRef.current) {
      translation.current = position;
      containerRef.current.style.translate = `${position.x}px ${position.y}px`;
    }
  }, []);

  const getCorners = useCallback((): Record<Corner, Point> => {
    const container = containerRef.current;
    if (!container) {
      return {
        'top-left': { x: 0, y: 0 },
        'top-right': { x: 0, y: 0 },
        'bottom-left': { x: 0, y: 0 },
        'bottom-right': { x: 0, y: 0 },
      };
    }

    const offset = CORNER_OFFSET_PX;
    const triggerWidth = container.offsetWidth || 0;
    const triggerHeight = container.offsetHeight || 0;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    const getAbsolutePosition = (corner: Corner): Point => {
      const isRight = corner.includes('right');
      const isBottom = corner.includes('bottom');

      const x = isRight ? window.innerWidth - scrollbarWidth - offset - triggerWidth : offset;
      const y = isBottom ? window.innerHeight - offset - triggerHeight : offset;

      return { x, y };
    };

    const basePosition = getAbsolutePosition(corner);

    const rel = (pos: Point): Point => {
      return { x: pos.x - basePosition.x, y: pos.y - basePosition.y };
    };

    return {
      'top-left': rel(getAbsolutePosition('top-left')),
      'top-right': rel(getAbsolutePosition('top-right')),
      'bottom-left': rel(getAbsolutePosition('bottom-left')),
      'bottom-right': rel(getAbsolutePosition('bottom-right')),
    };
  }, [corner]);

  const animate = useCallback(
    (cornerTranslation: CornerTranslation) => {
      const el = containerRef.current;
      if (!el) {
        return;
      }

      const handleAnimationEnd = (e: TransitionEvent) => {
        if (e.propertyName === 'translate') {
          machine.current = { state: 'animating' };

          // Mark that we're waiting for corner update, then update corner state
          // The useLayoutEffect will reset translate once cornerStyle has been applied
          pendingCornerUpdate.current = cornerTranslation.corner;
          setCorner(cornerTranslation.corner);
          saveCornerPreference(cornerTranslation.corner);

          el.removeEventListener('transitionend', handleAnimationEnd);
        }
      };

      el.style.transition = 'translate 300ms cubic-bezier(0.2, 0, 0.2, 1)';
      el.addEventListener('transitionend', handleAnimationEnd);
      set(cornerTranslation.translation);
    },
    [set],
  );

  const cancel = useCallback(() => {
    if (machine.current.state === 'drag') {
      containerRef.current?.releasePointerCapture(machine.current.pointerId);
    }
    machine.current = machine.current.state === 'drag' ? { state: 'animating' } : { state: 'idle' };

    if (cleanup.current !== null) {
      cleanup.current();
      cleanup.current = null;
    }

    velocities.current = [];
    setIsDragging(false);
    containerRef.current?.classList.remove('dev-tools-grabbing');
    document.body.style.removeProperty('user-select');
    document.body.style.removeProperty('-webkit-user-select');
  }, []);

  // Reset translate after corner state has updated and cornerStyle has been applied
  useLayoutEffect(() => {
    if (pendingCornerUpdate.current !== null && pendingCornerUpdate.current === corner) {
      const el = containerRef.current;
      if (el && machine.current.state === 'animating') {
        translation.current = { x: 0, y: 0 };
        el.style.transition = '';
        el.style.translate = '0px 0px';
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
        return; // ignore right click
      }

      const container = containerRef.current;
      if (!container) {
        return;
      }

      origin.current = { x: e.clientX, y: e.clientY };
      machine.current = { state: 'press' };
      velocities.current = [];
      translation.current = { x: 0, y: 0 };
      lastTimestamp.current = Date.now();

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (machine.current.state === 'press') {
          const dx = moveEvent.clientX - origin.current.x;
          const dy = moveEvent.clientY - origin.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance >= DRAG_THRESHOLD) {
            machine.current = { state: 'drag', pointerId: moveEvent.pointerId };
            container.setPointerCapture(moveEvent.pointerId);
            container.classList.add('dev-tools-grabbing');
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
            setIsDragging(true);
          } else {
            return;
          }
        }

        if (machine.current.state !== 'drag') {
          return;
        }

        const currentPosition = { x: moveEvent.clientX, y: moveEvent.clientY };
        const dx = currentPosition.x - origin.current.x;
        const dy = currentPosition.y - origin.current.y;

        origin.current = currentPosition;

        const newTranslation = {
          x: translation.current.x + dx,
          y: translation.current.y + dy,
        };

        set(newTranslation);

        // Keep a history of recent positions for velocity calculation
        const now = Date.now();
        const shouldAddToHistory = now - lastTimestamp.current >= VELOCITY_SAMPLE_INTERVAL_MS;

        if (shouldAddToHistory) {
          velocities.current = [
            ...velocities.current.slice(-VELOCITY_HISTORY_SIZE + 1),
            { position: currentPosition, timestamp: now },
          ];
          lastTimestamp.current = now;
        }
      };

      const handlePointerUp = () => {
        const wasDragging = machine.current.state === 'drag';
        const velocity = calculateVelocity(velocities.current);
        cancel();

        if (wasDragging) {
          const container = containerRef.current;
          if (!container) {
            return;
          }

          const rect = container.getBoundingClientRect();
          const currentAbsoluteX = rect.left;
          const currentAbsoluteY = rect.top;

          // Project final position with inertia
          const projectedX = currentAbsoluteX + project(velocity.x);
          const projectedY = currentAbsoluteY + project(velocity.y);

          // Determine target corner based on projected position
          const newCorner = getCornerFromPosition(projectedX, projectedY);

          // Get all corner translations relative to current corner
          const allCorners = getCorners();

          // The translation to animate to is the difference between the new corner's position
          // and the current translation
          const targetTranslation = allCorners[newCorner];

          setPreventClick(true);
          animate({ corner: newCorner, translation: targetTranslation });
        }
      };

      const handleClick = (clickEvent: MouseEvent) => {
        if (machine.current.state === 'animating') {
          clickEvent.preventDefault();
          clickEvent.stopPropagation();
          machine.current = { state: 'idle' };
          container.removeEventListener('click', handleClick);
        }
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp, { once: true });
      container.addEventListener('click', handleClick);

      if (cleanup.current !== null) {
        cleanup.current();
      }

      cleanup.current = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        container.removeEventListener('click', handleClick);
      };
    },
    [cancel, set, animate, getCorners],
  );

  return {
    corner,
    isDragging,
    cornerStyle: getCornerStyles(corner),
    containerRef,
    onPointerDown: handlePointerDown,
    preventClick,
  };
};
