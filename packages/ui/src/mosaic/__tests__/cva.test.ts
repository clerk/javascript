import { describe, expect, it } from 'vitest';

import { createCssVariables } from '../../styledSystem/createCssVariables';
import { cva } from '../cva';
import type { VariantProps } from '../cva';
import type { MosaicTheme } from '../tokens';

const mockTheme = Object.freeze({
  color: {
    primary: '#6C47FF',
    primaryHover: '#5A38E0',
    primaryContrast: '#FFFFFF',
    danger: '#EF4444',
    bg: '#FFFFFF',
    fg: '#111111',
    fgMuted: '#6B7280',
    border: '#E5E5E5',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
  },
  radius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
} as const) satisfies MosaicTheme;

describe('cva', () => {
  it('applies base styles when no variants are selected', () => {
    const styles = cva({
      base: { display: 'flex', alignItems: 'center' },
      variants: {
        size: {
          sm: { fontSize: 12 },
          md: { fontSize: 16 },
        },
      },
    });

    const res = styles()(mockTheme);
    expect(res).toEqual({ display: 'flex', alignItems: 'center' });
  });

  it('applies correct styles per variant prop', () => {
    const styles = cva({
      base: { display: 'flex' },
      variants: {
        size: {
          sm: { fontSize: 12 },
          md: { fontSize: 16 },
        },
      },
    });

    const res = styles({ size: 'sm' })(mockTheme);
    expect(res).toEqual({ display: 'flex', fontSize: 12 });
  });

  it('merges styles from multiple variant axes', () => {
    const styles = cva({
      base: { display: 'flex' },
      variants: {
        size: {
          sm: { fontSize: 12 },
          md: { fontSize: 16 },
        },
        color: {
          blue: { backgroundColor: 'blue' },
          green: { backgroundColor: 'green' },
        },
      },
    });

    const res = styles({ size: 'sm', color: 'blue' })(mockTheme);
    expect(res).toEqual({ display: 'flex', fontSize: 12, backgroundColor: 'blue' });
  });

  it('uses default variants when prop is omitted', () => {
    const styles = cva({
      base: { display: 'flex' },
      variants: {
        size: {
          sm: { fontSize: 12 },
          md: { fontSize: 16 },
        },
        color: {
          blue: { backgroundColor: 'blue' },
          green: { backgroundColor: 'green' },
        },
      },
      defaultVariants: { color: 'blue' },
    });

    const res = styles({ size: 'sm' })(mockTheme);
    expect(res).toEqual({ display: 'flex', fontSize: 12, backgroundColor: 'blue' });
  });

  it('overrides default variants with explicit props', () => {
    const styles = cva({
      variants: {
        size: {
          sm: { fontSize: 12 },
          md: { fontSize: 16 },
        },
      },
      defaultVariants: { size: 'sm' },
    });

    const res = styles({ size: 'md' })(mockTheme);
    expect(res).toEqual({ fontSize: 16 });
  });

  it('applies boolean variant with true', () => {
    const styles = cva({
      variants: {
        disabled: {
          false: null,
          true: { opacity: 0.5, cursor: 'not-allowed' },
        },
      },
    });

    const res = styles({ disabled: true })(mockTheme);
    expect(res).toEqual({ opacity: 0.5, cursor: 'not-allowed' });
  });

  it('applies boolean variant with false (null means no styles)', () => {
    const styles = cva({
      variants: {
        disabled: {
          false: null,
          true: { opacity: 0.5, cursor: 'not-allowed' },
        },
      },
    });

    const res = styles({ disabled: false })(mockTheme);
    expect(res).toEqual({});
  });

  it('matches boolean variants in compound variants', () => {
    const styles = cva({
      variants: {
        intent: {
          primary: { background: 'blue' },
          secondary: { background: 'white' },
        },
        disabled: {
          false: null,
          true: { opacity: 0.5 },
        },
      },
      compoundVariants: [{ intent: 'primary', disabled: false, css: { '&:hover': { background: 'darkblue' } } }],
      defaultVariants: { disabled: false },
    });

    const res = styles({ intent: 'primary' })(mockTheme);
    expect(res).toEqual({
      background: 'blue',
      '&:hover': { background: 'darkblue' },
    });
  });

  it('deep merges nested pseudo-selectors', () => {
    const styles = cva({
      base: {
        backgroundColor: 'white',
        '&:active': { backgroundColor: 'gray' },
      },
      variants: {
        size: {
          sm: {
            fontSize: 12,
            '&:active': { transform: 'scale(0.98)' },
          },
        },
      },
    });

    const res = styles({ size: 'sm' })(mockTheme);
    expect(res).toEqual({
      backgroundColor: 'white',
      fontSize: 12,
      '&:active': {
        backgroundColor: 'gray',
        transform: 'scale(0.98)',
      },
    });
  });

  it('applies compound variants when all conditions match', () => {
    const styles = cva({
      variants: {
        size: {
          sm: { fontSize: 12 },
          md: { fontSize: 16 },
        },
        color: {
          blue: { backgroundColor: 'blue' },
          green: { backgroundColor: 'green' },
        },
      },
      compoundVariants: [{ size: 'sm', color: 'blue', css: { borderRadius: '9999px' } }],
      defaultVariants: { color: 'blue' },
    });

    const res = styles({ size: 'sm' })(mockTheme);
    expect(res).toEqual({ fontSize: 12, backgroundColor: 'blue', borderRadius: '9999px' });
  });

  it('does not apply compound variants when conditions do not match', () => {
    const styles = cva({
      variants: {
        size: {
          sm: { fontSize: 12 },
          md: { fontSize: 16 },
        },
        color: {
          blue: { backgroundColor: 'blue' },
          green: { backgroundColor: 'green' },
        },
      },
      compoundVariants: [{ size: 'sm', color: 'green', css: { backgroundColor: 'notpossible' } }],
      defaultVariants: { color: 'blue' },
    });

    const res = styles({ size: 'sm' })(mockTheme);
    expect(res).toEqual({ fontSize: 12, backgroundColor: 'blue' });
  });

  it('compound variant styles override variant styles', () => {
    const styles = cva({
      variants: {
        size: {
          sm: { fontSize: 12 },
          md: { fontSize: 16 },
        },
        color: {
          blue: { backgroundColor: 'blue' },
          green: { backgroundColor: 'green' },
        },
      },
      compoundVariants: [{ size: 'md', color: 'green', css: { backgroundColor: 'gainsboro' } }],
      defaultVariants: { size: 'sm', color: 'blue' },
    });

    const res = styles({ size: 'md', color: 'green' })(mockTheme);
    expect(res).toEqual({ fontSize: 16, backgroundColor: 'gainsboro' });
  });

  it('sanitizes CSS variable keys', () => {
    const { color } = createCssVariables('color');
    const styles = cva({
      variants: {
        size: {
          sm: { [color]: 'blue', fontSize: 12 },
        },
        intent: {
          primary: { backgroundColor: color },
        },
      },
    });

    const res = styles({ size: 'sm', intent: 'primary' })(mockTheme);
    expect(res).toEqual({
      fontSize: 12,
      '--color': 'blue',
      backgroundColor: color,
    });
  });

  it('works with a static config (no theme function)', () => {
    const styles = cva({
      base: { display: 'flex' },
      variants: {
        size: {
          sm: { fontSize: 12 },
        },
      },
    });

    const res = styles({ size: 'sm' })(mockTheme);
    expect(res).toEqual({ display: 'flex', fontSize: 12 });
  });

  it('accesses MosaicTheme values in config function', () => {
    const styles = cva(theme => ({
      base: { color: theme.color.fg },
      variants: {
        size: {
          sm: { padding: theme.spacing.sm },
          md: { padding: theme.spacing.md },
        },
      },
    }));

    const res = styles({ size: 'sm' })(mockTheme);
    expect(res).toEqual({ color: '#111111', padding: '0.5rem' });
  });

  it('returns base styles only when no variants provided and no defaults', () => {
    const styles = cva({
      base: { display: 'flex' },
      variants: {
        size: {
          sm: { fontSize: 12 },
          md: { fontSize: 16 },
        },
      },
    });

    const res = styles()(mockTheme);
    expect(res).toEqual({ display: 'flex' });
  });

  it('ignores unknown props not in variants', () => {
    const styles = cva({
      base: { display: 'flex' },
      variants: {
        size: {
          sm: { fontSize: 12 },
        },
      },
    });

    const res = styles({ size: 'sm', unknownProp: 'value' } as any)(mockTheme);
    expect(res).toEqual({ display: 'flex', fontSize: 12 });
  });

  it('handles null variant values (no styles applied)', () => {
    const styles = cva({
      base: { display: 'flex' },
      variants: {
        state: {
          active: { color: 'blue' },
          inactive: null,
        },
      },
    });

    const resActive = styles({ state: 'active' })(mockTheme);
    expect(resActive).toEqual({ display: 'flex', color: 'blue' });

    const resInactive = styles({ state: 'inactive' })(mockTheme);
    expect(resInactive).toEqual({ display: 'flex' });
  });

  describe('VariantProps type', () => {
    it('extracts correct variant prop types', () => {
      const styles = cva({
        variants: {
          intent: {
            primary: { background: 'blue' },
            secondary: { background: 'gray' },
          },
          size: {
            sm: { fontSize: 12 },
            md: { fontSize: 16 },
          },
          disabled: {
            false: null,
            true: { opacity: 0.5 },
          },
        },
      });

      type Props = VariantProps<typeof styles>;

      // Valid assignments
      const _valid1: Props = { intent: 'primary', size: 'sm', disabled: true };
      const _valid2: Props = { intent: 'secondary', disabled: false };
      const _valid3: Props = {};

      // @ts-expect-error - invalid intent value
      const _invalid1: Props = { intent: 'nonexistent' };

      // @ts-expect-error - invalid size value
      const _invalid2: Props = { size: 'xl' };

      // @ts-expect-error - disabled should be boolean, not string
      const _invalid3: Props = { disabled: 'true' };

      // Suppress unused variable warnings
      void [_valid1, _valid2, _valid3, _invalid1, _invalid2, _invalid3];
    });
  });

  it('respects variant specificity - later variant in config wins on conflict', () => {
    const styles = cva({
      variants: {
        type: {
          subtitle: { color: 'green', fontSize: 12 },
        },
        size: {
          sm: { fontSize: 12 },
          md: { fontSize: 16 },
        },
      },
    });

    const res = styles({ type: 'subtitle', size: 'md' })(mockTheme);
    expect(res).toEqual({ color: 'green', fontSize: 16 });
  });
});
