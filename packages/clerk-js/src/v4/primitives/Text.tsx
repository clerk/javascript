import React from 'react';

import { createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';

const { applyVariants } = createVariants(theme => {
  // TODO: This name will change based on actual usage
  const smallRegular = {
    fontStyle: theme.fontStyles.$normal,
    fontWeight: theme.fontWeights.$normal,
    fontSize: theme.fontSizes.$xs,
    lineHeight: theme.lineHeights.$none,
  };

  return {
    base: {
      boxSizing: 'border-box',
      color: theme.colors.$black,
      margin: 0,
    },
    variants: {
      variant: {
        label: {
          // Dashboard/Text / Small / Medium
          fontStyle: theme.fontStyles.$normal,
          fontWeight: theme.fontWeights.$medium,
          fontSize: theme.fontSizes.$xs,
          lineHeight: theme.lineHeights.$none,
        },
        // Dashboard/Text/Small/Regular
        error: smallRegular,
        link: smallRegular,
        hint: smallRegular,
        buttonLabel: {
          // Dashboard/Button Small
          fontStyle: theme.fontStyles.$normal,
          fontWeight: theme.fontWeights.$semibold,
          fontSize: theme.fontSizes.$xxs,
          letterSpacing: theme.space.$xxs,
          lineHeight: theme.lineHeights.$none,
        },
        subheading: {
          // Dashboard/Text/Regular/Regular
          fontStyle: theme.fontStyles.$normal,
          fontWeight: theme.fontWeights.$normal,
          fontSize: theme.fontSizes.$sm,
          lineHeight: theme.lineHeights.$shorter,
        },
      },
      size: {
        xss: { fontSize: theme.fontSizes.$xxs },
        xs: { fontSize: theme.fontSizes.$xs },
        sm: { fontSize: theme.fontSizes.$sm },
      },
      truncate: {
        true: {
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        },
      },
    },
  };
});

export type TextProps = PrimitiveProps<'p'> &
  StyleVariants<typeof applyVariants> & {
    as?: 'p' | 'div' | 'label' | 'code' | 'span';
  };

export const Text = (props: TextProps): JSX.Element => {
  const { as: As = 'p', ...rest } = props;
  return (
    // @ts-expect-error
    <As
      {...rest}
      css={applyVariants(props)}
    />
  );
};
