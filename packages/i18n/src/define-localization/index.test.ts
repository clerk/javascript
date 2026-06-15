import { describe, expect, it } from 'vitest';

import { defineLocalization } from './index';

describe('defineLocalization', () => {
  it('passes a nested form through to the normalized shape', () => {
    expect(
      defineLocalization({
        signIn: { title: 'Log in', subtitle: 'Welcome' },
        apiKeys: { action__add: 'New key' },
      }),
    ).toEqual({
      signIn: { title: 'Log in', subtitle: 'Welcome' },
      apiKeys: { action__add: 'New key' },
    });
  });

  it('expands a flat form by splitting on the first dot', () => {
    expect(
      defineLocalization({
        'signIn.title': 'Log in',
        'apiKeys.action__add': 'New key',
      }),
    ).toEqual({
      signIn: { title: 'Log in' },
      apiKeys: { action__add: 'New key' },
    });
  });

  it('keeps everything after the first dot as the key', () => {
    expect(defineLocalization({ 'signIn.start.title': 'Log in' })).toEqual({
      signIn: { 'start.title': 'Log in' },
    });
  });

  it('merges multiple flat keys into the same namespace', () => {
    expect(
      defineLocalization({
        'signIn.title': 'Log in',
        'signIn.subtitle': 'Welcome',
      }),
    ).toEqual({
      signIn: { title: 'Log in', subtitle: 'Welcome' },
    });
  });

  it('tolerates mixing nested and flat forms', () => {
    expect(
      defineLocalization({
        signIn: { title: 'Log in' },
        'signIn.subtitle': 'Welcome',
        'apiKeys.action__add': 'New key',
      }),
    ).toEqual({
      signIn: { title: 'Log in', subtitle: 'Welcome' },
      apiKeys: { action__add: 'New key' },
    });
  });

  it('passes non-string override values through verbatim', () => {
    const forms = { one: '{count} item', other: '{count} items' };
    expect(
      defineLocalization({
        common: { items: forms },
        'common.cta': { ios: 'Tap', android: 'Click' },
      }),
    ).toEqual({
      common: { items: forms, cta: { ios: 'Tap', android: 'Click' } },
    });
  });

  it('ignores dangerous prototype-polluting keys', () => {
    const before = Object.prototype.hasOwnProperty('polluted');
    defineLocalization({ __proto__: { polluted: true } } as never);
    defineLocalization({ 'constructor.polluted': true } as never);
    defineLocalization({ signIn: { __proto__: 'bad' } } as never);
    expect(Object.prototype.hasOwnProperty('polluted')).toBe(before);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});
