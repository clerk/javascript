import { describe, expect, it } from 'vitest';

import { htmlSafeJson } from '../htmlSafeJson';

describe('htmlSafeJson', () => {
  it('escapes </script> breakout sequences so they cannot terminate a script element', () => {
    const payload = { bio: '</script><script>alert(1)</script>' };
    const out = htmlSafeJson(payload);

    expect(out).not.toContain('</');
    expect(out).not.toContain('<');
    expect(out).not.toContain('>');
    expect(out).not.toContain('/');
    expect(JSON.parse(out)).toEqual(payload);
  });

  it('escapes U+2028 and U+2029 line terminators', () => {
    const payload = { sep: '  ' };
    const out = htmlSafeJson(payload);

    expect(out).toContain('\\u2028');
    expect(out).toContain('\\u2029');
    expect(out).not.toContain(' ');
    expect(out).not.toContain(' ');
    expect(JSON.parse(out)).toEqual(payload);
  });

  it('round-trips arbitrary nested values', () => {
    const payload = { a: 1, b: 'plain', c: { d: ['x', '</script>', null] }, e: true };
    expect(JSON.parse(htmlSafeJson(payload))).toEqual(payload);
  });

  it('returns "undefined" when JSON.stringify yields undefined', () => {
    expect(htmlSafeJson(undefined)).toBe('undefined');
    expect(htmlSafeJson(() => {})).toBe('undefined');
  });
});
