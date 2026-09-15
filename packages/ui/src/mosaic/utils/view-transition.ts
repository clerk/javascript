import { flushSync } from 'react-dom';

const unsafeIdentChars = /[^a-zA-Z0-9_-]+/g;

/**
 * A `view-transition-name` built from the parts that identify the element. Names are
 * document-global custom idents, so every part a caller can't guarantee is a valid
 * ident — a Clerk resource id, a `useId()` — is folded down to `-`.
 */
export function viewTransitionName(...parts: Array<string | number>): string {
  return `--cl-${parts.join('-').replace(unsafeIdentChars, '-')}`;
}

export function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && typeof document.startViewTransition === 'function';
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * `::view-transition-*` pseudos are children of the document element, so they can only be
 * styled by a document-level rule — out of reach of StyleX, which styles the element it is
 * called on. A constructed stylesheet keeps that out of `<head>` and out of CSP's way
 * (nothing inline to nonce), and is adopted only while the transition it describes runs.
 */
function adoptTransitionStyles(css: string): (() => void) | null {
  if (typeof CSSStyleSheet !== 'function' || !('adoptedStyleSheets' in document)) {
    return null;
  }

  let sheet: CSSStyleSheet;
  try {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
  } catch {
    return null;
  }

  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  return () => {
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter(adopted => adopted !== sheet);
  };
}

export interface StartViewTransitionOptions {
  /** The state change to capture. Flushed synchronously so the browser snapshots it as one frame. */
  update: () => void;
  /** Rules for this transition's pseudos, adopted for as long as it runs. */
  css?: string;
}

/**
 * Runs `update` inside a view transition, or plainly when the browser has none and when the
 * user asked for reduced motion — this is pure positional change, which is the movement that
 * preference is about.
 *
 * React batches state updates, so without `flushSync` the DOM the browser captures as "after"
 * is still the "before" one.
 */
export function startViewTransition({ update, css }: StartViewTransitionOptions): ViewTransition | null {
  if (!supportsViewTransitions() || prefersReducedMotion()) {
    update();
    return null;
  }

  const release = css ? adoptTransitionStyles(css) : null;
  const transition = document.startViewTransition(() => flushSync(update));
  if (release) {
    void transition.finished.then(release, release);
  }
  return transition;
}
