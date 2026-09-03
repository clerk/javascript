import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../utils/focus-outline.styles';
import { reset } from '../../utils/reset.styles';
import { ClerkLogo } from '../clerk-logo';
import { styles } from './branding.styles';

export type BrandingProps = Omit<MosaicComponentProps<'span'>, 'children'>;

/**
 * "Secured by Clerk". The one mark every branded surface signs with, so `Card` and `Profile` read
 * the same and an instance that has paid the branding off drops it in one place: the host's
 * `renderBranding`. The logo names the link, so a screen reader reaches "Clerk", not an unnamed link.
 */
export const Branding = React.forwardRef<HTMLSpanElement, BrandingProps>(function Branding(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('branding'), stylex.props(reset.base, styles.base), className, style),
      ...rest,
      children: (
        <>
          Secured by{' '}
          <a
            href='https://go.clerk.com/components'
            target='_blank'
            rel='noopener noreferrer'
            {...mergeStyleProps(
              themeProps('branding-link'),
              stylex.props(reset.base, styles.link, focusOutline.visible),
            )}
          >
            <ClerkLogo height={14} />
          </a>
        </>
      ),
    },
  });
});
