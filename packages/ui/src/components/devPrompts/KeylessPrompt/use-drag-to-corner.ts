import type { PointerEventHandler } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const STORAGE_KEY = 'clerk-keyless-prompt-corner';
const LERP_FACTOR = 0.15;
const INERTIA_MULTIPLIER = 8;
const CORNER_OFFSET = '1.25rem';
const DRAG_THRESHOLD = 5;

interface Position {
  x: number;
  y: number;
}

interface UseDragToCornerResult {
  corner: Corner;
  isDragging: boolean;
  style: React.CSSProperties;
  containerRef: React.RefObject<HTMLDivElement>;
  onPointerDown: PointerEventHandler;
  preventClick: boolean;
}

const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

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

const getCornerPositionInPixels = (corner: Corner, elementWidth: number, elementHeight: number): Position => {
  const offset = 20;
  switch (corner) {
    case 'top-left':
      return { x: offset, y: offset };
    case 'top-right':
      return { x: window.innerWidth - elementWidth - offset, y: offset };
    case 'bottom-left':
      return { x: offset, y: window.innerHeight - elementHeight - offset };
    case 'bottom-right':
      return { x: window.innerWidth - elementWidth - offset, y: window.innerHeight - elementHeight - offset };
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

export const useDragToCorner = (): UseDragToCornerResult => {
  const [corner, setCorner] = useState<Corner>(loadCornerPreference);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStyle, setDragStyle] = useState<React.CSSProperties>({});
  const [preventClick, setPreventClick] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const targetPosRef = useRef<Position>({ x: 0, y: 0 });
  const currentPosRef = useRef<Position>({ x: 0, y: 0 });
  const lastPosRef = useRef<Position>({ x: 0, y: 0 });
  const velocityRef = useRef<Position>({ x: 0, y: 0 });
  const startPosRef = useRef<Position>({ x: 0, y: 0 });
  const startOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const lastTimeRef = useRef<number>(0);
  const hasStartedDraggingRef = useRef<boolean>(false);

  const animate = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const current = currentPosRef.current;
    const target = targetPosRef.current;

    current.x = lerp(current.x, target.x, LERP_FACTOR);
    current.y = lerp(current.y, target.y, LERP_FACTOR);

    const now = performance.now();
    const deltaTime = Math.max(now - lastTimeRef.current, 1);
    const deltaX = current.x - lastPosRef.current.x;
    const deltaY = current.y - lastPosRef.current.y;

    velocityRef.current.x = deltaX / (deltaTime / 16.67);
    velocityRef.current.y = deltaY / (deltaTime / 16.67);

    lastPosRef.current.x = current.x;
    lastPosRef.current.y = current.y;
    lastTimeRef.current = now;

    // Direct DOM manipulation instead of setState
    container.style.position = 'fixed';
    container.style.left = `${current.x}px`;
    container.style.top = `${current.y}px`;
    container.style.transition = 'none';

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const handlePointerDown: PointerEventHandler = useCallback(
    e => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.closest('a')) {
        return;
      }

      const container = containerRef.current;
      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;

      startPosRef.current = { x: startX, y: startY };
      startOffsetRef.current = { x: rect.left, y: rect.top };
      currentPosRef.current = { x: rect.left, y: rect.top };
      targetPosRef.current = { x: rect.left, y: rect.top };
      lastPosRef.current = { x: rect.left, y: rect.top };
      velocityRef.current = { x: 0, y: 0 };
      lastTimeRef.current = performance.now();
      hasStartedDraggingRef.current = false;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const deltaX = moveEvent.clientX - startPosRef.current.x;
        const deltaY = moveEvent.clientY - startPosRef.current.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (!hasStartedDraggingRef.current && distance < DRAG_THRESHOLD) {
          return;
        }

        if (!hasStartedDraggingRef.current) {
          hasStartedDraggingRef.current = true;
          setIsDragging(true);
          animationFrameRef.current = requestAnimationFrame(animate);
        }

        moveEvent.preventDefault();
        targetPosRef.current = {
          x: startOffsetRef.current.x + deltaX,
          y: startOffsetRef.current.y + deltaY,
        };
      };

      const handlePointerUp = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);

        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        if (hasStartedDraggingRef.current) {
          setIsDragging(false);
          setPreventClick(true);

          const current = currentPosRef.current;
          const velocity = velocityRef.current;
          const projectedX = current.x + velocity.x * INERTIA_MULTIPLIER;
          const projectedY = current.y + velocity.y * INERTIA_MULTIPLIER;

          const newCorner = getCornerFromPosition(projectedX, projectedY);

          const rect = container.getBoundingClientRect();
          const targetPos = getCornerPositionInPixels(newCorner, rect.width, rect.height);

          setDragStyle({
            position: 'fixed',
            left: `${targetPos.x}px`,
            top: `${targetPos.y}px`,
            transition: 'all 400ms cubic-bezier(0.2, 0, 0.2, 1)',
          });

          setCorner(newCorner);
          saveCornerPreference(newCorner);

          transitionTimeoutRef.current = window.setTimeout(() => {
            setDragStyle({});
            setPreventClick(false);
            // Clear inline styles to return to React-controlled positioning
            if (container) {
              container.style.position = '';
              container.style.left = '';
              container.style.top = '';
              container.style.transition = '';
            }
          }, 400);
        }

        hasStartedDraggingRef.current = false;
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp, { once: true });
    },
    [animate],
  );

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (transitionTimeoutRef.current !== null) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const style = useMemo<React.CSSProperties>(
    () => ({
      ...getCornerStyles(corner),
      ...dragStyle,
      transition: isDragging ? 'none' : dragStyle.transition || 'all 250ms cubic-bezier(0.2, 0, 0.2, 1)',
    }),
    [corner, isDragging, dragStyle],
  );

  return {
    corner,
    isDragging,
    style,
    containerRef,
    onPointerDown: handlePointerDown,
    preventClick,
  };
};
