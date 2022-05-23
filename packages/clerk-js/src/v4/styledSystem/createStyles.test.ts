import { createVariants } from './createVariants';

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
    const { applyVariants } = createVariants<typeof baseTheme>(theme => ({
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

  it('applies variants based on props', () => {
    const { applyVariants } = createVariants<typeof baseTheme>(theme => ({
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
    const { applyVariants } = createVariants<typeof baseTheme>(theme => ({
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
    const { applyVariants } = createVariants<typeof baseTheme>(theme => ({
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
    const { applyVariants } = createVariants<typeof baseTheme>(theme => ({
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
    const { applyVariants } = createVariants<typeof baseTheme>(theme => ({
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
    const { applyVariants } = createVariants<typeof baseTheme>(theme => ({
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
    const { applyVariants } = createVariants<typeof baseTheme>(theme => ({
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

  it('removes variant keys from passed props', () => {
    const { filterProps } = createVariants<typeof baseTheme>(theme => ({
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
