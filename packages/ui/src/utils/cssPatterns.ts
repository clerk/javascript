/**
 * Shared CSS selector patterns for detecting structural DOM assumptions.
 * Used by both stylesheet detection and CSS-in-JS analysis.
 */

// Matches .cl- class selectors (Clerk's internal class prefix)
export const CLERK_CLASS_RE = /\.cl-[A-Za-z0-9_-]+/;

// Matches attribute selectors targeting cl- classes (e.g., [class^="cl-"])
export const CLERK_ATTR_RE = /\[\s*class\s*(\^=|\*=|\$=)\s*["']?[^"'\]]*cl-[^"'\]]*["']?\s*\]/i;

// Positional pseudo-selectors that imply DOM shape assumptions
export const POSITIONAL_PSEUDO_RE = /:(nth-child|nth-of-type|first-child|last-child|only-child|empty)\b/i;

// :has() selector that implies DOM shape assumptions
export const HAS_RE = /:has\(/i;
