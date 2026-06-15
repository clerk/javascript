import { allTasks } from 'nanostores';
import { describe, expect, it, vi } from 'vitest';

import { atom } from '../atom';
import { count } from '../count';
import { defineLocalization } from '../define-localization';
import { params } from '../params';
import { createI18n } from './index';

/** Let any pending microtasks/timers settle. */
const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));

describe('createI18n', () => {
  it('returns base (en) messages without fetching', () => {
    const get = vi.fn();
    const i18n = createI18n(atom('en'), { get });
    const $msg = i18n('common', { hi: 'Hello', greet: params('Hi {name}') });

    const m = $msg.get();
    expect(m.hi).toBe('Hello');
    expect(m.greet({ name: 'Sam' })).toBe('Hi Sam');
    expect(get).not.toHaveBeenCalled();
  });

  it('fetches a non-base locale and applies its overrides', async () => {
    const get = vi.fn(() => Promise.resolve({ common: { hi: 'Bonjour', greet: 'Salut {name}' } }));
    const $locale = atom('en');
    const i18n = createI18n($locale, { get });
    const $msg = i18n('common', { hi: 'Hello', greet: params('Hi {name}') });

    $locale.set('fr');
    expect($msg.get().hi).toBe('Hello'); // base until the data lands

    await flush();
    expect(get).toHaveBeenCalledWith('fr');
    expect($msg.get().hi).toBe('Bonjour');
    expect($msg.get().greet({ name: 'Sam' })).toBe('Salut Sam');
  });

  // Regression: a namespace missing from the loaded locale data must fall back
  // to base and trigger exactly one fetch. The previous implementation fetched
  // inside the computed and looped forever in this case.
  it('falls back to base for a namespace absent from the locale, fetching once', async () => {
    const get = vi.fn(() => Promise.resolve({ other: { x: 'y' } })); // no `common` namespace
    const $locale = atom('en');
    const i18n = createI18n($locale, { get });
    const $msg = i18n('common', { hi: 'Hello' });

    $msg.subscribe(vi.fn()); // active subscriber — a loop would hang here

    $locale.set('fr');
    await flush();
    await flush();

    expect(get).toHaveBeenCalledTimes(1);
    expect($msg.get().hi).toBe('Hello');
  });

  it('selects plural forms with count', () => {
    const i18n = createI18n(atom('en'), { get: vi.fn() });
    const $msg = i18n('common', { items: count({ one: '{count} item', other: '{count} items' }) });

    expect($msg.get().items(1)).toBe('1 item');
    expect($msg.get().items(5)).toBe('5 items');
  });

  // Snapshot identity must be stable across reads when nothing changed, otherwise
  // `useSyncExternalStore` (which reads `get()` before subscribing) loops forever.
  it('returns a referentially stable snapshot until an input changes', () => {
    const $locale = atom('en');
    const $overrides = atom(defineLocalization({}));
    const i18n = createI18n($locale, { get: vi.fn(), overrides: $overrides });
    const $msg = i18n('common', { hi: 'Hello' });

    expect($msg.get()).toBe($msg.get()); // stable across repeated reads

    const before = $msg.get();
    $overrides.set(defineLocalization({ 'common.hi': 'Hey' }));
    const after = $msg.get();
    expect(after).not.toBe(before); // new reference once an input changes
    expect(after.hi).toBe('Hey');
    expect($msg.get()).toBe(after); // and stable again
  });

  it('seeds messages from cache without fetching', () => {
    const get = vi.fn();
    const i18n = createI18n(atom('fr'), { get, cache: { fr: { common: { hi: 'Bonjour' } } } });
    const $msg = i18n('common', { hi: 'Hello' });

    expect($msg.get().hi).toBe('Bonjour');
    expect(get).not.toHaveBeenCalled();
  });

  // Per-key fallback: a fetched locale that supplies a namespace but omits a
  // single key must fall back to base for just that key.
  it('falls back to base for a key absent from a present namespace', async () => {
    const get = vi.fn(() => Promise.resolve({ common: { hi: 'Bonjour' } })); // no `bye` key
    const $locale = atom('en');
    const i18n = createI18n($locale, { get });
    const $msg = i18n('common', { hi: 'Hello', bye: 'Goodbye' });

    $locale.set('fr');
    await flush();
    expect($msg.get().hi).toBe('Bonjour'); // from locale
    expect($msg.get().bye).toBe('Goodbye'); // from base
  });

  describe('load failures', () => {
    // A failed load must be handled internally — never surfaced as an unhandled
    // rejection. `allTasks()` (awaited during SSR) must still settle, and the
    // standing locale subscription must not leak the rejection to the runtime.
    it('handles a failed load without leaking an unhandled rejection (SSR-safe)', async () => {
      const onUnhandled = vi.fn();
      process.on('unhandledRejection', onUnhandled);
      try {
        const get = vi.fn(() => Promise.reject(new Error('boom')));
        createI18n(atom('fr'), { get });

        await expect(allTasks()).resolves.toBeUndefined();
        await flush(); // let any unhandled rejection surface
        expect(get).toHaveBeenCalledWith('fr');
        expect(onUnhandled).not.toHaveBeenCalled();
      } finally {
        process.off('unhandledRejection', onUnhandled);
      }
    });

    // A transient failure must not permanently poison a locale: a later switch
    // back to it has to retry rather than reuse the dead promise.
    it('retries a failed locale on a later switch', async () => {
      const get = vi
        .fn()
        .mockRejectedValueOnce(new Error('network'))
        .mockResolvedValueOnce({ common: { hi: 'Bonjour' } });
      const $locale = atom('en');
      const i18n = createI18n($locale, { get });
      const $msg = i18n('common', { hi: 'Hello' });
      $msg.subscribe(vi.fn()); // keep the computed live

      $locale.set('fr');
      await flush();
      expect($msg.get().hi).toBe('Hello'); // failed load -> base fallback

      $locale.set('en');
      $locale.set('fr'); // switch back: must retry, not reuse the dead promise
      await flush();
      expect(get).toHaveBeenCalledTimes(2);
      expect($msg.get().hi).toBe('Bonjour');
    });
  });

  describe('loading', () => {
    it('flips i18n.loading true during a fetch and false after it settles', async () => {
      let resolve!: (v: { common: { hi: string } }) => void;
      const get = vi.fn(() => new Promise<{ common: { hi: string } }>(r => (resolve = r)));
      const $locale = atom('en');
      const i18n = createI18n($locale, { get });

      expect(i18n.loading.get()).toBe(false);
      $locale.set('fr');
      expect(i18n.loading.get()).toBe(true); // fetch scheduled synchronously

      resolve({ common: { hi: 'Bonjour' } });
      await flush();
      expect(i18n.loading.get()).toBe(false);
    });

    it('resets loading to false after a failed load', async () => {
      const get = vi.fn(() => Promise.reject(new Error('boom')));
      const i18n = createI18n(atom('fr'), { get }); // non-base locale fetches on creation

      expect(i18n.loading.get()).toBe(true);
      await flush();
      expect(i18n.loading.get()).toBe(false);
    });
  });

  describe('params(count(...))', () => {
    it('selects a plural form and substitutes both {count} and named params', () => {
      const i18n = createI18n(atom('en'), { get: vi.fn() });
      const $msg = i18n('pagination', {
        page: params<{ category: string }>(
          count({ one: 'One page in {category}', other: '{count} pages in {category}' }),
        ),
      });

      const m = $msg.get();
      expect(m.page(1, { category: 'robots' })).toBe('One page in robots');
      expect(m.page(5, { category: 'robots' })).toBe('5 pages in robots');
    });

    it('accepts a partial plural-forms override', () => {
      const $overrides = atom(defineLocalization({ pagination: { page: { other: '{count} pages → {category}' } } }));
      const i18n = createI18n(atom('en'), { get: vi.fn(), overrides: $overrides });
      const $msg = i18n('pagination', {
        page: params<{ category: string }>(
          count({ one: 'One page in {category}', other: '{count} pages in {category}' }),
        ),
      });

      expect($msg.get().page(2, { category: 'bots' })).toBe('2 pages → bots');
    });
  });

  describe('baseLocale', () => {
    it('treats a custom baseLocale as the no-fetch locale', () => {
      const get = vi.fn();
      const i18n = createI18n(atom('ru'), { get, baseLocale: 'ru' });
      const $msg = i18n('common', { hi: 'Privet' });

      expect($msg.get().hi).toBe('Privet');
      expect(get).not.toHaveBeenCalled();
    });

    it('fetches a non-base locale when baseLocale is customized', async () => {
      const get = vi.fn(() => Promise.resolve({ common: { hi: 'Hello' } }));
      const i18n = createI18n(atom('en'), { get, baseLocale: 'ru' });
      i18n('common', { hi: 'Privet' });

      await flush();
      expect(get).toHaveBeenCalledWith('en');
    });
  });

  describe('overrides', () => {
    it('applies overrides on top of base (no fetch)', () => {
      const get = vi.fn();
      const $overrides = atom(defineLocalization({ 'common.hi': 'Hey' }));
      const i18n = createI18n(atom('en'), { get, overrides: $overrides });
      const $msg = i18n('common', { hi: 'Hello' });

      expect($msg.get().hi).toBe('Hey');
      expect(get).not.toHaveBeenCalled();
    });

    it('wins over the fetched locale', async () => {
      const get = vi.fn(() => Promise.resolve({ common: { hi: 'Bonjour' } }));
      const $locale = atom('en');
      const $overrides = atom(defineLocalization({ common: { hi: 'Salut Acme' } }));
      const i18n = createI18n($locale, { get, overrides: $overrides });
      const $msg = i18n('common', { hi: 'Hello' });

      $locale.set('fr');
      await flush();
      expect($msg.get().hi).toBe('Salut Acme'); // override beats locale
    });

    it('reacts to override store changes', () => {
      const $overrides = atom(defineLocalization({ 'common.hi': 'Hey' }));
      const i18n = createI18n(atom('en'), { get: vi.fn(), overrides: $overrides });
      const $msg = i18n('common', { hi: 'Hello' });
      $msg.subscribe(vi.fn()); // active subscriber so the computed stays live

      expect($msg.get().hi).toBe('Hey');
      $overrides.set(defineLocalization({ 'common.hi': 'Howdy' }));
      expect($msg.get().hi).toBe('Howdy');
    });

    it('overrides a params message with a new template', () => {
      const $overrides = atom(defineLocalization({ 'common.greet': 'Hello {name}!' }));
      const i18n = createI18n(atom('en'), { get: vi.fn(), overrides: $overrides });
      const $msg = i18n('common', { greet: params('Hi {name}') });

      expect($msg.get().greet({ name: 'Sam' })).toBe('Hello Sam!');
    });

    it('overrides a count message with a partial set of plural forms', () => {
      const $overrides = atom(defineLocalization({ common: { items: { other: '{count} things' } } }));
      const i18n = createI18n(atom('en'), { get: vi.fn(), overrides: $overrides });
      const $msg = i18n('common', { items: count({ one: '{count} item', other: '{count} items' }) });

      expect($msg.get().items(1)).toBe('1 item'); // untouched form falls back to base
      expect($msg.get().items(5)).toBe('5 things'); // overridden form
    });

    it('falls back to base/locale for namespaces without an override', () => {
      const $overrides = atom(defineLocalization({ 'other.x': 'Y' }));
      const i18n = createI18n(atom('en'), { get: vi.fn(), overrides: $overrides });
      const $msg = i18n('common', { hi: 'Hello' });

      expect($msg.get().hi).toBe('Hello');
    });
  });
});
