import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { Tokens } from '../applyTokensToString';
import { applyMarkupAndTokens, stripMarkup } from '../applyMarkupToNodes';

const html = (node: ReactNode) => renderToStaticMarkup(node as any);

const tokens = {
  applicationName: 'Acme',
  'user.firstName': 'Nikos',
} as unknown as Tokens;

describe('applyMarkupAndTokens', () => {
  describe('plain strings (no markup)', () => {
    it('returns empty string for undefined', () => {
      expect(applyMarkupAndTokens(undefined, tokens)).toBe('');
    });

    it('returns empty string for empty input', () => {
      expect(applyMarkupAndTokens('', tokens)).toBe('');
    });

    it('passes plain text through token substitution', () => {
      expect(applyMarkupAndTokens('Welcome to {{applicationName}}', tokens)).toBe('Welcome to Acme');
    });

    it('preserves stray angle brackets that are not allowlisted tags', () => {
      expect(html(applyMarkupAndTokens('1 < 2 and 3 > 2', tokens))).toBe('1 &lt; 2 and 3 &gt; 2');
    });

    it('preserves unknown tag names as literal text', () => {
      expect(html(applyMarkupAndTokens('Hello <script>x</script>', tokens))).toBe(
        'Hello &lt;script&gt;x&lt;/script&gt;',
      );
    });
  });

  describe('bold tag rendering', () => {
    it('wraps inner text in <strong>', () => {
      expect(html(applyMarkupAndTokens('Press <bold>OK</bold>', tokens))).toBe('Press <strong>OK</strong>');
    });

    it('supports multiple bold spans in one string', () => {
      expect(html(applyMarkupAndTokens('Open <bold>Settings</bold> then <bold>Profile</bold>', tokens))).toBe(
        'Open <strong>Settings</strong> then <strong>Profile</strong>',
      );
    });

    it('substitutes tokens inside bold content', () => {
      expect(html(applyMarkupAndTokens('Hello <bold>{{user.firstName}}</bold>', tokens))).toBe(
        'Hello <strong>Nikos</strong>',
      );
    });

    it('substitutes tokens in text outside bold', () => {
      expect(html(applyMarkupAndTokens('Welcome to {{applicationName}}, click <bold>OK</bold>', tokens))).toBe(
        'Welcome to Acme, click <strong>OK</strong>',
      );
    });
  });

  describe('security — injection resistance', () => {
    it('escapes script-like token values (no XSS via token)', () => {
      const evilTokens = { ...tokens, 'user.firstName': '<script>alert(1)</script>' } as Tokens;
      expect(html(applyMarkupAndTokens('Hi {{user.firstName}}', evilTokens))).toBe(
        'Hi &lt;script&gt;alert(1)&lt;/script&gt;',
      );
    });

    it('does not re-parse tag-like token values into elements', () => {
      const evilTokens = { ...tokens, 'user.firstName': '<bold>pwned</bold>' } as Tokens;
      expect(html(applyMarkupAndTokens('Hi {{user.firstName}}', evilTokens))).toBe('Hi &lt;bold&gt;pwned&lt;/bold&gt;');
    });

    it('does not re-parse tag-like token values when token is inside bold', () => {
      const evilTokens = { ...tokens, 'user.firstName': '<bold>pwned</bold>' } as Tokens;
      expect(html(applyMarkupAndTokens('Hello <bold>{{user.firstName}}</bold>', evilTokens))).toBe(
        'Hello <strong>&lt;bold&gt;pwned&lt;/bold&gt;</strong>',
      );
    });

    it('rejects tags with attributes (does not match)', () => {
      expect(html(applyMarkupAndTokens('Click <bold onclick="alert(1)">OK</bold>', tokens))).toBe(
        'Click &lt;bold onclick=&quot;alert(1)&quot;&gt;OK&lt;/bold&gt;',
      );
    });

    it('rejects tags with whitespace', () => {
      expect(html(applyMarkupAndTokens('Click <bold >OK</bold>', tokens))).toBe('Click &lt;bold &gt;OK&lt;/bold&gt;');
    });

    it('escapes javascript: in token values inside bold', () => {
      const evilTokens = { ...tokens, 'user.firstName': 'javascript:alert(1)' } as Tokens;
      expect(html(applyMarkupAndTokens('<bold>{{user.firstName}}</bold>', evilTokens))).toBe(
        '<strong>javascript:alert(1)</strong>',
      );
    });
  });

  describe('malformed input — safe fallback', () => {
    it('falls back to plain text for unclosed bold tag', () => {
      expect(html(applyMarkupAndTokens('Press <bold>OK', tokens))).toBe('Press &lt;bold&gt;OK');
    });

    it('falls back to plain text for stray closing tag', () => {
      expect(html(applyMarkupAndTokens('Press OK</bold>', tokens))).toBe('Press OK&lt;/bold&gt;');
    });

    it('falls back to plain text for mismatched nesting', () => {
      // Same tag self-nested without proper closing — treated as malformed.
      expect(html(applyMarkupAndTokens('<bold>a<bold>b</bold>', tokens))).toBe(
        '&lt;bold&gt;a&lt;bold&gt;b&lt;/bold&gt;',
      );
    });

    it('still applies tokens in the fallback path', () => {
      expect(html(applyMarkupAndTokens('Press <bold>{{applicationName}}', tokens))).toBe('Press &lt;bold&gt;Acme');
    });
  });
});

describe('stripMarkup', () => {
  it('removes opening and closing bold tags, preserves text', () => {
    expect(stripMarkup('Press <bold>OK</bold>')).toBe('Press OK');
  });

  it('leaves strings without markup unchanged', () => {
    expect(stripMarkup('No markup here')).toBe('No markup here');
  });

  it('does not strip non-allowlisted tags', () => {
    expect(stripMarkup('<script>x</script>')).toBe('<script>x</script>');
  });
});
