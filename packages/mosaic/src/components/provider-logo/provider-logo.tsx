import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import type { IconProps } from '../icon';
import { sizes } from '../icon/icon.styles';
import { providerLogoGlyphs } from './provider-logo.glyphs.generated';
import type { ProviderLogoId } from './provider-logo.ids.generated';
import { providerLogoIds } from './provider-logo.ids.generated';
import { styles } from './provider-logo.styles';

export interface ProviderLogoProps extends MosaicElementProps<'svg'> {
  provider: ProviderLogoId;
  size?: IconProps['size'];
}

const providerLogoIdSet: ReadonlySet<string> = new Set(providerLogoIds);

export function isProviderLogoId(value: string): value is ProviderLogoId {
  return providerLogoIdSet.has(value);
}

export const ProviderLogo = React.forwardRef<SVGSVGElement, ProviderLogoProps>(function MosaicProviderLogo(
  { provider, size = 'md', xstyle, ...rest },
  ref,
) {
  const glyph = providerLogoGlyphs[provider];
  const uid = React.useId().replace(/[^\w-]/g, '');
  const props = mergeStyleProps(
    { 'aria-hidden': true },
    themeProps('provider-logo', { size, provider }),
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
