import React from 'react';

import { common, createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';

const { applyVariants, filterProps } = createVariants(theme => {
  return {
    base: {
      boxSizing: 'border-box',
      // TODO: this should probably be inherited
      // and handled through cards
      color: theme.colors.$colorText,
      margin: 0,
      fontSize: 'inherit',
    },
    variants: {
      variant: common.textVariants(theme),
      size: common.fontSizeVariants(theme),
      colorScheme: {
        primary: { color: theme.colors.$colorText },
        onPrimaryBg: { color: theme.colors.$colorTextOnPrimaryBackground },
        danger: { color: theme.colors.$danger500 },
        neutral: { color: theme.colors.$colorTextSecondary },
        inherit: { color: 'inherit' },
      },
      truncate: {
        true: {
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        },
      },
    },
    defaultVariants: {
      variant: 'regularRegular',
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
    // @ts-ignore
    <As
      {...filterProps(rest)}
      css={applyVariants(props)}
    />
  );
};
