/**
 * Temporarily forces flex/grid alignment properties to `initial` so the
 * element's content height can be measured accurately.
 *
 * When a panel uses `display: flex` or `display: grid` with a non-default
 * `justify-content` / `align-items` / `align-content` / `justify-items`, the
 * alignment can make `scrollHeight`/`scrollWidth` report a value smaller than
 * the true content size. Resetting these to `initial` before measuring avoids
 * that distortion.
 *
 * The original inline values are restored on the next animation frame so the
 * forced-initial layout never flashes. The returned cleanup cancels that
 * scheduled restore and reapplies the original values immediately — call it
 * from the effect cleanup so a re-run before the frame fires doesn't leak the
 * forced styles.
 *
 * @param element - The element being measured.
 * @returns A cleanup function that cancels the scheduled restore and restores
 * the original inline layout styles immediately.
 */
export function resetLayoutStyles(element: HTMLElement): () => void {
  const originalLayoutStyles = {
    'justify-content': element.style.justifyContent,
    'align-items': element.style.alignItems,
    'align-content': element.style.alignContent,
    'justify-items': element.style.justifyItems,
  };

  Object.keys(originalLayoutStyles).forEach(key => {
    element.style.setProperty(key, 'initial', 'important');
  });

  function restore() {
    Object.entries(originalLayoutStyles).forEach(([key, value]) => {
      if (value === '') {
        element.style.removeProperty(key);
        return;
      }
      element.style.setProperty(key, value);
    });
  }

  const frame = requestAnimationFrame(restore);

  return () => {
    cancelAnimationFrame(frame);
    restore();
  };
}
