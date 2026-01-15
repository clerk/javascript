import { CLERK_ATTR_RE, CLERK_CLASS_RE, HAS_RE, POSITIONAL_PSEUDO_RE } from './cssPatterns';

type ClerkStructuralHit = {
  stylesheetHref: string | null;
  selector: string;
  cssText: string;
  reason: string[];
};

function isProbablyClerkSelector(selector: string): boolean {
  return CLERK_CLASS_RE.test(selector) || CLERK_ATTR_RE.test(selector);
}

// Split by commas safely-ish (won't perfectly handle :is(...) with commas, but good enough)
function splitSelectorList(selectorText: string): string[] {
  return selectorText
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Checks if a selector has a .cl- class combined with another selector
 * (class, tag, attribute, or pseudo) via descendant or combinator relationship.
 * Examples that match: ".cl-root .foo", ".foo .cl-root", ".cl-root > div", "div > .cl-button"
 */
function hasClerkWithAdjacency(selector: string): boolean {
  // Pattern: .cl-class followed by combinator/space and another selector
  // Or: another selector followed by combinator/space and .cl-class
  const clerkWithDescendant = /\.cl-[A-Za-z0-9_-]+[\s>+~]+[.#\w\[:]/;
  const descendantWithClerk = /[.#\w\]:][\s>+~]+\.cl-[A-Za-z0-9_-]+/;

  return clerkWithDescendant.test(selector) || descendantWithClerk.test(selector);
}

function analyzeSelector(selector: string): { structural: boolean; reason: string[] } {
  const reason: string[] = [];

  // Only flag combinators/descendants if there's a .cl- class with adjacency
  if (hasClerkWithAdjacency(selector)) {
    if (/[>+~]/.test(selector)) {
      reason.push('combinator(>+~)');
    }
    if (/\s+/.test(selector)) {
      reason.push('descendant(combinator)');
    }
  }

  if (POSITIONAL_PSEUDO_RE.test(selector)) {
    reason.push('positional-pseudo');
  }

  if (HAS_RE.test(selector)) {
    reason.push(':has()');
  }

  // Multiple clerk classes implies relationship like ".cl-a .cl-b"
  const clCount = (selector.match(/\.cl-[A-Za-z0-9_-]+/g) || []).length;
  if (clCount >= 2) {
    reason.push('multiple-clerk-classes');
  }

  // Tag coupling: tag directly attached to .cl- class (e.g., "div.cl-button")
  if (/(^|[\s>+~(])([a-z]+)\.cl-[A-Za-z0-9_-]+/i.test(selector)) {
    reason.push('tag+cl-class');
  }

  // Structural if any of the brittle indicators show up
  const structural =
    reason.includes('combinator(>+~)') ||
    reason.includes('descendant(combinator)') ||
    reason.includes('positional-pseudo') ||
    reason.includes(':has()') ||
    reason.includes('multiple-clerk-classes') ||
    reason.includes('tag+cl-class');

  return { structural, reason };
}

function safeGetCssRules(sheet: CSSStyleSheet): CSSRuleList | null {
  try {
    return sheet.cssRules;
  } catch {
    return null;
  }
}

// CSSRule.STYLE_RULE constant (value is 1) - using numeric literal for SSR/jsdom compatibility
const CSS_STYLE_RULE = 1;

function walkRules(rules: CSSRuleList, sheet: CSSStyleSheet, out: ClerkStructuralHit[]) {
  for (const rule of Array.from(rules)) {
    // Check for CSSStyleRule (type 1) using duck typing for jsdom compatibility
    if (rule.type === CSS_STYLE_RULE && 'selectorText' in rule) {
      const styleRule = rule as CSSStyleRule;
      const selectorText = styleRule.selectorText || '';
      for (const selector of splitSelectorList(selectorText)) {
        if (!isProbablyClerkSelector(selector)) {
          continue;
        }

        const { structural, reason } = analyzeSelector(selector);
        if (!structural) {
          continue;
        }

        out.push({
          stylesheetHref: sheet.href ?? null,
          selector,
          cssText: styleRule.cssText,
          reason,
        });
      }
      continue;
    }

    // Handle nested rules (@media, @supports, etc.) using duck typing
    if ('cssRules' in rule && rule.cssRules) {
      walkRules(rule.cssRules as CSSRuleList, sheet, out);
    }
  }
}

/**
 * Detects CSS rules that target Clerk's .cl- classes in a structural way
 * (using combinators, positional pseudo-selectors, :has(), etc.)
 *
 * Simple class targeting like `.cl-button { color: red; }` is NOT flagged.
 * Structural targeting like `.cl-card > .cl-button` or `div.cl-button` IS flagged.
 */
export function detectStructuralClerkCss(): ClerkStructuralHit[] {
  if (typeof document === 'undefined') {
    return [];
  }

  const hits: ClerkStructuralHit[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    const rules = safeGetCssRules(sheet);
    if (!rules) {
      continue; // cross-origin / blocked
    }
    walkRules(rules, sheet, hits);
  }
  return hits;
}
