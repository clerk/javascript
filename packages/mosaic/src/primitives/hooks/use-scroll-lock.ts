'use client';

import { useLayoutEffect } from 'react';

import { getComputedStyle } from '../utils/dom';

let lockCount = 0;
let unlock = (): void => {};

export function useScrollLock(enabled: boolean): void {
  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }
    lockCount += 1;
    if (lockCount === 1) {
      unlock = lockPageScroll();
    }
    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        unlock();
      }
    };
  }, [enabled]);
}

function lockPageScroll(): () => void {
  const html = document.documentElement;
  const scroller = hasOwnOverflow(html) ? html : document.body;
  if (/hidden|clip/.test(getComputedStyle(scroller).overflowY)) {
    return () => {};
  }
  const previousGutter = html.style.scrollbarGutter;
  const previousOverflow = { overflowX: scroller.style.overflowX, overflowY: scroller.style.overflowY };
  html.style.scrollbarGutter = 'stable';
  Object.assign(scroller.style, { overflowX: 'hidden', overflowY: 'hidden' });
  return () => {
    html.style.scrollbarGutter = previousGutter;
    Object.assign(scroller.style, previousOverflow);
  };
}

function hasOwnOverflow(element: Element): boolean {
  const style = getComputedStyle(element);
  return /auto|scroll|overlay|hidden|clip/.test(style.overflow + style.overflowX + style.overflowY);
}
