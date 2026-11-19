'use client';

import * as React from 'react';

import { baseHeightMs, type MotionConfig } from '@/lib/motion';

const ROOT_SELECTOR = '.cl-flow-root';

function readHeight(root: HTMLElement) {
  return Number.parseFloat(root.style.getPropertyValue('--cl-flow-step-height'));
}

function retimeHeightTransition(root: HTMLElement, duration: number) {
  root.getAnimations().forEach(animation => {
    if (animation instanceof CSSTransition && animation.transitionProperty === 'height') {
      animation.effect?.updateTiming({ duration });
    }
  });
}

export function useHeightScale(config: MotionConfig) {
  const { fullAt, minScale, heightAware } = config;
  const baseMs = baseHeightMs(config);

  React.useEffect(() => {
    if (!heightAware) {
      return;
    }

    const heights = new WeakMap<HTMLElement, number>();
    document.querySelectorAll<HTMLElement>(ROOT_SELECTOR).forEach(root => {
      const height = readHeight(root);
      if (!Number.isNaN(height)) {
        heights.set(root, height);
      }
    });

    const observer = new MutationObserver(records => {
      for (const record of records) {
        const root = record.target;
        if (!(root instanceof HTMLElement) || !root.matches(ROOT_SELECTOR)) {
          continue;
        }
        const height = readHeight(root);
        const previous = heights.get(root);
        if (Number.isNaN(height) || height === previous) {
          continue;
        }
        heights.set(root, height);
        if (previous === undefined) {
          continue;
        }
        const progress = Math.min(1, Math.abs(height - previous) / fullAt);
        root.style.setProperty('--motion-p', String(progress));
        retimeHeightTransition(root, baseMs * (minScale + (1 - minScale) * progress));
      }
    });

    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['style'] });
    return () => {
      observer.disconnect();
      document.querySelectorAll<HTMLElement>(ROOT_SELECTOR).forEach(root => root.style.removeProperty('--motion-p'));
    };
  }, [heightAware, fullAt, minScale, baseMs]);
}
