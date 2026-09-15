import { useSafeLayoutEffect } from '@clerk/shared/react';
import { useRef } from 'react';

import { durationVars, easingVars } from '../tokens.stylex';

const DURATION = durationVars['--cl-duration-slow'];
const EASING = easingVars['--cl-ease-enter'];

function measureChildren(container: HTMLElement | null) {
  const rects = new Map<Element, DOMRect>();
  if (container) {
    for (const child of Array.from(container.children)) {
      rects.set(child, child.getBoundingClientRect());
    }
  }
  return rects;
}

function readToken(element: Element, reference: string) {
  const name = reference.match(/^var\((--[\w-]+)\)$/)?.[1];
  return name ? getComputedStyle(element).getPropertyValue(name).trim() : '';
}

function toMilliseconds(time: string) {
  if (time.endsWith('ms')) {
    return Number.parseFloat(time);
  }
  if (time.endsWith('s')) {
    return Number.parseFloat(time) * 1000;
  }
  return Number.NaN;
}

/**
 * Slides a container's children from their old position to their new one whenever `order` changes
 * (a FLIP animation). Attach the returned ref to the container. Keyed children keep their DOM
 * nodes across a reorder, so each node's rect is read before the commit and again after it, and the
 * difference plays as a Web Animations API `transform` animation at the Mosaic `slow` duration and
 * `enter` easing, read from the container's computed style. Skipped under `prefers-reduced-motion`.
 */
export function useFlipReorder<T extends HTMLElement>(order: readonly string[]) {
  const ref = useRef<T>(null);
  const key = JSON.stringify(order);
  const renderedKey = useRef(key);
  const before = useRef<Map<Element, DOMRect> | null>(null);

  if (key !== renderedKey.current) {
    renderedKey.current = key;
    before.current = measureChildren(ref.current);
  }

  useSafeLayoutEffect(() => {
    const snapshot = before.current;
    const container = ref.current;
    before.current = null;
    if (!snapshot || !container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const moves: Array<{ child: HTMLElement; x: number; y: number }> = [];
    for (const child of Array.from(container.children)) {
      const first = snapshot.get(child);
      if (!first || !(child instanceof HTMLElement)) {
        continue;
      }
      const last = child.getBoundingClientRect();
      const x = first.left - last.left;
      const y = first.top - last.top;
      if (x !== 0 || y !== 0) {
        moves.push({ child, x, y });
      }
    }
    if (moves.length === 0) {
      return undefined;
    }
    const duration = toMilliseconds(readToken(container, DURATION));
    const easing = readToken(container, EASING);
    if (!(duration > 0) || !easing) {
      return undefined;
    }

    const animations = moves.map(({ child, x, y }) =>
      child.animate([{ transform: `translate(${x}px, ${y}px)` }, { transform: 'none' }], { duration, easing }),
    );
    return () => {
      for (const animation of animations) {
        animation.cancel();
      }
    };
  }, [key]);

  return ref;
}
