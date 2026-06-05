import { describe, expect, expectTypeOf, it } from 'vitest';

import { cva } from '../cva';
import type { SxProp, VariantProps } from '../cva';
import { defaultMosaicVariables, resolveVariables } from '../variables';
import type { MosaicTheme } from '../variables';

const mockTheme: MosaicTheme = resolveVariables(defaultMosaicVariables);

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
      base: { color: theme.color.primary },
      variants: {
        size: {
          sm: { padding: theme.spacing(2) },
          md: { padding: theme.spacing(4) },
        },
      },
    }));

    const res = styles({ size: 'sm' })(mockTheme);
<<<<<<< HEAD
    expect(res).toEqual({ color: 'light-dark(oklch(0.205 0 0), oklch(0.922 0 0))', padding: 'calc(0.25rem * 2)' });
=======
    expect(res).toEqual({ color: 'oklch(0.205 0 0)', padding: 'calc(0.25rem * 2)' });
>>>>>>> b66b94fbd1 (refactor parseVariables to resolveVariables)
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

    const res = styles({ size: 'sm', unknownProp: 'value' } as unknown as VariantProps<typeof styles>)(mockTheme);
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

  it('preserves nested pseudo-selectors from variant styles', () => {
    const styles = cva({
      base: { display: 'flex' },
      variants: {
        color: {
          primary: {
            backgroundColor: 'blue',
            '&:hover': { backgroundColor: 'darkblue' },
          },
        },
      },
    });

    const res = styles({ color: 'primary' })(mockTheme);
    expect(res).toEqual({
      display: 'flex',
      backgroundColor: 'blue',
      '&:hover': { backgroundColor: 'darkblue' },
    });
  });
});

describe('variant styles with explicitly undefined props (regression: key-in-props bug)', () => {
  // Mirrors the shape of a real component that destructures all props before passing to cva —
  // the resulting object has keys present but set to undefined, which must still fall back to defaults.
  const componentStyles = cva(theme => ({
    variants: {
      color: {
        primary: {
          backgroundColor: theme.color.primary,
          '&:hover': { backgroundColor: theme.mix('primary', 'primaryForeground', 12) },
          '&:active': { backgroundColor: theme.mix('primary', 'primaryForeground', 24) },
        },
      },
      size: { sm: { fontSize: theme.text('sm').fontSize }, md: { fontSize: theme.text('base').fontSize } },
      disabled: { false: null, true: { opacity: 0.5, pointerEvents: 'none' } },
    },
    defaultVariants: { color: 'primary', size: 'md', disabled: false },
  }));

  it('hover and active styles are present when all props are explicitly undefined', () => {
    const res = componentStyles({ color: undefined, size: undefined, disabled: undefined })(mockTheme);
    expect(res['&:hover']).toBeDefined();
    expect(res['&:active']).toBeDefined();
  });
});

describe('resolveVariants via cva', () => {
  it('falls back to default variant when prop is explicitly undefined', () => {
    const styles = cva({
      variants: {
        color: {
          primary: { backgroundColor: 'blue', '&:hover': { backgroundColor: 'darkblue' } },
        },
      },
      defaultVariants: { color: 'primary' },
    });

    const res = styles({ color: undefined })(mockTheme);
    expect(res).toEqual({ backgroundColor: 'blue', '&:hover': { backgroundColor: 'darkblue' } });
  });

  it('applies defined props while falling back to defaults for undefined ones', () => {
    const styles = cva({
      variants: {
        size: { sm: { fontSize: 12 }, md: { fontSize: 16 } },
        color: { blue: { backgroundColor: 'blue' }, red: { backgroundColor: 'red' } },
      },
      defaultVariants: { size: 'md', color: 'blue' },
    });

    const res = styles({ size: undefined, color: 'red' })(mockTheme);
    expect(res).toEqual({ fontSize: 16, backgroundColor: 'red' });
  });

  it('applies boolean default variant with non-null false styles', () => {
    const styles = cva({
      variants: {
        disabled: {
          false: { cursor: 'pointer' },
          true: { opacity: 0.5, cursor: 'not-allowed' },
        },
      },
      defaultVariants: { disabled: false },
    });

    const res = styles()(mockTheme);
    expect(res).toEqual({ cursor: 'pointer' });
  });

  it('applies boolean default variant with explicit undefined', () => {
    const styles = cva({
      variants: {
        disabled: {
          false: { cursor: 'pointer' },
          true: { opacity: 0.5, cursor: 'not-allowed' },
        },
      },
      defaultVariants: { disabled: false },
    });

    const res = styles({ disabled: undefined })(mockTheme);
    expect(res).toEqual({ cursor: 'pointer' });
  });
});

