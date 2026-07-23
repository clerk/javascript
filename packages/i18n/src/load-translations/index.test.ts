import { describe, expect, it, vi } from 'vitest';

import { atom } from '../atom';
import { createI18n } from '../create-i18n';
import { loadTranslations } from './index';

describe('loadTranslations', () => {
  it('awaits an in-flight non-base load and returns the resolved snapshot', async () => {
    const get = vi.fn(() => Promise.resolve({ common: { hi: 'Bonjour' } }));
    const i18n = createI18n(atom('fr'), { get });
    const $messages = i18n('common', { hi: 'Hello' });

    const t = await loadTranslations($messages);
    expect(t.hi).toBe('Bonjour');
  });

  it('returns base immediately when nothing is loading', async () => {
    const i18n = createI18n(atom('en'), { get: vi.fn() });
    const $messages = i18n('common', { hi: 'Hello' });

    expect(await loadTranslations($messages)).toEqual({ hi: 'Hello' });
  });
});
