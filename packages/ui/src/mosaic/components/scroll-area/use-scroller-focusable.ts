import React from 'react';

// What the browsers themselves count as keyboard-reachable. Deliberately close to the
// canonical focusable-elements list rather than exhaustive — it decides whether the scroller
// needs a tab stop of its own, and a near-miss costs at most one redundant stop.
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'audio[controls]',
  'video[controls]',
  'details > summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Whether a scroll container needs a tab stop of its own.
 *
 * Chrome and Firefox make an overflowing scroller keyboard-focusable automatically; Safari
 * does not, so a keyboard-only user there cannot scroll the region at all (WCAG 2.1.1). This
 * reproduces the browsers' rule so the gap closes without the caller having to know about it.
 *
 * The rule is deliberately two-part: **overflowing AND containing nothing focusable.** A
 * scroller whose rows are buttons or links is already reachable — tabbing into the content
 * scrolls it — so a stop on the container would be pure noise. Chrome and Firefox make the
 * same exclusion, which means applying this everywhere (rather than sniffing for Safari)
 * matches what those browsers would have done on their own.
 *
 * Both halves are observed, not sampled once: content can grow past the threshold, and rows
 * can gain or lose interactivity, long after mount.
 */
export function useScrollerFocusable(node: HTMLElement | null, enabled: boolean): boolean {
  const [focusable, setFocusable] = React.useState(false);

  React.useEffect(() => {
    if (!enabled || !node) {
      setFocusable(false);
      return;
    }

    let observedChildren: Element[] = [];

    const sync = () => {
      const overflows = node.scrollHeight > node.clientHeight;
      const contentIsReachable = node.querySelector(FOCUSABLE_SELECTOR) !== null;
      setFocusable(overflows && !contentIsReachable);
    };

    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(node);

    // The scroller's own box resizing is only half of it — content growing past the threshold
    // leaves the scroller's box untouched, and a `MutationObserver` won't catch a purely
    // visual change like an image loading. Observing the children covers that.
    const observeChildren = () => {
      for (const child of observedChildren) {
        resizeObserver.unobserve(child);
      }
      observedChildren = Array.from(node.children);
      for (const child of observedChildren) {
        resizeObserver.observe(child);
      }
    };

    const mutationObserver = new MutationObserver(() => {
      observeChildren();
      sync();
    });
    mutationObserver.observe(node, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['contenteditable', 'controls', 'disabled', 'href', 'tabindex'],
    });

    observeChildren();
    sync();

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [node, enabled]);

  return focusable;
}
