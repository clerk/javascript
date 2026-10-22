import type { PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useDragGesture } from '../../../hooks/useDragGesture';

export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export const STORAGE_KEY = 'clerk-keyless-prompt-corner';
const CORNER_OFFSET = '1.25rem';
const CORNER_OFFSET_PX = 20; // 1.25rem ≈ 20px
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
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  preventClick: boolean;
  isInitialized: boolean;
}

export function getNearestCorner(projectedTranslation: Point, corners: Record<Corner, Point>): Corner {
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

export function getCornerStyles(corner: Corner): React.CSSProperties {
  switch (corner) {
    case 'top-left':
      // eslint-disable-next-line -- Corner positioning should not be affected by RTL
      return { top: CORNER_OFFSET, left: CORNER_OFFSET };
    case 'top-right':
      // eslint-disable-next-line -- Corner positioning should not be affected by RTL
      return { top: CORNER_OFFSET, right: CORNER_OFFSET };
    case 'bottom-left':
      // eslint-disable-next-line -- Corner positioning should not be affected by RTL
      return { bottom: CORNER_OFFSET, left: CORNER_OFFSET };
    case 'bottom-right':
      // eslint-disable-next-line -- Corner positioning should not be affected by RTL
      return { bottom: CORNER_OFFSET, right: CORNER_OFFSET };
  }
}

const VALID_CORNERS: Corner[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

export function saveCornerPreference(corner: Corner): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, corner);
  } catch {
    // Ignore localStorage errors
  }
}

export function project(initialVelocity: number): number {
  return ((initialVelocity / 1000) * INERTIA_DECELERATION_RATE) / (1 - INERTIA_DECELERATION_RATE);
}

export function calculateVelocity(history: Velocity[]): Point {
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
  const translation = useRef<Point>({ x: 0, y: 0 });
  const dragStartTranslation = useRef<Point>(ZERO_POINT);
  const lastTimestamp = useRef<number>(0);
  const velocities = useRef<Velocity[]>([]);
  const dragStartDimensions = useRef<{ width: number; height: number } | null>(null);

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

    // Use stored dimensions if available (during drag), otherwise read current dimensions
    const triggerWidth = dragStartDimensions.current?.width ?? container.offsetWidth ?? 0;
    const triggerHeight = dragStartDimensions.current?.height ?? container.offsetHeight ?? 0;
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

      // Skip animation if already at target (transitionend won't fire)
      const dx = cornerTranslation.translation.x - translation.current.x;
      const dy = cornerTranslation.translation.y - translation.current.y;
      if (Math.sqrt(dx * dx + dy * dy) < 0.5) {
        saveCornerPreference(cornerTranslation.corner);
        translation.current = ZERO_POINT;
        el.style.transition = '';
        el.style.transform = ZERO_TRANSFORM;
        setPreventClick(false);
        return;
      }

      const handleAnimationEnd = (e: TransitionEvent) => {
        // Ignore non-transform transitions (width, border-radius from Emotion CSS)
        if (e.propertyName !== 'transform') {
          return;
        }
        el.removeEventListener('transitionend', handleAnimationEnd);

        saveCornerPreference(cornerTranslation.corner);

        if (cornerTranslation.corner === corner) {
          // Same corner — clean up directly, no CSS repositioning needed
          translation.current = ZERO_POINT;
          el.style.transition = '';
          el.style.transform = ZERO_TRANSFORM;
          setPreventClick(false);
        } else {
          // Different corner — React state + layoutEffect for flash-free repositioning
          pendingCornerUpdate.current = cornerTranslation.corner;
          setCorner(cornerTranslation.corner);
        }
      };

      el.style.transition = SPRING_TRANSITION;
      el.addEventListener('transitionend', handleAnimationEnd);
      setTranslation(cornerTranslation.translation);
    },
    [setTranslation, corner],
  );

  useLayoutEffect(() => {
    if (pendingCornerUpdate.current === corner) {
      const el = containerRef.current;
      if (el) {
        translation.current = ZERO_POINT;
        el.style.transition = '';
        el.style.transform = ZERO_TRANSFORM;
        setPreventClick(false);
        pendingCornerUpdate.current = null;
      }
    }
  }, [corner]);

  const { onPointerDown } = useDragGesture({
    onDragStart: () => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      // Store dimensions at drag start to prevent issues with animating width
      dragStartDimensions.current = {
        width: container.offsetWidth,
        height: container.offsetHeight,
      };
      dragStartTranslation.current = translation.current;
      velocities.current = [];
      lastTimestamp.current = Date.now();

      // Disable all transitions during drag
      container.style.transition = 'none';
      setIsDragging(true);
    },
    onDrag: offset => {
      const position = {
        x: dragStartTranslation.current.x + offset.x,
        y: dragStartTranslation.current.y + offset.y,
      };
      setTranslation(position);

      const now = Date.now();
      if (now - lastTimestamp.current >= VELOCITY_SAMPLE_INTERVAL_MS) {
        velocities.current = [...velocities.current.slice(-VELOCITY_HISTORY_SIZE + 1), { position, timestamp: now }];
        lastTimestamp.current = now;
      }
    },
    onDragCancel: () => {
      velocities.current = [];
      dragStartDimensions.current = null;
      setIsDragging(false);
    },
    onDragEnd: () => {
      const velocity = calculateVelocity(velocities.current);
      const allCorners = getCorners();
      velocities.current = [];
      dragStartDimensions.current = null;
      setIsDragging(false);

      const projectedTranslation = {
        x: translation.current.x + project(velocity.x),
        y: translation.current.y + project(velocity.y),
      };
      const newCorner = getNearestCorner(projectedTranslation, allCorners);

      setPreventClick(true);
      animate({ corner: newCorner, translation: allCorners[newCorner] });
    },
  });

  return {
    corner,
    isDragging,
    cornerStyle: getCornerStyles(corner),
    containerRef,
    onPointerDown,
    preventClick,
    isInitialized,
  };
}
