import React from 'react';

/**
 * Whether an element is at most `maxWidthRem` wide — the JavaScript half of a
 * `@container (max-width: …)` query, for the decisions CSS cannot make: what to render, not how
 * to paint it. Measures the element itself rather than the viewport, so it holds in a narrow
 * layout slot, an inline dialog, or a phone alike. Inclusive, like the query.
 *
 * A width of `0` is "not laid out" (hidden, or a test document), not "narrow": the last answer
 * stands. Before the first measurement the answer is `false`.
 */
export function useContainerMaxWidth(node: HTMLElement | null, maxWidthRem: number): boolean {
  const [matches, setMatches] = React.useState(false);
  React.useLayoutEffect(() => {
    if (!node || typeof ResizeObserver === 'undefined') {
      return;
    }
    const measure = () => {
      const width = node.getBoundingClientRect().width;
      if (width === 0) {
        return;
      }
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      setMatches(width <= maxWidthRem * rem);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, maxWidthRem]);
  return matches;
}
