import { useEffect } from 'react';

/**
 * Warns in development when a part that renders `role="dialog"` has no accessible name.
 *
 * An overlay's name comes from a `Title` part, which reports itself to its root through an
 * effect — so `aria-labelledby` is legitimately absent on the commit that mounts the surface.
 * Two consequences, both load-bearing:
 *
 * - it has to read the DOM after mount rather than the root's state at render, since the
 *   `hasTitle` flag starts `false` and a render-time check would warn on every correct overlay;
 * - it has to be deferred by a task even then, for the same reason one commit later.
 *
 * `role` is checked rather than assumed because the part may be rendered as something else
 * through `render`, and only a dialog needs a name badly enough to warn about. Both dialog roles
 * count: `alertdialog` is the same surface asking more urgently, and an unnamed one is worse, not
 * exempt.
 *
 * @param node - The element carrying `role="dialog"`, once mounted.
 * @param component - Compound component name, used to name the parts in the message.
 */
export function useAccessibleNameWarning(node: HTMLElement | null, component: string): void {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !node) {
      return;
    }

    const timer = setTimeout(() => {
      const role = node.getAttribute('role');
      if (!node.isConnected || (role !== 'dialog' && role !== 'alertdialog')) {
        return;
      }
      if (node.getAttribute('aria-label')?.trim()) {
        return;
      }
      // RESOLVED, not merely present. `Dialog` emits `aria-labelledby` unconditionally, so with no
      // `Dialog.Title` the attribute points at an id that is not in the document — which names the
      // dialog exactly as poorly as having no attribute at all, and is what a presence check would
      // wave through. `Popover` omits the attribute instead, so resolving covers both shapes.
      const labelledBy = node.getAttribute('aria-labelledby');
      const named = labelledBy
        ?.split(/\s+/)
        .filter(Boolean)
        .some(id => node.ownerDocument.getElementById(id)?.textContent?.trim());
      if (named) {
        return;
      }
      console.warn(
        `[clerk] <${component}.Popup> renders a dialog with no accessible name. Pass \`aria-label\`, or render a \`<${component}.Title>\` inside it.`,
      );
    }, 0);

    return () => clearTimeout(timer);
  }, [node, component]);
}
