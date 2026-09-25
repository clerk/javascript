import { IsoToCountryMap } from '@clerk/shared/phone';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CountryFlag, hasCountryFlag } from './country-flags';

describe('CountryFlag', () => {
  it('looks up the Figma US flag by country code', async () => {
    const { container } = render(
      <CountryFlag
        iso='us'
        aria-label='United States'
      />,
    );

    await waitFor(() => {
      expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 16 16');
      expect(container.querySelector('path[fill="#D80027"]')).not.toBeNull();
      expect(container.querySelector('path[fill="#2E52B2"]')).not.toBeNull();
    });
  });

  it('has a flag for every phone country', () => {
    for (const country of IsoToCountryMap.values()) {
      expect(hasCountryFlag(country.iso), country.name).toBe(true);
    }
  });

  it('supports uppercase country codes', () => {
    expect(hasCountryFlag('US')).toBe(true);
  });

  it.each([
    'aq',
    'bq-bo',
    'bq-sa',
    'bq-se',
    'bv',
    'cc',
    'cx',
    'es-ct',
    'eu',
    'gb-eng',
    'gb-nir',
    'gb-sct',
    'gb-wls',
    'gg',
    'gs',
    'hm',
    'ic',
    'im',
    'je',
    'pn',
    'sj',
    'ta',
    'tf',
    'um',
    'xa',
    'xc',
    'xo',
  ])('does not expose the unsupported Figma flag %s', iso => {
    expect(hasCountryFlag(iso)).toBe(false);
  });

  it.each(['', 'zz', 'constructor', '__proto__'])('uses a globe for an unknown code (%s)', iso => {
    const { container } = render(
      <CountryFlag
        iso={iso}
        aria-label='Unknown country'
      />,
    );

    expect(container.querySelector('path[stroke="currentColor"]')).not.toBeNull();
  });
});
