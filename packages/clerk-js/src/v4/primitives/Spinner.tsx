// eslint-disable-next-line no-restricted-imports
import { keyframes } from '@emotion/react';
import React from 'react';

import { createCssVariables, createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';

// TODO: Create wrapper
// Do not use directly
const spinning = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }`;

const { size, thickness, speed } = createCssVariables('speed', 'size', 'thickness');

const { applyVariants, filterProps } = createVariants(theme => {
  return {
    base: {
      display: 'inline-block',
      color: 'currentcolor',
      borderRadius: '99999px',
      borderTop: `${thickness} solid currentcolor`,
      borderRight: `${thickness} solid currentcolor`,
      borderBottomWidth: thickness,
      borderLeftWidth: thickness,
      borderBottomStyle: 'solid',
      borderLeftStyle: 'solid',
      borderBottomColor: theme.colors.$transparent,
      borderLeftColor: theme.colors.$transparent,
      animation: `${spinning} ${speed} linear 0s infinite normal none running`,
      width: [size],
      height: [size],
    },
    variants: {
      thickness: {
        sm: { [thickness]: theme.sizes.$0x5 },
        md: { [thickness]: theme.sizes.$1 },
      },
      size: {
        md: { [size]: theme.sizes.$4 },
        lg: { [size]: theme.sizes.$6 },
        xl: { [size]: theme.sizes.$8 },
      },
      speed: {
        slow: { [speed]: '600ms' },
        normal: { [speed]: '400ms' },
      },
    },
    defaultVariants: {
      speed: 'normal',
      thickness: 'sm',
      size: 'md',
    },
  };
});

export type SpinnerProps = PrimitiveProps<'div'> & StyleVariants<typeof applyVariants>;

export const Spinner = (props: SpinnerProps): JSX.Element => {
  return (
    <div
      {...filterProps(props)}
      css={applyVariants(props)}
    />
  );
};
