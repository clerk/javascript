import { describe, expect, it } from 'vitest';

import { defaultMosaicVariables, resolveVariables } from '../variables';
import { alpha } from '../utils';

describe('alpha', () => {
  it('produces a color-mix expression', () => {
    expect(alpha('#000', 50)).toBe('color-mix(in oklab, #000 50%, transparent)');
  });

  it('accepts any CSS color string', () => {
    expect(alpha('oklch(58.5% .233 277.117)', 80)).toBe(
      'color-mix(in oklab, oklch(58.5% .233 277.117) 80%, transparent)',
    );
  });

  it('matches theme.alpha output for the same resolved color', () => {
    const theme = resolveVariables(defaultMosaicVariables);
    const resolvedColor = defaultMosaicVariables.color.primary;
    expect(theme.alpha('primary', 60)).toBe(alpha(resolvedColor, 60));
  });
});
