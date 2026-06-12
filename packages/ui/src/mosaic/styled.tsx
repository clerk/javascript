import React from 'react';

import type { CvaFn, SxProp, VariantProps, Variants } from './cva';

/** Props of a styled component: the wrapped component's props plus the cva's variant props (including `sx`). */
type StyledProps<C extends React.ComponentType<any>, V extends Variants> = React.ComponentProps<C> &
  VariantProps<CvaFn<V>>;

/**
 * Wraps a bridged mosaic primitive (e.g. `Dialog.Popup`) with a `cva` style
 * definition. Returns a `forwardRef` component whose props are the wrapped
 * component's props plus the cva's variant props (including `sx`).
 *
 * Variant keys are read from `styles._variants` and stripped from the props
 * before forwarding, so variant props never leak onto the DOM — there is no
 * list to keep in sync. The cva resolver is handed to the primitive as its
 * `sx` prop, which `withMosaicTheme` resolves against the theme.
 */
export function styled<C extends React.ComponentType<any>, V extends Variants>(
  Component: C,
  styles: CvaFn<V>,
): React.ForwardRefExoticComponent<
  React.PropsWithoutRef<StyledProps<C, V>> & React.RefAttributes<React.ElementRef<C>>
> {
  const variantKeys = Object.keys(styles._variants);
  // Bridged primitives forward refs at runtime; widen once so JSX accepts `ref` and the cva resolver as `sx`.
  const Forwarded = Component as React.ComponentType<
    Record<string, unknown> & { sx?: SxProp; ref?: React.Ref<unknown> }
  >;

  const Wrapped = React.forwardRef<React.ElementRef<C>, StyledProps<C, V>>(function Styled(props, ref) {
    const { sx, ...rest } = props as Record<string, unknown>;
    const variantArgs: Record<string, unknown> = { sx };
    for (const key of variantKeys) {
      if (key in rest) {
        variantArgs[key] = rest[key];
        delete rest[key];
      }
    }
    return (
      <Forwarded
        {...rest}
        ref={ref}
        sx={styles(variantArgs as Parameters<CvaFn<V>>[0])}
      />
    );
  });
  Wrapped.displayName = `Mosaic(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
}
