import { describe, expect, it } from 'vitest';

import { defaultMosaicVariables, resolveVariables } from '../variables';
import { alpha, hover } from '../utils';

describe('hover', () => {
  it('wraps styles in @media (hover: hover) and &:hover', () => {
    expect(hover({ color: 'red' })).toEqual({
      '@media (hover: hover)': {
        '&:hover': { color: 'red' },
      },
    });
  });

  it('passes complex style objects through unchanged', () => {
    const styles = { backgroundColor: 'blue', opacity: 0.8, transform: 'scale(1.05)' };
    expect(hover(styles)).toEqual({
      '@media (hover: hover)': {
        '&:hover': styles,
      },
    });
  });
});

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