describe('sx prop', () => {
  it('applies sx plain object, overriding variant styles', () => {
    const styles = cva({
      variants: {
        color: { primary: { backgroundColor: 'blue', color: 'white' } },
      },
    });

    const res = styles({ color: 'primary', sx: { backgroundColor: 'red' } })(mockTheme);
    expect(res).toEqual({ backgroundColor: 'red', color: 'white' });
  });

  it('applies sx as a function receiving the theme', () => {
    const styles = cva({
      base: { display: 'flex' },
      variants: {},
    });

    const res = styles({ sx: theme => ({ color: theme.color.primary }) })(mockTheme);
    expect(res).toEqual({ display: 'flex', color: mockTheme.color.primary });
  });

  it('sx overrides base styles', () => {
    const styles = cva({
      base: { display: 'flex', gap: 8 },
      variants: {},
    });

    const res = styles({ sx: { gap: 16 } })(mockTheme);
    expect(res).toEqual({ display: 'flex', gap: 16 });
  });

  it('sx merges nested pseudo-selectors rather than replacing them', () => {
    const styles = cva({
      variants: {
        color: {
          primary: { backgroundColor: 'blue', '&:hover': { backgroundColor: 'darkblue' } },
        },
      },
    });

    const res = styles({ color: 'primary', sx: { '&:hover': { opacity: 0.9 } } })(mockTheme);
    expect(res['&:hover']).toEqual({ backgroundColor: 'darkblue', opacity: 0.9 });
  });

  it('sx overrides conflicting pseudo-selector leaf values', () => {
    const styles = cva({
      variants: {
        color: {
          primary: { '&:hover': { backgroundColor: 'blue', color: 'white' } },
        },
      },
    });

    const res = styles({ color: 'primary', sx: { '&:hover': { backgroundColor: 'red' } } })(mockTheme);
    expect(res['&:hover']).toEqual({ backgroundColor: 'red', color: 'white' });
  });
});

describe('compound variants', () => {
  it('applies multiple matching compound variants in order, merging them', () => {
    const styles = cva({
      variants: {
        size: { sm: { fontSize: 12 } },
        color: { primary: { backgroundColor: 'blue' } },
      },
      compoundVariants: [
        { size: 'sm', color: 'primary', css: { borderRadius: 4 } },
        { size: 'sm', color: 'primary', css: { padding: 8 } },
      ],
    });

    const res = styles({ size: 'sm', color: 'primary' })(mockTheme);
    expect(res.borderRadius).toBe(4);
    expect(res.padding).toBe(8);
  });

  it('later compound variant overrides earlier one on conflicting property', () => {
    const styles = cva({
      variants: {
        size: { sm: { fontSize: 12 } },
        color: { primary: { backgroundColor: 'blue' } },
      },
      compoundVariants: [
        { size: 'sm', color: 'primary', css: { borderRadius: 4 } },
        { size: 'sm', color: 'primary', css: { borderRadius: 8 } },
      ],
    });

    const res = styles({ size: 'sm', color: 'primary' })(mockTheme);
    expect(res.borderRadius).toBe(8);
  });

  it('compound variant pseudo-selector deep-merges with existing variant pseudo-selector', () => {
    const styles = cva({
      variants: {
        color: { primary: { '&:hover': { backgroundColor: 'blue' } } },
        disabled: { false: null, true: { opacity: 0.5 } },
      },
      compoundVariants: [{ color: 'primary', disabled: false, css: { '&:hover': { color: 'white' } } }],
      defaultVariants: { disabled: false },
    });

    const res = styles({ color: 'primary' })(mockTheme);
    expect(res['&:hover']).toEqual({ backgroundColor: 'blue', color: 'white' });
  });
});

