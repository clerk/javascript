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
      colorScheme: {
        primary: { color: theme.colors.$colorText },
        onPrimaryBg: { color: theme.colors.$colorTextOnPrimaryBackground },
        danger: { color: theme.colors.$danger500 },
        success: { color: theme.colors.$success500 },
        neutral: { color: theme.colors.$colorTextSecondary },
        tertiary: { color: theme.colors.$colorTextTertiary },
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
