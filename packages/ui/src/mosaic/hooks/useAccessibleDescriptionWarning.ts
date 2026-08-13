import { useEffect } from 'react';

/**
 * Warns in development when an alert dialog has no accessible description.
 *
 * A name alone is enough for an ordinary dialog — the surface is there to be read, and what it
 * contains describes itself. An alert dialog is the case where it is not: it interrupts to demand
 * a decision, and a screen reader announces its description alongside its name at that moment, so
 * a title and two buttons leave the user choosing between "Cancel" and "Delete" with nothing
 * saying what is being deleted.
 *
 * Same shape as {@link useAccessibleNameWarning}, and for the same reasons — the description part
 * reports itself through an effect, so the attribute is legitimately unresolved on the commit that
 * mounts the surface and the check has to be both post-mount and deferred by a task.
 *
 * @param node - The element carrying the dialog role, once mounted.
 * @param component - Compound component name, used to name the parts in the message.
 */
export function useAccessibleDescriptionWarning(node: HTMLElement | null, component: string): void {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !node) {
      return;
    }

    const timer = setTimeout(() => {
      if (!node.isConnected) {
        return;
      }
      // RESOLVED, not merely present: the primitive emits `aria-describedby` unconditionally, so
      // with no `Description` part the attribute points at an id that is not in the document —
      // which describes the dialog exactly as poorly as having no attribute at all.
      const describedBy = node.getAttribute('aria-describedby');
      const described = describedBy
        ?.split(/\s+/)
        .filter(Boolean)
        .some(id => node.ownerDocument.getElementById(id)?.textContent?.trim());
      if (described) {
        return;
      }
      console.warn(
        `[clerk] <${component}.Popup> renders an alert dialog with no description. Render a \`<${component}.Description>\` inside it — it is announced with the title, and is what says which decision is being asked for.`,
      );
    }, 0);

    return () => clearTimeout(timer);
  }, [node, component]);
}
