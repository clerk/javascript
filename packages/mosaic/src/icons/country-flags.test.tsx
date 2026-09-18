import { IsoToCountryMap } from '@clerk/shared/phone';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { getCountryFlag } from './country-flags';

describe('getCountryFlag', () => {
  it('looks up the Figma US flag by country code', () => {
    const Flag = getCountryFlag('us');
    const { container } = render(<Flag aria-label='United States' />);

    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 16 16');
    expect(container.querySelector('path[fill="#D80027"]')).not.toBeNull();
    expect(container.querySelector('path[fill="#2E52B2"]')).not.toBeNull();
  });

  it('has a flag for every phone country', () => {
    const fallback = getCountryFlag('unknown');

    for (const country of IsoToCountryMap.values()) {
      expect(getCountryFlag(country.iso), country.name).not.toBe(fallback);
    }
  });

  it('supports uppercase country codes', () => {
    expect(getCountryFlag('US')).toBe(getCountryFlag('us'));
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
    expect(getCountryFlag(iso)).toBe(getCountryFlag('unknown'));
  });

  it.each(['', 'zz', 'constructor', '__proto__'])('uses a globe for an unknown code (%s)', iso => {
    const Flag = getCountryFlag(iso);
    const { container } = render(<Flag aria-label='Unknown country' />);

    expect(container.querySelector('path[stroke="currentColor"]')).not.toBeNull();
  });
});
