import React from 'react';

/**
 * Safari crossfades its bars over ~100ms, linear, starting the frame a dialog's scrim unmounts. On
 * a phone the scrim holds until then, so this leaves a copy behind that fades on the same clock.
 * `absolute`, not `fixed`: Safari only samples fixed and sticky layers, so the copy cannot hold the
 * bar back.
 */
export function useScrimAfterglow(ref: React.RefObject<HTMLElement | null>, enabled: boolean): void {
  React.useLayoutEffect(() => {
    const element = ref.current;
    const win = element?.ownerDocument.defaultView;
    if (!enabled || !element || !win) {
      return;
    }
    const color = win.getComputedStyle(element).backgroundColor;
    return () => {
      if (
        typeof win.matchMedia !== 'function' ||
        !win.matchMedia('(width < 40rem)').matches ||
        win.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return;
      }
      const doc = win.document;
      const ghost = doc.createElement('div');
      // After every other cleanup: the scroll lock restores the page's scroll position in its own.
      queueMicrotask(() => {
        Object.assign(ghost.style, {
          position: 'absolute',
          insetInlineStart: '0',
          top: `${win.scrollY}px`,
          width: '100%',
          height: `${win.innerHeight}px`,
          backgroundColor: color,
          pointerEvents: 'none',
          zIndex: '2147483647',
        });
        doc.body.appendChild(ghost);
        // Longer than Safari's fade because its first frame paints late; measured, the two end together.
        const fade = ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, easing: 'linear' });
        void fade.finished.finally(() => ghost.remove());
      });
    };
  }, [enabled, ref]);
}
