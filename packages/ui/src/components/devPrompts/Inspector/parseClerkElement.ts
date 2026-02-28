const CLASS_PREFIX = 'cl-';
const EMOJI_SEPARATOR = '\u{1F512}';
const INTERNAL_CLASS_PREFIX = 'cl-internal-';

export interface InspectedData {
  publicClasses: string[];
  stateClasses: string[];
  localizationKey: string | null;
  element: HTMLElement;
}

/**
 * Parses a DOM element to extract Clerk public classnames and localization keys.
 * Returns null if the element is not a Clerk-customizable element.
 */
export function parseClerkElement(target: HTMLElement): InspectedData | null {
  const element = findClerkElement(target);
  if (!element) {
    return null;
  }

  const className = element.className;
  // Split on the emoji separator — everything before is public
  const publicPart = className.includes(EMOJI_SEPARATOR) ? className.split(EMOJI_SEPARATOR)[0] : className;

  const tokens = publicPart.split(/\s+/).filter(Boolean);
  const publicClasses: string[] = [];
  const stateClasses: string[] = [];

  const stateNames = new Set(['cl-loading', 'cl-error', 'cl-open', 'cl-active', 'cl-required']);

  for (const token of tokens) {
    if (!token.startsWith(CLASS_PREFIX) || token.startsWith(INTERNAL_CLASS_PREFIX)) {
      continue;
    }
    if (stateNames.has(token)) {
      stateClasses.push(token);
    } else {
      publicClasses.push(token);
    }
  }

  if (publicClasses.length === 0) {
    return null;
  }

  const localizationKey = findLocalizationKey(element);

  return {
    publicClasses,
    stateClasses,
    localizationKey,
    element,
  };
}

/**
 * Walks up from the target to find the nearest element whose className contains `cl-`.
 */
function findClerkElement(target: HTMLElement): HTMLElement | null {
  let el: HTMLElement | null = target;
  while (el) {
    if (typeof el.className === 'string' && el.className.includes(CLASS_PREFIX)) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

/**
 * Checks the element and its children for a `data-localization-key` attribute.
 */
function findLocalizationKey(element: HTMLElement): string | null {
  // Check the element itself first
  const key = element.getAttribute('data-localization-key');
  if (key) {
    return key;
  }

  // Check direct children
  const child = element.querySelector('[data-localization-key]');
  if (child) {
    return child.getAttribute('data-localization-key');
  }

  return null;
}
