import { describe, expect, it } from 'vitest';

import { getLocalization } from '../i18n/server';

describe('getLocalization', () => {
  it('returns the default locale with no messages when acceptLanguage is null', async () => {
    const result = await getLocalization(null);
    expect(result).toEqual({ locale: 'en', initialMessages: {} });
  });

  it('matches the default locale via base tag (en-US → en)', async () => {
    const result = await getLocalization('en-US');
    expect(result).toEqual({ locale: 'en', initialMessages: {} });
  });

  it('picks the highest-priority match (en-US,fr → en, not fr)', async () => {
    const result = await getLocalization('en-US,fr;q=0.9');
    expect(result.locale).toBe('en');
  });

  it('loads french messages when locale is fr', async () => {
    const result = await getLocalization('fr');
    expect(result.locale).toBe('fr');
    expect(result.initialMessages).toHaveProperty('fr');
    expect(result.initialMessages.fr).toBeTruthy();
  });

  it('matches a supported locale via base tag (fr-FR → fr)', async () => {
    const result = await getLocalization('fr-FR');
    expect(result.locale).toBe('fr');
  });

  it('falls back to the default locale for an unsupported language', async () => {
    const result = await getLocalization('de');
    expect(result).toEqual({ locale: 'en', initialMessages: {} });
  });
});
