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
    // Cloning an element (rather than calling a render fn) is what lets overrides be plain
    // elements, which unlike functions serialize across the RSC boundary.
    //
    // Icon's `ref` is intentionally not forwarded to the override. It is typed for the built-in
    // `SVGSVGElement`, but an override can be any element, so forwarding would mistype it (or drop
    // it for a non-forwardRef component). A consumer that needs a ref puts one on the element they
    // author (`icons: { name: <svg ref={r} /> }`); cloneElement preserves it, since we do not set
    // `ref` here.
    //
    // SAFETY: React 18 types `ReactElement.props` as `any`; we only read an optional className to
    // merge with Mosaic's so a consumer's own class survives. cloneElement re-validates the merged
    // props against the element's real type at render, surfacing any mismatch there.
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
