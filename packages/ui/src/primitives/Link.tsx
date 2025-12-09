import { sanitizeHref } from '@clerk/shared/internal/clerk-js/url';
import React from 'react';

import type { PrimitiveProps, StyleVariants } from '../styledSystem';
import { common, createVariants } from '../styledSystem';
import { applyDataStateProps } from './applyDataStateProps';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    margin: 0,
    cursor: 'pointer',
    ...common.disabled(theme),
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
  },
  variants: {
    variant: common.textVariants(theme),
    colorScheme: {
      primary: {
        color: theme.colors.$primary500,
        '&:hover': { color: theme.colors.$primary400 },
        '&:active': { color: theme.colors.$primary600 },
      },
      danger: {
        color: theme.colors.$danger500,
        '&:hover': { color: theme.colors.$danger400 },
        '&:active': { color: theme.colors.$danger600 },
      },
      neutral: {
        color: theme.colors.$colorMutedForeground,
      },
      inherit: { color: 'inherit' },
    },
    focusRing: {
      true: {
        '&:focus': {
          outline: 'none',
          ...common.focusRing(theme),
        },
      },
    },
  },
  defaultVariants: {
    colorScheme: 'primary',
    variant: 'body',
    focusRing: false,
  },
}));

type OwnProps = { isExternal?: boolean; isDisabled?: boolean };

// @ts-ignore
export type LinkProps = PrimitiveProps<'a'> & OwnProps & StyleVariants<typeof applyVariants>;

export const Link = (props: LinkProps): JSX.Element => {
  const { isExternal, children, href, onClick, ...rest } = props;

  // Sanitize href to prevent dangerous protocols
  const sanitizedHref = sanitizeHref(href);

  const onClickHandler = onClick
    ? (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (!sanitizedHref) {
          e.preventDefault();
        }
        onClick(e);
      }
    : undefined;

  return (
    <a
      {...applyDataStateProps(filterProps(rest))}
      onClick={onClickHandler}
      href={sanitizedHref || ''}
      target={sanitizedHref && isExternal ? '_blank' : undefined}
      rel={sanitizedHref && isExternal ? 'noopener noreferrer' : undefined}
      css={applyVariants(props) as any}
    >
      {children}
    </a>
  );
};
