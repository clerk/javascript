import { warnings } from '@clerk/shared/internal/clerk-js/warnings';
import { logger } from '@clerk/shared/logger';
import type { ClerkOptions } from '@clerk/shared/types';

import { CLERK_CLASS_RE, HAS_RE, POSITIONAL_PSEUDO_RE } from './cssPatterns';
import { detectStructuralClerkCss } from './detectClerkStylesheetUsage';

/**
 * Checks if a CSS-in-JS selector has adjacency with another selector.
 * For nested selectors like "& > .foo" or "& .cl-something", we check if
 * there's a .cl- class combined with another selector via combinator/descendant.
 */
function hasAdjacencyWithOtherSelector(selector: string): boolean {
  // Remove the leading "&" to analyze the rest
  const rest = selector.replace(/^&\s*/, '');

  // Check if there's a .cl- class in the selector
  const hasClerkClass = CLERK_CLASS_RE.test(rest);

  // Check if there's another selector (class, tag, id, attribute)
  const hasOtherSelector = /[.#\w\[:]/.test(rest.replace(/\.cl-[A-Za-z0-9_-]+/g, ''));

  // Only structural if both a .cl- class and another selector exist
  // OR if it references a .cl- class (assumes internal structure)
  return hasClerkClass || (hasOtherSelector && /[>+~\s]/.test(selector));
}

/**
 * Checks if a CSS-in-JS selector key indicates structural DOM assumptions.
 */
function isStructuralSelector(selector: string): boolean {
  // Only analyze nested selectors (those starting with &)
  if (!selector.startsWith('&')) {
    return false;
  }

  // Check for references to .cl- classes (assumes internal structure)
  if (CLERK_CLASS_RE.test(selector)) {
    return true;
  }

  // Check for positional pseudo-selectors
  if (POSITIONAL_PSEUDO_RE.test(selector)) {
    return true;
  }

  // Check for :has()
  if (HAS_RE.test(selector)) {
    return true;
  }

  // Check for combinators/descendants only if there's adjacency with another selector
  if (hasAdjacencyWithOtherSelector(selector)) {
    return true;
  }

  return false;
}

/**
 * Recursively checks if a CSS-in-JS value contains structural selectors.
 */
function hasStructuralSelectors(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    // Check if this key is a structural selector
    if (isStructuralSelector(key)) {
      return true;
    }

    // Recursively check nested objects
    if (hasStructuralSelectors(nestedValue)) {
      return true;
    }
  }

  return false;
}

/**
 * Detects if appearance.elements contains structural CSS patterns.
 */
function hasStructuralElementsUsage(elements: Record<string, unknown>): boolean {
  for (const value of Object.values(elements)) {
    // String values (classNames) are safe - no structural assumptions
    if (typeof value === 'string') {
      continue;
    }

    // Check CSS objects for structural selectors
    if (hasStructuralSelectors(value)) {
      return true;
    }
  }

  return false;
}

/**
 * Warns users when they are using customization
 * (structural appearance.elements or structural CSS targeting .cl- classes)
 * without pinning their @clerk/ui version.
 *
 * Note: The caller should check clerk.instanceType === 'development' before calling.
 * This function assumes it's only called in development mode.
 *
 * If the user has explicitly imported @clerk/ui and passed it via clerkUiCtor,
 * they have "pinned" their version and no warning is shown.
 */
export function warnAboutCustomizationWithoutPinning(options?: ClerkOptions): void {
  // If clerkUiCtor is set, the user has explicitly imported @clerk/ui (pinned version)
  if (options?.clerkUiCtor) {
    return;
  }

  const appearance = options?.appearance;
  const hasStructuralElements =
    appearance?.elements &&
    Object.keys(appearance.elements).length > 0 &&
    hasStructuralElementsUsage(appearance.elements as Record<string, unknown>);

  // Early return if we already found structural usage - no need to scan stylesheets
  if (hasStructuralElements) {
    logger.warnOnce(warnings.advancedCustomizationWithoutVersionPinning);
    return;
  }

  // Only scan stylesheets if appearance.elements didn't trigger warning
  const structuralCssHits = detectStructuralClerkCss();

  if (structuralCssHits.length > 0) {
    logger.warnOnce(warnings.advancedCustomizationWithoutVersionPinning);
  }
}
