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
});
