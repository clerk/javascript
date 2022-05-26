import React from 'react';
// @ts-ignore
import { default as LogoMarkIcon } from '@clerk/shared/assets/icons/logo-mark.svg';

import { AsProp, createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';
import { Text } from './Text';

const { applyVariants } = createVariants(theme => ({
  base: {
    boxSizing: 'border-box',
    backgroundColor: theme.colors.$primary500,
    flexCenter: '',
    color: theme.colors.$white,
    borderTopLeftRadius: theme.radii.$md,
    borderTopRightRadius: theme.radii.$md,
    transform: 'rotate(-90deg)',
    width: 'fit-content',
    padding: '8px 12px',
    position: 'absolute',
    left: '-89px',
    top: '81px',
    display: 'flex',
    justifyContent: 'center',
    // color: theme.colors.,
  },
  variants: {},
}));

export type SecuredByClerkProps = PrimitiveProps<'div'> & AsProp & StyleVariants<typeof applyVariants>;

export const SecuredByClerk = React.forwardRef<HTMLDivElement, SecuredByClerkProps>((props, ref) => {
  return (
    <div
      // {...rest}
      css={applyVariants(props)}
      ref={ref}
    >
      <Text as='span'>Secured by </Text>
      <a
        href='https://www.clerk.dev?utm_source=clerk&utm_medium=components'
        target='_blank'
        rel='noopener'
        className='cl-powered-by-clerk-logo'
      >
        <LogoMarkIcon />
      </a>
    </div>
  );
});
