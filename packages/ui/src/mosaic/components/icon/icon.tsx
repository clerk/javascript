import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useMosaicIcons } from '../../appearance';
import type { IconName } from '../../icons/registry';
import { iconRegistry } from '../../icons/registry';
import { mergeStyleProps, themeProps } from '../../props';
import { sizes, styles } from './icon.styles';

export interface IconProps extends React.ComponentPropsWithRef<'svg'> {
  name: IconName;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Renders a Mosaic icon by name. The glyph can be swapped per-name via `appearance.icons` on
 * `MosaicProvider`; Mosaic's sizing is applied to the override exactly as it is to the built-in
 * glyph, so the two stay visually consistent.
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(function MosaicIcon(
  { name, size = 'md', className, style, ...rest },
  ref,
) {
  const override = useMosaicIcons()[name];
  const props = mergeStyleProps(themeProps('icon', { size }), stylex.props(styles.base, sizes[size]), className, style);

  if (override) {
    // `ref` is deliberately not forwarded: it is typed for the built-in `SVGSVGElement`, but an
    // override can be any element. A consumer that needs one puts it on the element they author.
    //
    // SAFETY: React 18 types `ReactElement.props` as `any`; we only read an optional className.
    // cloneElement re-validates the merged props against the element's real type at render.
    const overrideClassName = (override.props as { className?: string }).className;
    return React.cloneElement(override, { ...rest, ...mergeStyleProps(props, overrideClassName) });
  }

  const Glyph = iconRegistry[name];
  return (
    <Glyph
      ref={ref}
      {...props}
      {...rest}
    />
  );
});