describe('type safety', () => {
  describe('SxProp', () => {
    it('accepts a plain style object', () => {
      const _sx: SxProp = { color: 'red', padding: 8 };
      void _sx;
    });

    it('accepts a function that receives MosaicTheme', () => {
      const _sx: SxProp = (theme: MosaicTheme) => ({ color: theme.color.primary });
      void _sx;
    });

    it('rejects non-object/function values', () => {
      // @ts-expect-error - string is not a valid SxProp
      const _a: SxProp = 'red';
      // @ts-expect-error - number is not a valid SxProp
      const _b: SxProp = 42;
      void [_a, _b];
    });

    it('sx function parameter is typed as MosaicTheme, not any', () => {
      const _sx: SxProp = theme => {
        // @ts-expect-error - nonexistent color key
        void theme.color.nonexistent;
        return {};
      };
      void _sx;
    });
  });

  describe('MosaicTheme helpers', () => {
    it('spacing returns a typed template literal, not string', () => {
      expectTypeOf(mockTheme.spacing(4)).toEqualTypeOf<'calc(0.25rem * 4)'>();
    });

    it('text returns exact fontSize and lineHeight literal types', () => {
      expectTypeOf(mockTheme.text('sm')).toEqualTypeOf<{
        fontSize: '0.875rem';
        lineHeight: 'calc(1.25 / 0.875)';
      }>();
    });

    it('alpha returns a typed template literal', () => {
      expectTypeOf(
        mockTheme.alpha('primary', 50),
      ).toEqualTypeOf<'color-mix(in oklab, light-dark(oklch(0.205 0 0), oklch(0.922 0 0)) 50%, transparent)'>();
    });

    it('mix returns a typed template literal', () => {
      expectTypeOf(
        mockTheme.mix('primary', 'primaryForeground', 12),
      ).toEqualTypeOf<'color-mix(in oklab, light-dark(oklch(0.205 0 0), oklch(0.922 0 0)), light-dark(oklch(0.985 0 0), oklch(0.205 0 0)) 12%)'>();
    });

    it('rejects invalid keys on theme helpers', () => {
      // Wrapped in a never-called function so TS checks types without executing
      () => {
        // @ts-expect-error - nonexistent color key
        mockTheme.alpha('nonexistent', 50);
        // @ts-expect-error - nonexistent color key
        mockTheme.mix('primary', 'nonexistent', 10);
        // @ts-expect-error - nonexistent fontSize key
        mockTheme.text('4xl');
      };
    });
  });

  describe('VariantProps boolean unwrapping', () => {
    it('exposes boolean type for true/false variant keys, not string literals', () => {
      const styles = cva({
        variants: {
          disabled: { false: null, true: { opacity: 0.5 } },
        },
      });
      type Props = VariantProps<typeof styles>;

      expectTypeOf<Props['disabled']>().toEqualTypeOf<boolean | undefined>();

      // @ts-expect-error - string 'true' is not assignable to boolean
      const _invalid: Props = { disabled: 'true' };
      void _invalid;
    });
  });

  describe('cva theme-function overload', () => {
    it('rejects invalid theme property access inside config function', () => {
      cva((_theme: MosaicTheme) => ({
        // @ts-expect-error - nonexistent color key
        base: { color: _theme.color.nonexistent },
        variants: {},
      }));
    });
  });

  describe('defaultVariants', () => {
    it('accepts valid variant values', () => {
      cva({
        variants: {
          color: { primary: { backgroundColor: 'blue' }, secondary: { backgroundColor: 'gray' } },
          disabled: { false: null, true: { opacity: 0.5 } },
        },
        defaultVariants: { color: 'primary', disabled: false },
      });
    });

    it('rejects an invalid value for a variant key', () => {
      cva({
        variants: {
          color: { primary: { backgroundColor: 'blue' }, secondary: { backgroundColor: 'gray' } },
        },
        defaultVariants: {
          // @ts-expect-error - 'danger' is not a valid color variant value
          color: 'danger',
        },
      });
    });

    it('rejects an unknown variant key', () => {
      cva({
        variants: {
          color: { primary: { backgroundColor: 'blue' } },
        },
        defaultVariants: {
          // @ts-expect-error - 'size' is not a declared variant
          size: 'sm',
        },
      });
    });

    it('rejects a string for a boolean variant', () => {
      cva({
        variants: {
          disabled: { false: null, true: { opacity: 0.5 } },
        },
        defaultVariants: {
          // @ts-expect-error - 'false' string is not assignable to boolean
          disabled: 'false',
        },
      });
    });
  });
});
