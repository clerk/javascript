import { describe, expectTypeOf, it } from 'vitest';

import { atom } from './atom';
import { count } from './count';
import { createI18n } from './create-i18n';
import { defineLocalization } from './define-localization';
import type { RichText } from './message-format';
import { messageFormat } from './message-format';
import { params } from './params';
import type { CountMarker, ExtractParams, OverrideValue, ParamsMarker, PluralForms } from './types';

describe('ExtractParams', () => {
  it('extracts placeholder names from a template literal', () => {
    expectTypeOf<ExtractParams<'Hi {name}, {count} left'>>().toEqualTypeOf<'name' | 'count'>();
  });

  it('is never for a template with no placeholders', () => {
    expectTypeOf<ExtractParams<'Hello there'>>().toEqualTypeOf<never>();
  });
});

describe('createI18n message inference', () => {
  const i18n = createI18n(atom('en'), { get: () => Promise.resolve({}) });

  it('maps each base value to its resolved message type', () => {
    const m = i18n('common', {
      plain: 'Hello',
      greet: params('Hi {name}'),
      items: count({ one: '{count} item', other: '{count} items' }),
      rich: messageFormat('{#b}x{/b}'),
    }).get();

    expectTypeOf(m.plain).toEqualTypeOf<string>();
    expectTypeOf(m.greet).parameter(0).toEqualTypeOf<{ name: string | number }>();
    expectTypeOf(m.items).toEqualTypeOf<(n: number) => string>();
    expectTypeOf(m.rich).toEqualTypeOf<RichText>();
  });

  it('makes the argument optional when a params template has no placeholders', () => {
    const m = i18n('common', { bare: params('Hello') }).get();
    expectTypeOf(m.bare).toMatchTypeOf<() => string>();
  });
});

describe('OverrideValue', () => {
  it('maps each base value to the override input it accepts', () => {
    expectTypeOf<OverrideValue<string>>().toEqualTypeOf<string>();
    expectTypeOf<OverrideValue<ParamsMarker<'Hi {name}'>>>().toEqualTypeOf<string>();
    expectTypeOf<OverrideValue<CountMarker>>().toEqualTypeOf<Partial<PluralForms>>();
  });
});

describe('defineLocalization typing', () => {
  type Reg = { signIn: { title: string; greet: ParamsMarker<'Hi {name}'>; items: CountMarker } };

  it('accepts a precise nested form', () => {
    defineLocalization<Reg>({
      signIn: { title: 'Log in to Acme', greet: 'Hello {name}', items: { other: '{count} things' } },
    });
  });

  it('accepts a precise flat form', () => {
    defineLocalization<Reg>({
      'signIn.title': 'Log in to Acme',
      'signIn.greet': 'Hello {name}',
      'signIn.items': { other: '{count} things' },
    });
  });

  it('rejects a wrong value type for a count key (nested)', () => {
    // @ts-expect-error a count key cannot be overridden with a bare string
    defineLocalization<Reg>({ signIn: { items: 'nope' } });
  });

  it('rejects a wrong value type for a count key (flat)', () => {
    // @ts-expect-error a count key cannot be overridden with a bare string
    defineLocalization<Reg>({ 'signIn.items': 'nope' });
  });

  it('rejects an unknown namespace (flat)', () => {
    // @ts-expect-error `other` is not a namespace in the registry
    defineLocalization<Reg>({ 'other.title': 'x' });
  });

  it('rejects an unknown key within a known namespace (flat)', () => {
    // @ts-expect-error `nope` is not a key of the signIn base
    defineLocalization<Reg>({ 'signIn.nope': 'x' });
  });

  it('compiles without a registry (loose default)', () => {
    defineLocalization({ anything: { foo: 'bar' }, 'a.b': 'c' });
  });
});
