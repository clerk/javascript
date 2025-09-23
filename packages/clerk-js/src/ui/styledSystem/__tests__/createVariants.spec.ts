import { describe, expect, it } from 'vitest';

import { createCssVariables } from '../createCssVariables';
import { createVariants } from '../createVariants';

const baseTheme = {
  fontSizes: {
    sm: 'sm',
    md: 'md',
  },
  colors: {
    primary500: 'primary500',
    success500: 'success500',
  },
  radii: {
    full: 'full',
    none: 'none',
  },
};

describe('createVariants', () => {
  it('applies base styles', () => {
    const { applyVariants } = createVariants<any, typeof baseTheme>(theme => ({
      base: {
        backgroundColor: theme.colors.primary500,
      },
      variants: {
        size: {
          small: { fontSize: theme.fontSizes.sm },
          medium: { fontSize: theme.fontSizes.md },
        },
      },
    }));

    const res = applyVariants({ size: 'small' })(baseTheme);
    expect(res).toEqual({ fontSize: baseTheme.fontSizes.sm, backgroundColor: baseTheme.colors.primary500 });
  });

  it('merges nested pseudo-selector objecst', () => {
    const { applyVariants } = createVariants<any, typeof baseTheme>(theme => ({
      base: {
        backgroundColor: theme.colors.primary500,
        '&:active': {
          backgroundColor: theme.colors.success500,
        },
      },
      variants: {
        size: {
          small: {
            fontSize: theme.fontSizes.sm,
            '&:active': {
              transform: 'scale(0.98)',
            },
          },
          medium: { fontSize: theme.fontSizes.md },
        },
      },
    }));

    const res = applyVariants({ size: 'small' })(baseTheme);
    expect(res).toEqual({
      fontSize: baseTheme.fontSizes.sm,
      backgroundColor: baseTheme.colors.primary500,
      '&:active': {
        backgroundColor: baseTheme.colors.success500,
        transform: 'scale(0.98)',
      },
    });
  });

  it('supports termplate literals with references to the theme prop', () => {
    const { applyVariants } = createVariants<any, typeof baseTheme>(theme => ({
      variants: {
        size: {
          small: { fontSize: `${theme.fontSizes.sm}` },
        },
      },
    }));

    const res = applyVariants({ size: 'small' })(baseTheme);
    expect(res).toEqual({ fontSize: baseTheme.fontSizes.sm });
  });

  it('supports template literals with references to the theme prop', () => {
    const { applyVariants } = createVariants<any, typeof baseTheme>(theme => ({
      variants: {
        size: {
          small: { fontSize: `${theme.fontSizes.sm}` },
        },
      },
    }));

    const res = applyVariants({ size: 'small' })(baseTheme);
    expect(res).toEqual({ fontSize: baseTheme.fontSizes.sm });
  });

  it('respects variant specificity - the variant that comes last wins', () => {
    const { applyVariants } = createVariants<any, typeof baseTheme>(theme => ({
      variants: {
        type: {
          subtitle: { color: theme.colors.success500, fontSize: theme.fontSizes.sm },
        },
        size: {
          small: { fontSize: `${theme.fontSizes.sm}` },
          md: { fontSize: `${theme.fontSizes.md}` },
        },
      },
    }));

    const res = applyVariants({ type: 'subtitle', size: 'md' })(baseTheme);
    expect(res).toEqual({ color: baseTheme.colors.success500, fontSize: baseTheme.fontSizes.md });
  });

  it('applies variants based on props', () => {
    const { applyVariants } = createVariants<any, typeof baseTheme>(theme => ({
      variants: {
        size: {
          small: { fontSize: theme.fontSizes.sm },
          medium: { fontSize: theme.fontSizes.md },
        },
        color: {
          blue: { backgroundColor: theme.colors.primary500 },
          green: { backgroundColor: theme.colors.success500 },
        },
      },
    }));

    const res = applyVariants({ size: 'small' })(baseTheme);
    expect(res).toEqual({ fontSize: baseTheme.fontSizes.sm });
  });

  it('applies boolean-based variants based on props', () => {
    const { applyVariants } = createVariants<any, typeof baseTheme>(theme => ({
      variants: {
        size: {
          small: { fontSize: theme.fontSizes.sm },
          medium: { fontSize: theme.fontSizes.md },
        },
        rounded: {
          true: {
            borderRadius: theme.radii.full,
          },
        },
      },
    }));

    // @ts-ignore
    const res = applyVariants({ size: 'small', rounded: true })(baseTheme);
    expect(res).toEqual({ fontSize: baseTheme.fontSizes.sm, borderRadius: 'full' });
  });

  it('applies boolean-based variants based on default variants', () => {
    const { applyVariants } = createVariants<any, typeof baseTheme>(theme => ({
      variants: {
        size: {
          small: { fontSize: theme.fontSizes.sm },
          medium: { fontSize: theme.fontSizes.md },
        },
        rounded: {
          true: {
            borderRadius: theme.radii.full,
          },
        },
      },
      defaultVariants: {
        // @ts-expect-error
        rounded: true,
        size: 'small',
      },
    }));

    const res = applyVariants()(baseTheme);
    expect(res).toEqual({ fontSize: baseTheme.fontSizes.sm, borderRadius: 'full' });
  });

  it('applies falsy boolean-based variants', () => {
    const { applyVariants } = createVariants<any, typeof baseTheme>(theme => ({
      variants: {
        size: {
          small: { fontSize: theme.fontSizes.sm },
          medium: { fontSize: theme.fontSizes.md },
        },
        rounded: {
          false: {
            borderRadius: theme.radii.none,
          },
        },
      },
      defaultVariants: {
        // @ts-expect-error
        rounded: false,
      },
    }));

    const res = applyVariants()(baseTheme);
    expect(res).toEqual({ borderRadius: baseTheme.radii.none });
  });

  it('applies variants based on props and default variants if found', () => {
    const { applyVariants } = createVariants<any, typeof baseTheme>(theme => ({
      variants: {
        size: {
          small: { fontSize: theme.fontSizes.sm },
          medium: { fontSize: theme.fontSizes.md },
        },
        color: {
          blue: { backgroundColor: theme.colors.primary500 },
          green: { backgroundColor: theme.colors.success500 },
        },
      },
      defaultVariants: {
        color: 'blue',
      },
    }));

    const res = applyVariants({ size: 'small' })(baseTheme);
    expect(res).toEqual({
      fontSize: baseTheme.fontSizes.sm,
      backgroundColor: 'primary500',
    });
  });

  it('applies rules from compound variants', () => {
    const { applyVariants } = createVariants<any, typeof baseTheme>(theme => ({
      variants: {
        size: {
          small: { fontSize: theme.fontSizes.sm },
          medium: { fontSize: theme.fontSizes.md },
        },
        color: {
          blue: { backgroundColor: theme.colors.primary500 },
          green: { backgroundColor: theme.colors.success500 },
        },
      },
      defaultVariants: {
        color: 'blue',
      },
      compoundVariants: [
        { condition: { size: 'small', color: 'blue' }, styles: { borderRadius: theme.radii.full } },
        { condition: { size: 'small', color: 'green' }, styles: { backgroundColor: 'notpossible' } },
      ],
    }));

    const res = applyVariants({ size: 'small' })(baseTheme);
    expect(res).toEqual({
      fontSize: baseTheme.fontSizes.sm,
      backgroundColor: 'primary500',
      borderRadius: 'full',
    });
  });

  it('correctly overrides styles though compound variants rules', () => {
    const { applyVariants } = createVariants<any, typeof baseTheme>(theme => ({
      variants: {
        size: {
          small: { fontSize: theme.fontSizes.sm },
          medium: { fontSize: theme.fontSizes.md },
        },
        color: {
          blue: { backgroundColor: theme.colors.primary500 },
          green: { backgroundColor: theme.colors.success500 },
        },
      },
      defaultVariants: {
        size: 'small',
        color: 'blue',
      },
      compoundVariants: [
        { condition: { size: 'small', color: 'blue' }, styles: { borderRadius: theme.radii.full } },
        { condition: { size: 'medium', color: 'green' }, styles: { backgroundColor: 'gainsboro' } },
      ],
    }));

    const res = applyVariants({ size: 'medium', color: 'green' })(baseTheme);
    expect(res).toEqual({
      fontSize: baseTheme.fontSizes.md,
      backgroundColor: 'gainsboro',
    });
  });

  it('sanitizes vss variable keys before use', () => {
    const { color } = createCssVariables('color');
    const { applyVariants } = createVariants<any, typeof baseTheme>(theme => ({
      variants: {
        size: {
          small: { [color]: theme.colors.primary500, fontSize: baseTheme.fontSizes.sm },
        },
        color: {
          blue: { backgroundColor: color },
        },
      },
    }));

    const res = applyVariants({ size: 'small', color: 'blue' })(baseTheme);
    expect(res).toEqual({
      fontSize: baseTheme.fontSizes.sm,
      [color.replace('var(', '').replace(')', '')]: baseTheme.colors.primary500,
      backgroundColor: color,
    });
  });

  it('gives access to props inside the config function', () => {
    type Props = { size: any; color: any; isLoading: boolean };
    const { applyVariants } = createVariants<Props, typeof baseTheme>((theme, props) => ({
      base: {
        color: props.isLoading ? theme.colors.success500 : theme.colors.primary500,
      },
      variants: {},
    }));

    const res = applyVariants({ isLoading: true } as any)(baseTheme);
    expect(res).toEqual({ color: baseTheme.colors.success500 });
  });

  it('removes variant keys from passed props', () => {
    const { filterProps } = createVariants<any, typeof baseTheme>(theme => ({
      variants: {
        size: {
          small: { fontSize: theme.fontSizes.sm },
          medium: { fontSize: theme.fontSizes.md },
        },
        color: {
          blue: { backgroundColor: theme.colors.primary500 },
          green: { backgroundColor: theme.colors.success500 },
        },
      },
    }));

    const res = filterProps({ size: 'small', color: 'blue', normalProp1: '1', normalProp2: '2' });
    expect(res).toEqual({ normalProp1: '1', normalProp2: '2' });
  });
});
