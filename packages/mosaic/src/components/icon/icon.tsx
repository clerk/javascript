import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { IconComponent } from '../../icons/glyph';
import { useMosaicIcons } from '../../icons/overrides';
import type { MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { iconScope } from './icon.markers.stylex';
import { sizes, styles } from './icon.styles';

export interface IconProps extends MosaicElementProps<'svg'> {
  glyph: IconComponent;
  size?: 'sm' | 'md' | 'lg' | 'inherit';
}

/**
 * Renders a Mosaic glyph. The glyph can be swapped by its name via the `icons` prop on
 * `MosaicProvider`; Mosaic's sizing is applied to the override exactly as it is to the built-in
 * glyph, so the two stay visually consistent.
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(function MosaicIcon(
  { glyph: Glyph, size = 'md', xstyle, ...rest },
  ref,
) {
  const override = useMosaicIcons()[Glyph.iconName];
  const props = mergeStyleProps(
    { 'aria-hidden': true },
    themeProps('icon', { size }),
    stylex.props(reset.base, styles.base, sizes[size], iconScope, xstyle),
    rest,
  );

  if (override) {
    // `ref` is deliberately not forwarded: it is typed for the built-in `SVGSVGElement`, but an
    // override can be any element. A consumer that needs one puts it on the element they author.
    //
    // SAFETY: React 18 types `ReactElement.props` as `any`; we only read an optional className.
    // cloneElement re-validates the merged props against the element's real type at render.
    // eslint-disable-next-line typescript/consistent-type-assertions -- Read the optional class name from an externally supplied element.
    const overrideClassName = (override.props as { className?: string }).className;
    return React.cloneElement(override, mergeStyleProps(props, { className: overrideClassName }));
  }

  return (
    <Glyph
      ref={ref}
      {...props}
    />
  );
});
