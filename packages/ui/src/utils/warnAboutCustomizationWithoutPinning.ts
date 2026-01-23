import { logger } from '@clerk/shared/logger';
import type { ClerkOptions } from '@clerk/shared/types';

import { CLERK_CLASS_RE, HAS_RE, POSITIONAL_PSEUDO_RE } from './cssPatterns';
import { detectStructuralClerkCss } from './detectClerkStylesheetUsage';

function formatStructuralCssWarning(patterns: string[]): string {
  const patternsDisplay = patterns.length > 0 ? patterns.slice(0, 3).join(', ') : 'structural CSS';
  const truncated = patterns.length > 3 ? ` (+${patterns.length - 3} more)` : '';

  return (
    `🔒 Clerk:\n` +
    `[CLERK_W001] Structural CSS detected\n\n` +
    `Found: ${patternsDisplay}${truncated}\n\n` +
    `May break on updates. Pin your version:\n` +
    `  npm install @clerk/ui && import { ui } from '@clerk/ui'\n` +
    `  <ClerkProvider ui={ui} />\n\n` +
    `https://clerk.com/docs/customization/versioning\n` +
    `(This notice only appears in development)`
  );
}

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
 * Recursively collects structural selectors from a CSS-in-JS value.
 */
function collectStructuralSelectors(value: unknown): string[] {
  if (!value || typeof value !== 'object') {
    return [];
  }

  const selectors: string[] = [];

  for (const [key, nestedValue] of Object.entries(value)) {
    // Check if this key is a structural selector
    if (isStructuralSelector(key)) {
      selectors.push(key);
    }

    // Recursively check nested objects
    selectors.push(...collectStructuralSelectors(nestedValue));
  }

  return selectors;
}

/**
 * Collects structural CSS patterns from appearance.elements.
 * Returns patterns in format: elements.{key} "{selector}"
 */
function collectElementPatterns(elements: Record<string, unknown>): string[] {
  const patterns: string[] = [];

  for (const [elementKey, value] of Object.entries(elements)) {
    // String values (classNames) are safe - no structural assumptions
    if (typeof value === 'string') {
      continue;
    }

    // Collect structural selectors from CSS objects
    const selectors = collectStructuralSelectors(value);
    for (const selector of selectors) {
      patterns.push(`elements.${elementKey} "${selector}"`);
    }
  }

  return patterns;
}

/**
 * Warns users when they are using customization
 * (structural appearance.elements or structural CSS targeting .cl- classes)
 * without pinning their @clerk/ui version.
 *
 * Note: The caller should check clerk.instanceType === 'development' before calling.
 * This function assumes it's only called in development mode.
 *
 * If the user has explicitly imported @clerk/ui and passed it via the `ui` option,
 * they have "pinned" their version and no warning is shown.
 *
 * Note: We check `options.ui` (not `options.ClerkUI`) because ClerkUI is
 * always set when loading from CDN via window.__internal_ClerkUICtor.
 */
export function warnAboutCustomizationWithoutPinning(options?: ClerkOptions): void {
  // If ui is explicitly provided, the user has pinned their version
  if (options?.ui) {
    return;
  }

  const patterns: string[] = [];

  // Collect patterns from appearance.elements
  const appearance = options?.appearance;
  if (appearance?.elements && Object.keys(appearance.elements).length > 0) {
    patterns.push(...collectElementPatterns(appearance.elements as Record<string, unknown>));
  }

  // Collect patterns from stylesheets
  const structuralCssHits = detectStructuralClerkCss();
  for (const hit of structuralCssHits) {
    patterns.push(`CSS "${hit.selector}"`);
  }

  if (patterns.length > 0) {
    logger.warnOnce(formatStructuralCssWarning(patterns));
  }
}
