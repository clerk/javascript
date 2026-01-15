import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { detectStructuralClerkCss } from '../detectClerkStylesheetUsage';

// Helper to create a mock CSSStyleRule
function createMockStyleRule(selectorText: string, cssText?: string): CSSStyleRule {
  return {
    type: CSSRule.STYLE_RULE,
    selectorText,
    cssText: cssText ?? `${selectorText} { }`,
  } as CSSStyleRule;
}

// Helper to create a mock CSSStyleSheet
function createMockStyleSheet(rules: CSSRule[], href: string | null = null): CSSStyleSheet {
  return {
    href,
    cssRules: rules as unknown as CSSRuleList,
  } as CSSStyleSheet;
}

describe('detectStructuralClerkCss', () => {
  let originalStyleSheets: StyleSheetList;

  beforeEach(() => {
    originalStyleSheets = document.styleSheets;
  });

  afterEach(() => {
    Object.defineProperty(document, 'styleSheets', {
      value: originalStyleSheets,
      configurable: true,
    });
  });

  function mockStyleSheets(sheets: CSSStyleSheet[]) {
    Object.defineProperty(document, 'styleSheets', {
      value: sheets,
      configurable: true,
    });
  }

  describe('should NOT flag simple .cl- class styling', () => {
    test('single .cl- class with styles', () => {
      mockStyleSheets([createMockStyleSheet([createMockStyleRule('.cl-button', '.cl-button { color: red; }')])]);

      const hits = detectStructuralClerkCss();
      expect(hits).toHaveLength(0);
    });

    test('.cl- class with pseudo-class like :hover', () => {
      mockStyleSheets([
        createMockStyleSheet([createMockStyleRule('.cl-button:hover', '.cl-button:hover { opacity: 0.8; }')]),
      ]);

      const hits = detectStructuralClerkCss();
      expect(hits).toHaveLength(0);
    });

    test('.cl- class with pseudo-element like ::before', () => {
      mockStyleSheets([
        createMockStyleSheet([createMockStyleRule('.cl-card::before', '.cl-card::before { content: ""; }')]),
      ]);

      const hits = detectStructuralClerkCss();
      expect(hits).toHaveLength(0);
    });
  });

  describe('should flag structural patterns', () => {
    test('.cl- class with descendant selector', () => {
      mockStyleSheets([
        createMockStyleSheet([createMockStyleRule('.cl-card .inner', '.cl-card .inner { padding: 10px; }')]),
      ]);

      const hits = detectStructuralClerkCss();
      expect(hits).toHaveLength(1);
      expect(hits[0].selector).toBe('.cl-card .inner');
      expect(hits[0].reason).toContain('descendant(combinator)');
    });

    test('descendant with .cl- class on right side', () => {
      mockStyleSheets([
        createMockStyleSheet([
          createMockStyleRule('.my-wrapper .cl-button', '.my-wrapper .cl-button { color: blue; }'),
        ]),
      ]);

      const hits = detectStructuralClerkCss();
      expect(hits).toHaveLength(1);
      expect(hits[0].reason).toContain('descendant(combinator)');
    });

    test('.cl- class with child combinator', () => {
      mockStyleSheets([createMockStyleSheet([createMockStyleRule('.cl-card > div', '.cl-card > div { margin: 0; }')])]);

      const hits = detectStructuralClerkCss();
      expect(hits).toHaveLength(1);
      expect(hits[0].reason).toContain('combinator(>+~)');
    });

    test('multiple .cl- classes in selector', () => {
      mockStyleSheets([createMockStyleSheet([createMockStyleRule('.cl-card .cl-button', '.cl-card .cl-button { }')])]);

      const hits = detectStructuralClerkCss();
      expect(hits).toHaveLength(1);
      expect(hits[0].reason).toContain('multiple-clerk-classes');
    });

    test('tag coupled with .cl- class', () => {
      mockStyleSheets([createMockStyleSheet([createMockStyleRule('div.cl-button', 'div.cl-button { }')])]);

      const hits = detectStructuralClerkCss();
      expect(hits).toHaveLength(1);
      expect(hits[0].reason).toContain('tag+cl-class');
    });

    test('positional pseudo-selector with .cl- class', () => {
      mockStyleSheets([
        createMockStyleSheet([createMockStyleRule('.cl-item:first-child', '.cl-item:first-child { }')]),
      ]);

      const hits = detectStructuralClerkCss();
      expect(hits).toHaveLength(1);
      expect(hits[0].reason).toContain('positional-pseudo');
    });

    test(':nth-child with .cl- class', () => {
      mockStyleSheets([
        createMockStyleSheet([createMockStyleRule('.cl-item:nth-child(2)', '.cl-item:nth-child(2) { }')]),
      ]);

      const hits = detectStructuralClerkCss();
      expect(hits).toHaveLength(1);
      expect(hits[0].reason).toContain('positional-pseudo');
    });

    test(':has() selector with .cl- class', () => {
      mockStyleSheets([
        createMockStyleSheet([createMockStyleRule('.cl-card:has(.active)', '.cl-card:has(.active) { }')]),
      ]);

      const hits = detectStructuralClerkCss();
      expect(hits).toHaveLength(1);
      expect(hits[0].reason).toContain(':has()');
    });

    test('sibling combinator with .cl- class', () => {
      mockStyleSheets([
        createMockStyleSheet([createMockStyleRule('.cl-input + .cl-error', '.cl-input + .cl-error { }')]),
      ]);

      const hits = detectStructuralClerkCss();
      expect(hits).toHaveLength(1);
      expect(hits[0].reason).toContain('combinator(>+~)');
    });
  });

  describe('should handle multiple stylesheets', () => {
    test('returns hits from all stylesheets', () => {
      mockStyleSheets([
        createMockStyleSheet([createMockStyleRule('.cl-card > div')]),
        createMockStyleSheet([createMockStyleRule('.cl-button .icon')]),
      ]);

      const hits = detectStructuralClerkCss();
      expect(hits).toHaveLength(2);
    });

    test('includes stylesheet href in hits', () => {
      mockStyleSheets([
        createMockStyleSheet([createMockStyleRule('.cl-card > div')], 'https://example.com/styles.css'),
      ]);

      const hits = detectStructuralClerkCss();
      expect(hits[0].stylesheetHref).toBe('https://example.com/styles.css');
    });
  });

  describe('should handle CORS-blocked stylesheets gracefully', () => {
    test('skips stylesheets that throw on cssRules access', () => {
      const blockedSheet = {
        href: 'https://external.com/styles.css',
        get cssRules() {
          throw new DOMException('Blocked', 'SecurityError');
        },
      } as CSSStyleSheet;

      mockStyleSheets([blockedSheet, createMockStyleSheet([createMockStyleRule('.cl-card > div')])]);

      const hits = detectStructuralClerkCss();
      expect(hits).toHaveLength(1);
    });
  });

  describe('should handle comma-separated selectors', () => {
    test('analyzes each selector in a list', () => {
      mockStyleSheets([
        createMockStyleSheet([createMockStyleRule('.cl-button, .cl-card > div', '.cl-button, .cl-card > div { }')]),
      ]);

      const hits = detectStructuralClerkCss();
      // Only ".cl-card > div" should be flagged, not ".cl-button"
      expect(hits).toHaveLength(1);
      expect(hits[0].selector).toBe('.cl-card > div');
    });
  });
});
