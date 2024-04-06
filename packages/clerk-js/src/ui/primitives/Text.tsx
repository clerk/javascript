import React from 'react';

import type { PrimitiveProps, StyleVariants } from '../styledSystem';
import { common, createVariants } from '../styledSystem';
import { applyDataStateProps } from './applyDataStateProps';

const { applyVariants, filterProps } = createVariants(theme => {
  return {
    base: {
      boxSizing: 'border-box',
      // TODO: this should probably be inherited
      // and handled through cards
      color: theme.colors.$colorText,
      margin: 0,
      fontSize: 'inherit',
      ...common.disabled(theme),
    },
    variants: {
      variant: common.textVariants(theme),
      size: common.fontSizeVariants(theme),
      colorScheme: {
        primary: { color: theme.colors.$colorText },
        onPrimaryBg: { color: theme.colors.$colorTextOnPrimaryBackground },
        danger: { color: theme.colors.$danger500 },
        warning: { color: theme.colors.$warning500 },
        success: { color: theme.colors.$success500 },
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

// @ts-ignore
export type TextProps = PrimitiveProps<'p'> & { isDisabled?: boolean } & StyleVariants<typeof applyVariants> & {
    as?: 'p' | 'div' | 'label' | 'code' | 'span' | 'li' | 'a';
  };

export const Text = React.forwardRef<HTMLElement, TextProps>((props, ref): JSX.Element => {
  const { as: As = 'p', ...rest } = props;
  return (
    <As
      {...applyDataStateProps(filterProps(rest))}
      css={applyVariants(props)}
      ref={ref as unknown as any}
    />
  );
});
