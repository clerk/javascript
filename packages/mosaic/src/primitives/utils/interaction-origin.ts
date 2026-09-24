/**
 * The element a user interaction is happening on behalf of, for the synchronous span of that
 * interaction. A menu item sets its menu's trigger here around the consumer's `onClick`; a
 * floating element opened during that span records it as somewhere focus can return to once its
 * own trigger is gone — the item unmounts with the menu, the trigger does not.
 *
 * Module-level on purpose: the item and the dialog it opens share no ancestor, so no context or
 * prop can carry this between them. It is only ever set inside {@link withInteractionOrigin} and
 * is cleared before that returns, so anything read after an `await` sees nothing.
 */
let origin: HTMLElement | null = null;

/** Runs `callback` with `element` as the current interaction origin, restoring the previous one after. */
export function withInteractionOrigin<T>(element: HTMLElement | null, callback: () => T): T {
  const previous = origin;
  origin = element;
  try {
    return callback();
  } finally {
    origin = previous;
  }
}

/** The element the current interaction is on behalf of, or `null` outside one. */
export function currentInteractionOrigin(): HTMLElement | null {
  return origin;
}
