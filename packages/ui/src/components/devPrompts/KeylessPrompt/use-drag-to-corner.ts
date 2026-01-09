import type { PointerEventHandler } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const STORAGE_KEY = 'clerk-keyless-prompt-corner';
const LERP_FACTOR = 0.15; // Smooth trailing effect
const INERTIA_MULTIPLIER = 8; // Velocity projection multiplier
const CORNER_OFFSET = '1.25rem';
const DRAG_THRESHOLD = 5; // Minimum pixels to move before starting drag

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
  preventClick: boolean; // Flag to prevent click events after drag
}

// Lerp utility for smooth interpolation
const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

// Determine corner based on position relative to viewport center
const getCornerFromPosition = (x: number, y: number): Corner => {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const isLeft = x < centerX;
  const isTop = y < centerY;

  if (isTop && isLeft) return 'top-left';
  if (isTop && !isLeft) return 'top-right';
  if (!isTop && isLeft) return 'bottom-left';
  return 'bottom-right';
};

// Get CSS styles for a corner position
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

// Get corner position in pixels (for smooth transition)
const getCornerPositionInPixels = (corner: Corner, elementWidth: number, elementHeight: number): Position => {
  const offset = 20; // 1.25rem ≈ 20px
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

// Load corner preference from localStorage
const loadCornerPreference = (): Corner => {
  if (typeof window === 'undefined') return 'bottom-right';
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

// Save corner preference to localStorage
const saveCornerPreference = (corner: Corner): void => {
  if (typeof window === 'undefined') return;
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
  const targetPosRef = useRef<Position>({ x: 0, y: 0 });
  const currentPosRef = useRef<Position>({ x: 0, y: 0 });
  const lastPosRef = useRef<Position>({ x: 0, y: 0 });
  const velocityRef = useRef<Position>({ x: 0, y: 0 });
  const startPosRef = useRef<Position>({ x: 0, y: 0 });
  const startOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const lastTimeRef = useRef<number>(0);
  const hasStartedDraggingRef = useRef<boolean>(false);

  // Animation loop for lerp-based dragging
  const animate = useCallback(() => {
    const current = currentPosRef.current;
    const target = targetPosRef.current;

    // Lerp current position towards target
    current.x = lerp(current.x, target.x, LERP_FACTOR);
    current.y = lerp(current.y, target.y, LERP_FACTOR);

    // Calculate velocity from position delta
    const now = performance.now();
    const deltaTime = Math.max(now - lastTimeRef.current, 1); // Prevent division by zero
    const deltaX = current.x - lastPosRef.current.x;
    const deltaY = current.y - lastPosRef.current.y;

    velocityRef.current.x = deltaX / (deltaTime / 16.67); // Normalize to 60fps
    velocityRef.current.y = deltaY / (deltaTime / 16.67);

    lastPosRef.current = { ...current };
    lastTimeRef.current = now;

    // Update position style
    setDragStyle({
      position: 'fixed',
      left: `${current.x}px`,
      top: `${current.y}px`,
      transition: 'none', // No transition during drag
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Start drag
  const handlePointerDown: PointerEventHandler = useCallback(
    e => {
      // Only allow dragging on the button/header area, not on links
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.closest('a')) {
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;

      // Initialize positions
      startPosRef.current = { x: startX, y: startY };
      startOffsetRef.current = { x: rect.left, y: rect.top };
      currentPosRef.current = { x: rect.left, y: rect.top };
      targetPosRef.current = { x: rect.left, y: rect.top };
      lastPosRef.current = { x: rect.left, y: rect.top };
      velocityRef.current = { x: 0, y: 0 };
      lastTimeRef.current = performance.now();
      hasStartedDraggingRef.current = false;

      // Handle pointer move
      const handlePointerMove = (moveEvent: PointerEvent) => {
        const deltaX = moveEvent.clientX - startPosRef.current.x;
        const deltaY = moveEvent.clientY - startPosRef.current.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Only start dragging if moved beyond threshold
        if (!hasStartedDraggingRef.current && distance < DRAG_THRESHOLD) {
          return;
        }

        if (!hasStartedDraggingRef.current) {
          // Start dragging now
          hasStartedDraggingRef.current = true;
          setIsDragging(true);
          // Start animation loop
          animationFrameRef.current = requestAnimationFrame(animate);
        }

        moveEvent.preventDefault();
        targetPosRef.current = {
          x: startOffsetRef.current.x + deltaX,
          y: startOffsetRef.current.y + deltaY,
        };
      };

      // Handle pointer up
      const handlePointerUp = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);

        // Stop animation loop
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        // Only process drag end if we actually started dragging
        if (hasStartedDraggingRef.current) {
          setIsDragging(false);
          setPreventClick(true);

          // Project final position with inertia
          const current = currentPosRef.current;
          const velocity = velocityRef.current;
          const projectedX = current.x + velocity.x * INERTIA_MULTIPLIER;
          const projectedY = current.y + velocity.y * INERTIA_MULTIPLIER;

          // Determine target corner
          const newCorner = getCornerFromPosition(projectedX, projectedY);

          // Get the target corner position in pixels for smooth transition
          const rect = container.getBoundingClientRect();
          const targetPos = getCornerPositionInPixels(newCorner, rect.width, rect.height);

          // Animate to corner position smoothly
          setDragStyle({
            position: 'fixed',
            left: `${targetPos.x}px`,
            top: `${targetPos.y}px`,
            transition: 'all 400ms cubic-bezier(0.2, 0, 0.2, 1)', // Smooth ease-in-out
          });

          // Update corner and save preference
          setCorner(newCorner);
          saveCornerPreference(newCorner);

          // After transition completes, switch to corner-based positioning
          setTimeout(() => {
            setDragStyle({});
            setPreventClick(false);
          }, 400); // Match transition duration
        }

        hasStartedDraggingRef.current = false;
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp, { once: true });
    },
    [animate],
  );

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Combine corner styles with drag styles
  const style: React.CSSProperties = {
    ...getCornerStyles(corner),
    ...dragStyle, // Always apply dragStyle (empty when not dragging/snapping)
    transition: isDragging ? 'none' : dragStyle.transition || 'all 250ms cubic-bezier(0.2, 0, 0.2, 1)', // Use dragStyle transition if present
  };

  return {
    corner,
    isDragging,
    style,
    containerRef,
    onPointerDown: handlePointerDown,
    preventClick,
  };
};
