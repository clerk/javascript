import React from 'react';

import type { PrimitiveProps, StyleVariants } from '../styledSystem';
import { common, createVariants } from '../styledSystem';
import { applyDataStateProps } from './applyDataStateProps';

const { applyVariants, filterProps } = createVariants(theme => {
  return {
    base: {
      boxSizing: 'border-box',
      margin: 0,
      fontSize: 'inherit',
      ...common.disabled(theme),
    },
    variants: {
      variant: common.textVariants(theme),
      colorScheme: {
        body: { color: theme.colors.$colorForeground },
        onPrimaryBg: { color: theme.colors.$colorPrimaryForeground },
        danger: { color: theme.colors.$danger500 },
        success: { color: theme.colors.$success500 },
        warning: { color: theme.colors.$warning500 },
        secondary: { color: theme.colors.$colorMutedForeground },
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
      variant: 'body',
      colorScheme: 'inherit',
    },
  };
});

// @ts-ignore
export type TextProps = PrimitiveProps<'p'> & { isDisabled?: boolean } & StyleVariants<typeof applyVariants> & {
    as?: 'p' | 'div' | 'label' | 'code' | 'span' | 'li' | 'a';
  };

export const Text = React.forwardRef<HTMLElement, TextProps>((props, ref) => {
  const { as: As = 'p', ...rest } = props;
  return (
    <As
      {...applyDataStateProps(filterProps(rest))}
      css={applyVariants(props) as any}
      ref={ref as unknown as any}
    />
  );
});
