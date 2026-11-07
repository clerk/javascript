'use client';
import * as React from 'react';

export const SCROLL_BRIDGE_MESSAGE = 'mosaic-embed-wheel';

const LINE_HEIGHT = 16;

const canScroll = (element: Element, delta: number) => {
  const { overflowY } = getComputedStyle(element);
  if (overflowY !== 'auto' && overflowY !== 'scroll') {
    return false;
  }
  if (element.scrollHeight <= element.clientHeight) {
    return false;
  }
  return delta < 0 ? element.scrollTop > 0 : element.scrollTop + element.clientHeight < element.scrollHeight - 1;
};

const hasScrollableAncestor = (start: EventTarget | null, delta: number) => {
  let element = start instanceof Element ? start : null;
  while (element) {
    if (canScroll(element, delta)) {
      return true;
    }
    element = element.parentElement;
  }
  return false;
};

export function EmbedScrollBridge() {
  React.useEffect(() => {
    if (window.parent === window) {
      return;
    }
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        return;
      }
      const delta = event.deltaMode === 1 ? event.deltaY * LINE_HEIGHT : event.deltaY;
      if (delta === 0 || hasScrollableAncestor(event.target, delta)) {
        return;
      }
      event.preventDefault();
      window.parent.postMessage({ type: SCROLL_BRIDGE_MESSAGE, deltaY: delta }, window.location.origin);
    };
    document.addEventListener('wheel', onWheel, { passive: false });
    return () => document.removeEventListener('wheel', onWheel);
  }, []);
  return null;
}

export function useEmbedScrollReceiver() {
  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== SCROLL_BRIDGE_MESSAGE) {
        return;
      }
      window.scrollBy({ top: Number(event.data.deltaY) || 0 });
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
}
