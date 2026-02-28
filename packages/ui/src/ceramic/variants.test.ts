// eslint-disable-next-line no-restricted-imports
import type { Interpolation, Theme } from '@emotion/react';
import { describe, expect, it } from 'vitest';

import { ceramicTheme } from './theme';
import { style, variants } from './variants';

// Helper to extract the CSS object from Interpolation<Theme>
function getStyles(interpolation: Interpolation<Theme>): Record<string, unknown> {
  if (typeof interpolation === 'function') {
    return interpolation(ceramicTheme as unknown as Theme) as Record<string, unknown>;
  }
  if (interpolation == null) {
    return {};
  }
  return interpolation as Record<string, unknown>;
}

describe('variants', () => {
  it('applies base styles', () => {
    const buttonStyles = variants({
      base: { padding: '1rem', margin: '0.5rem' },
      variants: {},
    });

    const result = getStyles(buttonStyles());
    expect(result).toEqual({ padding: '1rem', margin: '0.5rem' });
  });

  it('applies base styles from function', () => {
    const buttonStyles = variants({
      base: style(theme => ({
        padding: theme.spacing[4],
        color: theme.colors.white,
      })),
      variants: {},
    });

    const result = getStyles(buttonStyles());
    expect(result).toEqual({
      padding: ceramicTheme.spacing[4],
      color: ceramicTheme.colors.white,
    });
  });

  it('applies variant styles based on props', () => {
    const buttonStyles = variants({
      variants: {
        size: {
          sm: { fontSize: '0.75rem', padding: '0.5rem' },
          md: { fontSize: '1rem', padding: '1rem' },
          lg: { fontSize: '1.25rem', padding: '1.5rem' },
        },
      },
    });

    const result = getStyles(buttonStyles({ size: 'sm' }));
    expect(result).toEqual({ fontSize: '0.75rem', padding: '0.5rem' });
  });

  it('applies variant styles from function', () => {
    const buttonStyles = variants({
      variants: {
        variant: {
          primary: style(theme => ({
            background: theme.colors.purple[700],
            color: theme.colors.white,
          })),
          secondary: style(theme => ({
            background: theme.colors.gray[200],
            color: theme.colors.gray[1200],
          })),
        },
      },
    });

    const result = getStyles(buttonStyles({ variant: 'primary' }));
    expect(result).toEqual({
      background: ceramicTheme.colors.purple[700],
      color: ceramicTheme.colors.white,
    });
  });

  it('applies multiple variants', () => {
    const buttonStyles = variants({
      variants: {
        size: {
          sm: { fontSize: '0.75rem' },
          md: { fontSize: '1rem' },
        },
        variant: {
          primary: { background: 'blue' },
          secondary: { background: 'gray' },
        },
      },
    });

    const result = getStyles(buttonStyles({ size: 'sm', variant: 'primary' }));
    expect(result).toEqual({ fontSize: '0.75rem', background: 'blue' });
  });

  it('applies default variants when props are not provided', () => {
    const buttonStyles = variants({
      variants: {
        size: {
          sm: { fontSize: '0.75rem' },
          md: { fontSize: '1rem' },
        },
        variant: {
          primary: { background: 'blue' },
          secondary: { background: 'gray' },
        },
      },
      defaultVariants: {
        size: 'md',
        variant: 'primary',
      },
    });

    const result = getStyles(buttonStyles());
    expect(result).toEqual({ fontSize: '1rem', background: 'blue' });
  });

  it('overrides default variants with props', () => {
    const buttonStyles = variants({
      variants: {
        size: {
          sm: { fontSize: '0.75rem' },
          md: { fontSize: '1rem' },
        },
      },
      defaultVariants: {
        size: 'md',
      },
    });

    const result = getStyles(buttonStyles({ size: 'sm' }));
    expect(result).toEqual({ fontSize: '0.75rem' });
  });

  it('applies boolean variants with true/false keys', () => {
    const buttonStyles = variants({
      variants: {
        fullWidth: {
          true: { width: '100%' },
          false: { width: 'fit-content' },
        },
        disabled: {
          true: { opacity: 0.5, cursor: 'not-allowed' },
          false: { opacity: 1, cursor: 'pointer' },
        },
      },
    });

    const result = getStyles(buttonStyles({ fullWidth: true, disabled: false }));
    expect(result).toEqual({ width: '100%', opacity: 1, cursor: 'pointer' });
  });

  it('applies boolean variants from default variants', () => {
    const buttonStyles = variants({
      variants: {
        fullWidth: {
          true: { width: '100%' },
          false: { width: 'fit-content' },
        },
      },
      defaultVariants: {
        fullWidth: false,
      },
    });

    const result = getStyles(buttonStyles());
    expect(result).toEqual({ width: 'fit-content' });
  });

  it('applies compound variants when conditions match', () => {
    const buttonStyles = variants({
      variants: {
        size: {
          sm: { fontSize: '0.75rem' },
          md: { fontSize: '1rem' },
        },
        variant: {
          primary: { background: 'blue' },
          secondary: { background: 'gray' },
        },
      },
      compoundVariants: [
        {
          condition: { size: 'sm', variant: 'primary' },
          styles: { borderRadius: '0.25rem' },
        },
        {
          condition: { size: 'md', variant: 'secondary' },
          styles: { borderRadius: '0.5rem' },
        },
      ],
    });

    const result = getStyles(buttonStyles({ size: 'sm', variant: 'primary' }));
    expect(result).toEqual({
      fontSize: '0.75rem',
      background: 'blue',
      borderRadius: '0.25rem',
    });
  });

  it('applies compound variants with function styles', () => {
    const buttonStyles = variants({
      variants: {
        size: {
          sm: { fontSize: '0.75rem' },
          md: { fontSize: '1rem' },
        },
        variant: {
          primary: { background: 'blue' },
        },
      },
      compoundVariants: [
        {
          condition: { size: 'sm', variant: 'primary' },
          styles: style(theme => ({
            border: `1px solid ${theme.colors.purple[700]}`,
          })),
        },
      ],
    });

    const result = getStyles(buttonStyles({ size: 'sm', variant: 'primary' }));
    expect(result).toEqual({
      fontSize: '0.75rem',
      background: 'blue',
      border: `1px solid ${ceramicTheme.colors.purple[700]}`,
    });
  });

  it('does not apply compound variants when conditions do not match', () => {
    const buttonStyles = variants({
      variants: {
        size: {
          sm: { fontSize: '0.75rem' },
          md: { fontSize: '1rem' },
        },
        variant: {
          primary: { background: 'blue' },
        },
      },
      compoundVariants: [
        {
          condition: { size: 'sm', variant: 'primary' },
          styles: { borderRadius: '0.25rem' },
        },
      ],
    });

    const result = getStyles(buttonStyles({ size: 'md', variant: 'primary' }));
    expect(result).toEqual({
      fontSize: '1rem',
      background: 'blue',
    });
  });

  it('merges base styles with variant styles', () => {
    const buttonStyles = variants({
      base: { padding: '1rem', margin: '0.5rem' },
      variants: {
        size: {
          sm: { fontSize: '0.75rem' },
          md: { fontSize: '1rem' },
        },
      },
    });

    const result = getStyles(buttonStyles({ size: 'sm' }));
    expect(result).toEqual({
      padding: '1rem',
      margin: '0.5rem',
      fontSize: '0.75rem',
    });
  });

  it('merges styles with later variants overriding earlier ones', () => {
    const buttonStyles = variants({
      base: { fontSize: '1rem' },
      variants: {
        size: {
          sm: { fontSize: '0.75rem' },
        },
      },
    });

    const result = getStyles(buttonStyles({ size: 'sm' }));
    expect(result).toEqual({ fontSize: '0.75rem' });
  });

  it('handles nested pseudo-selectors', () => {
    const buttonStyles = variants({
      base: {
        '&:hover': { opacity: 0.8 },
        '&:active': { opacity: 0.6 },
      },
      variants: {
        variant: {
          primary: {
            '&:hover': { background: 'darkblue' },
          },
        },
      },
    });

    const result = getStyles(buttonStyles({ variant: 'primary' }));
    expect(result).toEqual({
      '&:hover': { opacity: 0.8, background: 'darkblue' },
      '&:active': { opacity: 0.6 },
    });
  });

  it('handles null and undefined props', () => {
    const buttonStyles = variants({
      variants: {
        size: {
          sm: { fontSize: '0.75rem' },
          md: { fontSize: '1rem' },
        },
      },
      defaultVariants: {
        size: 'md',
      },
    });

    const result1 = getStyles(buttonStyles({ size: null as any }));
    const result2 = getStyles(buttonStyles({ size: undefined as any }));
    expect(result1).toEqual({ fontSize: '1rem' });
    expect(result2).toEqual({ fontSize: '1rem' });
  });

  it('handles empty variants object', () => {
    const buttonStyles = variants({
      base: { padding: '1rem' },
      variants: {},
    });

    const result = getStyles(buttonStyles());
    expect(result).toEqual({ padding: '1rem' });
  });

  it('handles missing variant definition gracefully', () => {
    const buttonStyles = variants({
      variants: {
        size: {
          sm: { fontSize: '0.75rem' },
        },
      },
    });

    const result = getStyles(buttonStyles({ size: 'nonexistent' as any }));
    expect(result).toEqual({});
  });
});

describe('style', () => {
  it('returns the function unchanged', () => {
    const fn = (theme: typeof ceramicTheme) => ({ color: theme.colors.white });
    const result = style(fn);
    expect(result).toBe(fn);
  });

  it('provides CeramicTheme typing', () => {
    const fn = style(theme => ({
      color: theme.colors.white,
      padding: theme.spacing[4],
    }));

    const result = fn(ceramicTheme);
    expect(result).toEqual({
      color: ceramicTheme.colors.white,
      padding: ceramicTheme.spacing[4],
    });
  });
});
