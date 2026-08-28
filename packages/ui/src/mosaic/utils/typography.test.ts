import { describe, expect, it } from 'vitest';

import { tabularNumbersStyle } from './typography.styles';

describe('Mosaic typography', () => {
  it('exposes tabular figures as their own style', () => {
    const properties = Object.keys(tabularNumbersStyle.enabled).map(name => name.split('-')[0]);

    expect(properties).toContain('fontVariantNumeric');
  });
});
