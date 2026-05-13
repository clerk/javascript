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

const withToken = (key: string, value: string): Tokens => ({ ...tokens, [key]: value }) as unknown as Tokens;

// The parser's safety property: when rendered to HTML, the output contains
// no real elements other than <strong>. Anything else — script/img/iframe/svg/
// a/style/onerror=/javascript: — can only appear as text content, which means
// it was HTML-entity-escaped by React and is inert.
const ALLOWED_TAGS = new Set(['strong']);
const TAG_NAME_RE = /<\/?([a-zA-Z][a-zA-Z0-9-]*)/g;

const expectSafeHtml = (out: string) => {
  const matches = out.matchAll(TAG_NAME_RE);
  for (const m of matches) {
    expect(ALLOWED_TAGS, `unexpected tag <${m[1]}> in output: ${out}`).toContain(m[1].toLowerCase());
  }
};

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

describe('security — adversarial inputs', () => {
  describe('tag-name evasion', () => {
    it('rejects fullwidth Unicode angle brackets', () => {
      const out = html(applyMarkupAndTokens('＜bold＞OK＜/bold＞', tokens));
      expectSafeHtml(out);
      expect(out).not.toContain('<strong>');
    });

    it('rejects zero-width space inside opening tag', () => {
      const out = html(applyMarkupAndTokens('<​bold>OK</bold>', tokens));
      expectSafeHtml(out);
      expect(out).not.toContain('<strong>');
    });

    it.each(['<BOLD>OK</BOLD>', '<Bold>OK</Bold>', '<bOlD>OK</bOlD>'])('rejects case variant %s', input => {
      const out = html(applyMarkupAndTokens(input, tokens));
      expectSafeHtml(out);
      expect(out).not.toContain('<strong>');
    });

    it('rejects doubled angle brackets around tag', () => {
      const out = html(applyMarkupAndTokens('<<bold>>OK<</bold>>', tokens));
      expectSafeHtml(out);
    });

    it('rejects self-closing form', () => {
      const out = html(applyMarkupAndTokens('Hi <bold/>', tokens));
      expectSafeHtml(out);
      expect(out).not.toContain('<strong');
    });
  });

  describe('attribute and prop injection', () => {
    it.each([
      '<bold style="color:red">x</bold>',
      '<bold data-x="y">x</bold>',
      '<bold\t>x</bold>',
      '<bold\n>x</bold>',
      '<bold class="evil">x</bold>',
      '<bold id="evil">x</bold>',
    ])('rejects attributes/whitespace: %s', input => {
      const out = html(applyMarkupAndTokens(input, tokens));
      expectSafeHtml(out);
      expect(out).not.toContain('<strong');
    });

    it('escapes JSX-prop-shaped literal text in template', () => {
      expectSafeHtml(html(applyMarkupAndTokens('Hi" dangerouslySetInnerHTML={{__html: x}}', tokens)));
    });

    it('escapes JSX-prop-shaped token value', () => {
      const evilTokens = withToken('user.firstName', '" dangerouslySetInnerHTML={{__html:"<script>x</script>"}}');
      expectSafeHtml(html(applyMarkupAndTokens('Hi {{user.firstName}}', evilTokens)));
      expectSafeHtml(html(applyMarkupAndTokens('Hi <bold>{{user.firstName}}</bold>', evilTokens)));
    });
  });

  describe('disallowed tags must never appear', () => {
    it.each([
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      '<svg/onload=alert(1)>',
      '<a href="javascript:alert(1)">x</a>',
      '<iframe src="javascript:alert(1)"></iframe>',
      '<math><mtext></mtext></math>',
      '<base href="javascript:alert(1)">',
      '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
      '<link rel="stylesheet" href="x">',
      '<style>body{}</style>',
      '<object data="javascript:alert(1)"></object>',
      '<embed src="javascript:alert(1)">',
    ])('strips/escapes %s', input => {
      expectSafeHtml(html(applyMarkupAndTokens(input, tokens)));
    });
  });

  describe('token-value payloads', () => {
    const payloads = [
      '<script>alert(1)</script>',
      '<bold>pwned</bold>',
      'javascript:alert(1)',
      '" autofocus onfocus="alert(1)',
      '<img src=x onerror=alert(1)>',
      '</strong><script>alert(1)</script>',
      '<bold\x00>x</bold\x00>',
      '_++user.firstName++_',
      '$&',
      '$1',
      '$$',
      '<svg/onload=alert(1)>',
    ];

    it.each(payloads)('token outside bold: %s', payload => {
      const evilTokens = withToken('user.firstName', payload);
      expectSafeHtml(html(applyMarkupAndTokens('Hi {{user.firstName}}', evilTokens)));
    });

    it.each(payloads)('token inside bold: %s', payload => {
      const evilTokens = withToken('user.firstName', payload);
      expectSafeHtml(html(applyMarkupAndTokens('Hi <bold>{{user.firstName}}</bold>', evilTokens)));
    });

    it.each(payloads)('token as entire template: %s', payload => {
      const evilTokens = withToken('user.firstName', payload);
      expectSafeHtml(html(applyMarkupAndTokens('{{user.firstName}}', evilTokens)));
    });
  });

  describe('DoS shapes complete in bounded time', () => {
    it('1000 unmatched opening bold tags falls back without hanging', () => {
      const input = '<bold>'.repeat(1000) + 'x';
      const start = Date.now();
      const out = html(applyMarkupAndTokens(input, tokens));
      expect(Date.now() - start).toBeLessThan(500);
      expectSafeHtml(out);
    });

    it('1000 alternating bold pairs render as 1000 strong elements', () => {
      const input = '<bold>x</bold>'.repeat(1000);
      const start = Date.now();
      const out = html(applyMarkupAndTokens(input, tokens));
      expect(Date.now() - start).toBeLessThan(500);
      expectSafeHtml(out);
      const strongCount = (out.match(/<strong>/g) || []).length;
      expect(strongCount).toBe(1000);
    });

    it('100KB of stray < characters completes safely', () => {
      const input = '<'.repeat(100_000);
      const start = Date.now();
      const out = html(applyMarkupAndTokens(input, tokens));
      expect(Date.now() - start).toBeLessThan(500);
      expectSafeHtml(out);
      expect(out).not.toContain('<strong');
    });
  });

  describe('SSR determinism', () => {
    it('same input renders byte-for-byte identical HTML', () => {
      const template = 'Welcome to <bold>{{applicationName}}</bold>, {{user.firstName}}';
      const a = html(applyMarkupAndTokens(template, tokens));
      const b = html(applyMarkupAndTokens(template, tokens));
      expect(a).toBe(b);
    });

    it('keys remain stable across renders so React hydration is consistent', () => {
      const template = '<bold>a</bold> and <bold>b</bold> and <bold>c</bold>';
      const a = html(applyMarkupAndTokens(template, tokens));
      const b = html(applyMarkupAndTokens(template, tokens));
      expect(a).toBe(b);
    });

    it('structural identity holds whether tokens are populated or empty', () => {
      const template = 'Hi <bold>{{user.firstName}}</bold>';
      const populated = html(applyMarkupAndTokens(template, tokens));
      const empty = html(applyMarkupAndTokens(template, {} as Tokens));
      const strongCount = (s: string) => (s.match(/<strong/g) || []).length;
      expect(strongCount(populated)).toBe(strongCount(empty));
    });
  });

  describe('module state isolation', () => {
    it('regex lastIndex resets after a malformed-input early return', () => {
      // Malformed input takes the early-return fallback path.
      html(applyMarkupAndTokens('Press <bold>OK', tokens));
      // Subsequent valid input must still parse correctly.
      expect(html(applyMarkupAndTokens('Hi <bold>x</bold>', tokens))).toBe('Hi <strong>x</strong>');
    });

    it('sequential calls with mixed valid/invalid inputs all behave independently', () => {
      const inputs = [
        'Hi <bold>a</bold>',
        'Press <bold>OK',
        'plain text',
        '<bold>b</bold><bold>c</bold>',
        'Hi {{user.firstName}}',
        '<bold>{{applicationName}}</bold>',
      ];
      for (const input of inputs) {
        expectSafeHtml(html(applyMarkupAndTokens(input, tokens)));
      }
      // After mixed inputs, the regex state must still allow correct matching.
      expect(html(applyMarkupAndTokens('<bold>final</bold>', tokens))).toBe('<strong>final</strong>');
    });
  });

  describe('absence assertion baseline', () => {
    const inputs = [
      '',
      'plain',
      '<bold>x</bold>',
      'Hi {{user.firstName}}',
      'Hi <bold>{{user.firstName}}</bold>',
      '<script>x</script>',
      '<bold onclick="x">y</bold>',
      'Press <bold>OK',
      '</bold>',
      '<bold>a<bold>b</bold>',
    ];
    it.each(inputs)('no disallowed tags in output for: %s', input => {
      expectSafeHtml(html(applyMarkupAndTokens(input, tokens)));
    });
  });
});
