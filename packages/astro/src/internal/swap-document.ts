const PERSIST_ATTR = 'data-astro-transition-persist';
const EMOTION_ATTR = 'data-emotion';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type SwapFunctions = typeof import('astro:transitions/client').swapFunctions;

/**
 * @internal
 * Custom swap function to make mounting and styling
 * of Clerk components work with View Transitions in Astro.
 *
 * See https://docs.astro.build/en/guides/view-transitions/#building-a-custom-swap-function
 */
export function swapDocument(swapFunctions: SwapFunctions, doc: Document) {
  swapFunctions.deselectScripts(doc);
  swapFunctions.swapRootAttributes(doc);

  // Keep the elements created by `@emotion/cache`
  const emotionElements = document.querySelectorAll(`style[${EMOTION_ATTR}]`);
  swapHeadElements(doc, Array.from(emotionElements));

  const restoreFocusFunction = swapFunctions.saveFocus();
  swapFunctions.swapBodyElement(doc.body, document.body);
  restoreFocusFunction();
}

/**
 * This function is a copy of the original `swapHeadElements` function from `astro:transitions/client`.
 * The difference is that you can pass a list of elements that should not be removed
 * in the new document.
 *
 * See https://github.com/withastro/astro/blob/d6f17044d3873df77cfbc73230cb3194b5a7d82a/packages/astro/src/transitions/swap-functions.ts#L51
 */
function swapHeadElements(doc: Document, ignoredElements: Element[]) {
  for (const el of Array.from(document.head.children)) {
    const newEl = persistedHeadElement(el, doc);

    if (newEl) {
      newEl.remove();
    } else {
      if (!ignoredElements.includes(el)) {
        el.remove();
      }
    }
  }

  document.head.append(...doc.head.children);
}

function persistedHeadElement(el: Element, newDoc: Document) {
  const id = el.getAttribute(PERSIST_ATTR);
  const newEl = id && newDoc.head.querySelector(`[${PERSIST_ATTR}="${id}"]`);
  if (newEl) {
    return newEl;
  }
  if (el.matches('link[rel=stylesheet]')) {
    const href = el.getAttribute('href');
    return newDoc.head.querySelector(`link[rel=stylesheet][href="${href}"]`);
  }
  return null;
}
