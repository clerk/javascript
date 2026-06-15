import { describe, expect, it, vi } from 'vitest';

import { atom } from '../atom';
import { count } from '../count';
import { createI18n } from '../create-i18n';
import { messageFormat } from '../message-format';
import { params } from '../params';
import { messagesToJSON } from './index';

describe('messagesToJSON', () => {
  it('serializes every marker kind back to raw JSON', () => {
    const i18n = createI18n(atom('en'), { get: vi.fn() });
    const $a = i18n('a', {
      hi: 'Hello',
      greet: params('Hi {name}'),
      items: count({ one: '{count} item', other: '{count} items' }),
      page: params<{ category: string }>(count({ one: 'One in {category}', other: '{count} in {category}' })),
      notice: messageFormat('Read the {#a}terms{/a}'),
      nested: { title: 'T' },
    });

    expect(messagesToJSON($a)).toEqual({
      a: {
        hi: 'Hello',
        greet: 'Hi {name}',
        items: { one: '{count} item', other: '{count} items' },
        page: { one: 'One in {category}', other: '{count} in {category}' },
        notice: 'Read the {#a}terms{/a}',
        nested: { title: 'T' },
      },
    });
  });

  it('merges multiple namespaces', () => {
    const i18n = createI18n(atom('en'), { get: vi.fn() });
    const $a = i18n('a', { x: 'X' });
    const $b = i18n('b', { y: 'Y' });

    expect(messagesToJSON($a, $b)).toEqual({ a: { x: 'X' }, b: { y: 'Y' } });
  });

  it('does not pollute Object.prototype when namespace is a dangerous key', () => {
    const i18n = createI18n(atom('en'), { get: vi.fn() });
    const $store = i18n('__proto__', { polluted: 'bad' });
    const before = Object.prototype.hasOwnProperty('polluted');
    messagesToJSON($store);
    expect(Object.prototype.hasOwnProperty('polluted')).toBe(before);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});
