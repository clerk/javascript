import { useEffect } from 'react';

export type AccessibleNameWarningOptions = {
  /** The part, as the message names it, such as `Dialog.Popup`. */
  part: string;
  /** The roles that need a name. The check is skipped while `node` has any other role. */
  roles: readonly string[];
  /** The part that supplies the name, such as `Card.Title`. */
  title: string;
};

/**
 * Warns in development when a part that renders one of `roles` has no accessible name.
 *
 * A part's name comes from a title part, which takes the id the part points `aria-labelledby` at
 * once it mounts. The check runs a task after `node` arrives or the options change, and resolves
 * the id in the document, so a title the server rendered counts before it hydrates.
 * `role` is checked rather than assumed because the part may be rendered as something else
 * through `render`.
 *
 * @param node - The element carrying the role, once mounted. Pass `null` to skip the check.
 * @param options - The part, the roles to check, and the title part to recommend.
 */
export function useAccessibleNameWarning(
  node: HTMLElement | null,
  { part, roles, title }: AccessibleNameWarningOptions,
): void {
  const roleList = roles.join(' ');
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !node) {
      return;
    }

    const timer = setTimeout(() => {
      const role = node.getAttribute('role');
      if (!node.isConnected || role === null || !roleList.split(' ').includes(role)) {
        return;
      }
      if (node.getAttribute('aria-label')?.trim()) {
        return;
      }
      // RESOLVED, not merely present. `Dialog` and `Profile` emit `aria-labelledby` unconditionally,
      // so with no title part the attribute points at an id that is not in the document — which
      // names the part exactly as poorly as having no attribute at all, and is what a presence
      // check would wave through. `Popover` omits the attribute instead, so resolving covers both.
      const labelledBy = node.getAttribute('aria-labelledby');
      const named = labelledBy
        ?.split(/\s+/)
        .filter(Boolean)
        .some(id => node.ownerDocument.getElementById(id)?.textContent.trim());
      if (named) {
        return;
      }
      console.warn(
        `[Clerk] <${part}> renders a ${role} with no accessible name. Pass \`aria-label\`, or render a \`<${title}>\` inside it.`,
      );
    }, 0);

    return () => clearTimeout(timer);
  }, [node, part, roleList, title]);
}
