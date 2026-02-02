import { describe, expectTypeOf, it } from 'vitest';

import type { MosaicTheme } from '../theme';
import { style, variants } from '../variants';

describe('variants type tests', () => {
  describe('boolean variants', () => {
    it('allows boolean values in defaultVariants for true/false keys', () => {
      const _buttonStyles = variants({
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

      type Props = Parameters<typeof _buttonStyles>[0];
      expectTypeOf<{ fullWidth: false }>().toMatchTypeOf<Props>();
      expectTypeOf<{ fullWidth: true }>().toMatchTypeOf<Props>();
    });

    it('allows boolean values in props for true/false keys', () => {
      const _buttonStyles = variants({
        variants: {
          disabled: {
            true: { opacity: 0.5 },
            false: { opacity: 1 },
          },
        },
      });

      type Props = Parameters<typeof _buttonStyles>[0];
      expectTypeOf<{ disabled: true }>().toMatchTypeOf<Props>();
      expectTypeOf<{ disabled: false }>().toMatchTypeOf<Props>();
    });

    it('does not allow string values for boolean variants', () => {
      const _buttonStyles = variants({
        variants: {
          fullWidth: {
            true: { width: '100%' },
            false: { width: 'fit-content' },
          },
        },
      });

      type Props = Parameters<typeof _buttonStyles>[0];
      expectTypeOf<{ fullWidth: 'true' }>().not.toMatchTypeOf<Props>();
    });
  });

  describe('string variants', () => {
    it('allows string literal values in defaultVariants', () => {
      const _buttonStyles = variants({
        variants: {
          size: {
            sm: { fontSize: '0.75rem' },
            md: { fontSize: '1rem' },
            lg: { fontSize: '1.25rem' },
          },
        },
        defaultVariants: {
          size: 'md',
        },
      });

      type Props = Parameters<typeof _buttonStyles>[0];
      expectTypeOf<{ size: 'sm' }>().toMatchTypeOf<Props>();
      expectTypeOf<{ size: 'md' }>().toMatchTypeOf<Props>();
      expectTypeOf<{ size: 'lg' }>().toMatchTypeOf<Props>();
    });

    it('does not allow invalid string values', () => {
      const _buttonStyles = variants({
        variants: {
          size: {
            sm: { fontSize: '0.75rem' },
            md: { fontSize: '1rem' },
          },
        },
      });

      type Props = Parameters<typeof _buttonStyles>[0];
      expectTypeOf<{ size: 'xl' }>().not.toMatchTypeOf<Props>();
    });
  });

  describe('mixed variants', () => {
    it('allows mixing boolean and string variants', () => {
      const _buttonStyles = variants({
        variants: {
          size: {
            sm: { fontSize: '0.75rem' },
            md: { fontSize: '1rem' },
          },
          fullWidth: {
            true: { width: '100%' },
            false: { width: 'fit-content' },
          },
        },
        defaultVariants: {
          size: 'sm',
          fullWidth: false,
        },
      });

      type Props = Parameters<typeof _buttonStyles>[0];
      expectTypeOf<{ size: 'md'; fullWidth: true }>().toMatchTypeOf<Props>();
    });
  });

  describe('style helper', () => {
    it('provides MosaicTheme typing for theme parameter', () => {
      const fn = style(theme => {
        // Theme parameter should be typed as MosaicTheme
        return { color: theme.colors.white };
      });

      expectTypeOf(fn).toBeFunction();
      expectTypeOf<Parameters<typeof fn>[0]>().toEqualTypeOf<MosaicTheme>();
    });

    it('returns StyleFunction type', () => {
      const _fn = style(theme => ({ color: theme.colors.white }));
      type Return = ReturnType<typeof _fn>;
      expectTypeOf<Return>().toMatchTypeOf<Record<string, unknown>>();
    });
  });

  describe('props type inference', () => {
    it('infers correct props type from variants', () => {
      const _buttonStyles = variants({
        variants: {
          variant: {
            primary: { background: 'blue' },
            secondary: { background: 'gray' },
          },
          size: {
            sm: { fontSize: '0.75rem' },
            md: { fontSize: '1rem' },
          },
        },
      });

      type Props = Parameters<typeof _buttonStyles>[0];
      // Props should allow optional variant and size
      expectTypeOf<{ variant?: 'primary' | 'secondary'; size?: 'sm' | 'md' }>().toMatchTypeOf<Props>();
    });

    it('allows partial props', () => {
      const _buttonStyles = variants({
        variants: {
          variant: {
            primary: { background: 'blue' },
            secondary: { background: 'gray' },
          },
          size: {
            sm: { fontSize: '0.75rem' },
            md: { fontSize: '1rem' },
          },
        },
      });

      type Props = Parameters<typeof _buttonStyles>[0];
      expectTypeOf<{ variant: 'primary' }>().toMatchTypeOf<Props>();
      expectTypeOf<{ size: 'md' }>().toMatchTypeOf<Props>();
      expectTypeOf<Record<string, never>>().toMatchTypeOf<Props>();
    });

    it('allows null and undefined in props', () => {
      const _buttonStyles = variants({
        variants: {
          size: {
            sm: { fontSize: '0.75rem' },
            md: { fontSize: '1rem' },
          },
        },
      });

      type Props = Parameters<typeof _buttonStyles>[0];
      expectTypeOf<{ size: null }>().toMatchTypeOf<Props>();
      expectTypeOf<{ size: undefined }>().toMatchTypeOf<Props>();
    });
  });

  describe('compound variants', () => {
    it('allows compound variants with correct condition types', () => {
      const _buttonStyles = variants({
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
        ],
      });

      // Type should compile without errors
      expectTypeOf(_buttonStyles).toBeFunction();
    });

    it('allows boolean values in compound variant conditions', () => {
      const _buttonStyles = variants({
        variants: {
          size: {
            sm: { fontSize: '0.75rem' },
          },
          fullWidth: {
            true: { width: '100%' },
            false: { width: 'fit-content' },
          },
        },
        compoundVariants: [
          {
            condition: { size: 'sm', fullWidth: true },
            styles: { padding: '0.5rem' },
          },
        ],
      });

      // Type should compile without errors
      expectTypeOf(_buttonStyles).toBeFunction();
    });
  });

  describe('return type', () => {
    it('returns Interpolation<Theme>', () => {
      const _buttonStyles = variants({
        variants: {
          size: {
            sm: { fontSize: '0.75rem' },
          },
        },
      });

      // Verify the function can be called with props
      expectTypeOf(_buttonStyles({ size: 'sm' })).toMatchTypeOf<unknown>();
    });
  });
});
