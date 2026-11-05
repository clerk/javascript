'use client';
import * as React from 'react';

const DRAG_THRESHOLD = 4;
const FRICTION = 0.94;
const MIN_VELOCITY = 0.15;
const scrollableAncestor = (start: EventTarget | null): HTMLElement => {
  let element = start instanceof HTMLElement ? start : null;
  while (element && element !== document.body && element !== document.documentElement) {
    const { overflowY } = getComputedStyle(element);
    if ((overflowY === 'auto' || overflowY === 'scroll') && element.scrollHeight > element.clientHeight) {
      return element;
    }
    element = element.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
};
const subscribeNothing = () => () => {};
export function useTouchParam() {
  return React.useSyncExternalStore(
    subscribeNothing,
    () => new URLSearchParams(window.location.search).get('touch') === '1',
    () => false,
  );
}
export function useQueryParam(name: string) {
  return React.useSyncExternalStore(
    subscribeNothing,
    () => new URLSearchParams(window.location.search).get(name),
    () => null,
  );
}
export function TouchMode() {
  React.useEffect(() => {
    if (new URLSearchParams(window.location.search).get('touch') !== '1') {
      return;
    }
    const style = document.createElement('style');
    style.textContent =
      '*, *::before, *::after { cursor: none !important; scrollbar-width: none !important; } *::-webkit-scrollbar { display: none !important; } html { user-select: none; }';
    document.head.appendChild(style);

    const dot = document.createElement('div');
    dot.setAttribute('aria-hidden', 'true');
    Object.assign(dot.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: '44px',
      height: '44px',
      margin: '-22px 0 0 -22px',
      borderRadius: '50%',
      border: '1.5px solid rgba(255,255,255,0.6)',
      background: 'rgba(128,128,128,0.3)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
      pointerEvents: 'none',
      zIndex: '2147483647',
      opacity: '0',
      transition: 'opacity 150ms ease, scale 120ms ease',
    });
    document.body.appendChild(dot);

    let scroller: HTMLElement | null = null;
    let pressed = false;
    let dragging = false;
    let startY = 0;
    let startScroll = 0;
    let lastY = 0;
    let lastTime = 0;
    let velocity = 0;
    let frame = 0;

    const stopMomentum = () => cancelAnimationFrame(frame);
    const glide = () => {
      if (!scroller || Math.abs(velocity) < MIN_VELOCITY) {
        return;
      }
      scroller.scrollTop += velocity;
      velocity *= FRICTION;
      frame = requestAnimationFrame(glide);
    };
    const place = (event: PointerEvent) => {
      dot.style.translate = `${event.clientX}px ${event.clientY}px`;
      dot.style.opacity = '1';
    };
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || event.button !== 0) {
        return;
      }
      stopMomentum();
      pressed = true;
      dragging = false;
      scroller = scrollableAncestor(event.target);
      startY = lastY = event.clientY;
      startScroll = scroller.scrollTop;
      lastTime = performance.now();
      velocity = 0;
      dot.style.scale = '0.8';
      place(event);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        return;
      }
      place(event);
      if (!pressed || !scroller) {
        return;
      }
      if (!dragging && Math.abs(event.clientY - startY) > DRAG_THRESHOLD) {
        dragging = true;
      }
      if (!dragging) {
        return;
      }
      const now = performance.now();
      const elapsed = Math.max(now - lastTime, 1);
      velocity = ((lastY - event.clientY) / elapsed) * 16;
      lastY = event.clientY;
      lastTime = now;
      scroller.scrollTop = startScroll - (event.clientY - startY);
    };
    const onUp = () => {
      if (!pressed) {
        return;
      }
      pressed = false;
      dot.style.scale = '1';
      if (dragging) {
        frame = requestAnimationFrame(glide);
      }
    };
    const onClick = (event: MouseEvent) => {
      if (dragging) {
        event.stopPropagation();
        event.preventDefault();
        dragging = false;
      }
    };
    const onLeave = () => {
      dot.style.opacity = '0';
    };

    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerup', onUp, true);
    document.addEventListener('pointercancel', onUp, true);
    document.addEventListener('click', onClick, true);
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      stopMomentum();
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('pointermove', onMove, true);
      document.removeEventListener('pointerup', onUp, true);
      document.removeEventListener('pointercancel', onUp, true);
      document.removeEventListener('click', onClick, true);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      style.remove();
      dot.remove();
    };
  }, []);
  return null;
}
