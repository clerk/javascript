import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import type { IconProps } from '../icon';
import { sizes } from '../icon/icon.styles';
import { styles } from './provider-logo.styles';
import type { ProviderLogoGlyph } from './provider-logo.types';

export interface ProviderLogoProps extends MosaicElementProps<'svg'> {
  glyph: ProviderLogoGlyph;
  size?: IconProps['size'];
}

export const ProviderLogo = React.forwardRef<SVGSVGElement, ProviderLogoProps>(function MosaicProviderLogo(
  { glyph, size = 'md', xstyle, ...rest },
  ref,
) {
  const uid = React.useId().replace(/[^\w-]/g, '');
  const props = mergeStyleProps(
    { 'aria-hidden': true },
    themeProps('provider-logo', { size, provider: glyph.id }),
    stylex.props(reset.base, styles.base, sizes[size], xstyle),
    rest,
  );

  return (
    <svg
      ref={ref}
      viewBox={glyph.viewBox}
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      {glyph.render(uid)}
    </svg>
  );
});
