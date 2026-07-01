import { describe, expect, it } from 'vitest';

import type { RichText } from './index';
import { formatToParts, getMessageFormatParts, messageFormat } from './index';

const rich = (tpl: string): RichText => {
  const marker = messageFormat(tpl);
  return marker.fn('en', marker.template);
};

describe('getMessageFormatParts', () => {
  it('returns a single text part when there are no tokens', () => {
    expect(getMessageFormatParts('hello')).toEqual([{ type: 'text', value: 'hello' }]);
  });

  it('parses variables, paired markup, and standalone markup', () => {
    expect(getMessageFormatParts('Hi {$name}, {#b}bold{/b} {#br/}')).toEqual([
      { type: 'text', value: 'Hi ' },
      { type: 'string', name: 'name' },
      { type: 'text', value: ', ' },
      { type: 'markup', kind: 'open', name: 'b' },
      { type: 'text', value: 'bold' },
      { type: 'markup', kind: 'close', name: 'b' },
      { type: 'text', value: ' ' },
      { type: 'markup', kind: 'standalone', name: 'br' },
    ]);
  });
});

describe('messageFormat (string path)', () => {
  it('substitutes string variables', () => {
    expect(rich('Hi {$name}')({ name: 'Sam' })).toBe('Hi Sam');
  });

  it('wraps paired markup with its handler', () => {
    expect(rich('{#b}x{/b}')({ b: inner => `<b>${inner}</b>` })).toBe('<b>x</b>');
  });

  it('keeps inner content when a markup handler is absent', () => {
    expect(rich('a {#b}x{/b} b')()).toBe('a x b');
  });

  it('calls standalone markup handlers', () => {
    expect(rich('a{#br/}b')({ br: () => '<br>' })).toBe('a<br>b');
  });

  it('substitutes variables inside markup', () => {
    expect(rich('{#b}{$name}{/b}')({ name: 'Sam', b: inner => `*${inner}*` })).toBe('*Sam*');
  });

  it('handles nested markup', () => {
    const out = rich('{#b}{#i}x{/i}{/b}')({
      b: inner => `<b>${inner}</b>`,
      i: inner => `<i>${inner}</i>`,
    });
    expect(out).toBe('<b><i>x</i></b>');
  });

  it('exposes the parsed parts on the message', () => {
    expect(rich('hi {$name}').parts).toEqual([
      { type: 'text', value: 'hi ' },
      { type: 'string', name: 'name' },
    ]);
  });

  it('skips a stray close tag with no matching open', () => {
    expect(rich('a{/b}c')()).toBe('ac');
  });

  it('drops standalone markup when its handler is absent', () => {
    expect(rich('a{#br/}b')()).toBe('ab');
  });

  it('substitutes a missing variable with an empty string', () => {
    expect(rich('Hi {$name}')()).toBe('Hi ');
  });

  it('handles markup nested three levels deep', () => {
    const out = rich('{#a}{#b}{#c}x{/c}{/b}{/a}')({
      a: inner => `[a${inner}]`,
      b: inner => `[b${inner}]`,
      c: inner => `[c${inner}]`,
    });
    expect(out).toBe('[a[b[cx]]]');
  });
});

describe('formatToParts', () => {
  it('substitutes values into text and leaves markup structural', () => {
    expect(formatToParts(rich('Hi {$name}, {#b}bold{/b}'), { name: 'Sam' })).toEqual([
      { type: 'text', value: 'Hi ' },
      { type: 'text', value: 'Sam' },
      { type: 'text', value: ', ' },
      { type: 'markup', kind: 'open', name: 'b' },
      { type: 'text', value: 'bold' },
      { type: 'markup', kind: 'close', name: 'b' },
    ]);
  });

  it('renders missing values as empty strings', () => {
    expect(formatToParts(rich('Hi {$name}'))).toEqual([
      { type: 'text', value: 'Hi ' },
      { type: 'text', value: '' },
    ]);
  });
});
