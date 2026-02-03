import { logger } from '@clerk/shared/logger';
import type { ClerkOptions } from '@clerk/shared/types';

import type { Appearance } from '../internal/appearance';
import { CLERK_CLASS_RE, HAS_RE, POSITIONAL_PSEUDO_RE } from './cssPatterns';
import { detectStructuralClerkCss } from './detectClerkStylesheetUsage';

// Regex patterns for hasAdjacencyWithOtherSelector
const OTHER_SELECTOR_RE = /[.#\w\[:]/;
const CLERK_CLASS_GLOBAL_RE = /\.cl-[A-Za-z0-9_-]+/g;
const COMBINATOR_RE = /[>+~\s]/;

function formatStructuralCssWarning(patterns: string[]): string {
  const displayPatterns = patterns.slice(0, 5);
  const patternsList = displayPatterns.map(p => `  - ${p}`).join('\n');
  const truncated = patterns.length > 5 ? `\n  (+${patterns.length - 5} more)` : '';

  return [
    `Clerk: Structural CSS detected that may break on updates.`,
    ``,
    `Found:`,
    patternsList + truncated,
    ``,
    `These selectors depend on the internal DOM structure of Clerk's components, which may change when Clerk deploys component updates.`,
    `To prevent breaking changes, install @clerk/ui and pass it to ClerkProvider:`,
    ``,
    `  import { ui } from '@clerk/ui'`,
    `  <ClerkProvider ui={ui}>`,
    ``,
    `Learn more: https://clerk.com/docs/reference/components/versioning`,
    `(code=structural_css_pin_clerk_ui)`,
  ].join('\n');
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
  const hasOtherSelector = OTHER_SELECTOR_RE.test(rest.replace(CLERK_CLASS_GLOBAL_RE, ''));

  // Only structural if both a .cl- class and another selector exist
  // OR if it references a .cl- class (assumes internal structure)
  return hasClerkClass || (hasOtherSelector && COMBINATOR_RE.test(selector));
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
 * Checks component-level appearance.elements for structural CSS patterns
 * and warns if found (when version is not pinned).
 *
 * This is called when individual components mount with their own appearance,
 * to catch structural CSS that wasn't passed through ClerkProvider.
 *
 * Note: The caller should check clerk.instanceType === 'development' before calling.
 * This function assumes it's only called in development mode.
 *
 * @param appearance - The component-level appearance to check
 * @param uiPinned - Whether the user has pinned their @clerk/ui version via options.ui
 */
export function warnAboutComponentAppearance(appearance: Appearance | undefined, uiPinned: boolean): void {
  // If ui is explicitly provided, the user has pinned their version
  if (uiPinned) {
    return;
  }

  // No appearance to check
  if (!appearance?.elements || Object.keys(appearance.elements).length === 0) {
    return;
  }

  const patterns = collectElementPatterns(appearance.elements as Record<string, unknown>);

  if (patterns.length > 0) {
    logger.warnOnce(formatStructuralCssWarning(patterns));
  }
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
 * Note: We check `options.ui` (not `options.clerkUICtor`) because clerkUICtor is
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
