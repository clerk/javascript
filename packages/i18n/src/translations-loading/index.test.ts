import { describe, expect, it, vi } from 'vitest';

import { atom } from '../atom';
import { createI18n } from '../create-i18n';
import { translationsLoading } from './index';

describe('translationsLoading', () => {
  it('resolves immediately when nothing is loading', async () => {
    const i18n = createI18n(atom('en'), { get: vi.fn() });
    await expect(translationsLoading(i18n)).resolves.toBeUndefined();
  });

  it('resolves once an in-flight load settles', async () => {
    const get = vi.fn(() => Promise.resolve({ common: { hi: 'Bonjour' } }));
    const i18n = createI18n(atom('fr'), { get }); // fetches on creation

    expect(i18n.loading.get()).toBe(true);
    await translationsLoading(i18n);
    expect(i18n.loading.get()).toBe(false);
  });
});
