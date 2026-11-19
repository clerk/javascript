import * as stylex from '@stylexjs/stylex';
import * as React$1 from 'react';
import React from 'react';
import { RenderPropOrElement } from '@clerk/headless/utils';

//#region src/mosaic/components/avatar/avatar.d.ts
interface AvatarProps extends React.ComponentPropsWithRef<'span'> {
  shape?: 'circle' | 'square';
  size?: 'lg' | 'md' | 'sm' | 'xs';
}
type AvatarImageProps = React.ComponentPropsWithRef<'img'>;
interface AvatarFallbackProps extends React.ComponentPropsWithRef<'span'> {
  /** Wait this many ms before showing the fallback, to avoid a flash on fast connections. */
  delayMs?: number;
}
/**
 * Compound avatar. `Avatar.Root` clips and sizes the box; `Avatar.Image` renders
 * once its source loads; `Avatar.Fallback` shows until then.
 */
declare const Avatar: {
  Root: React.ForwardRefExoticComponent<Omit<AvatarProps, 'ref'> & React.RefAttributes<HTMLSpanElement>>;
  Image: React.ForwardRefExoticComponent<
    Omit<
      Omit<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, 'ref'> & {
        ref?:
          | ((
              instance: HTMLImageElement | null,
            ) =>
              | void
              | React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES])
          | React.RefObject<HTMLImageElement>
          | null
          | undefined;
      },
      'ref'
    > &
      React.RefAttributes<HTMLImageElement>
  >;
  Fallback: React.ForwardRefExoticComponent<Omit<AvatarFallbackProps, 'ref'> & React.RefAttributes<HTMLSpanElement>>;
};
//#endregion
//#region src/mosaic/props.d.ts
/**
 * The base props every Mosaic component accepts: the native props for its default
 * tag, plus the `render` escape hatch that swaps the rendered element.
 *
 * `color` is omitted because it is a non-standard HTML attribute typed `string`,
 * which would widen any component that exposes `color` as a variant. Omitting it
 * here rather than per component means a new component inherits the narrowing.
 */
type MosaicComponentProps<Tag extends keyof React.JSX.IntrinsicElements> = Omit<
  React.ComponentPropsWithRef<Tag>,
  'color'
> & {
  render?: RenderPropOrElement<Tag>;
};
type VariantValue = string | number | boolean | null | undefined;
/**
 * The stable class + variant reflection for a slot.
 *
 * Returns `{ className: 'cl-<slot>', 'data-<axis>': value, … }`. Each variant
 * axis becomes a `data-<axis>` attribute a consumer can scope overrides on.
 * Booleans reflect only when `true` (as an empty-string presence attr, mirroring
 * how the Emotion engine emitted `data-cl-disabled`); `null`/`undefined`/`false`
 * are skipped. The className is only the stable slot class — variant values live
 * in the data-attrs, not extra classes, to avoid colliding with consumer classes.
 */
declare function themeProps(
  slot: string,
  variants?: Record<string, VariantValue>,
): {
  className: string;
} & Record<string, string>;
type PropsObject = {
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
};
/**
 * Fuse `themeProps(...)`, `stylex.props(...)`, and the consumer's incoming
 * `className`/`style` into one spreadable object. Positional, mirroring astryx's
 * helper so the consumer's `className` and `style` can be passed raw:
 *
 *   mergeStyleProps(themeProps('button', { variant }), stylex.props(...), className, style)
 *
 * The trailing pair disambiguates by type — a string is a `className`, an object
 * is a `style` — which is why `style` is accepted directly rather than wrapped.
 * Order is deliberate: stable class + data-attrs, then StyleX atoms, then the
 * consumer's `className`/`style` last so they win.
 *
 * Distinct from `@clerk/headless`'s `mergeProps`: this only fuses styling output
 * (className/style) and does not chain event handlers.
 */
declare function mergeStyleProps(
  first: PropsObject,
  second?: PropsObject | string,
  classNameOrStyle?: string | React.CSSProperties,
  style?: React.CSSProperties,
): PropsObject;
//#endregion
//#region src/mosaic/components/badge/badge.d.ts
type BadgeProps = MosaicComponentProps<'span'> & {
  color?: 'primary' | 'neutral' | 'warning' | 'negative' | 'positive';
};
/**
 * A small label that annotates adjacent content with a status or category. Renders a
 * `span` by default and forwards its ref; `color` sets the semantic color and `render`
 * swaps the element for polymorphism (e.g. a link).
 *
 * @example
 * // Default (primary)
 * <Badge>New</Badge>
 *
 * @example
 * // Semantic color
 * <Badge color='positive'>Active</Badge>
 * <Badge color='negative'>Failed</Badge>
 *
 * @example
 * // Polymorphic: render as a link
 * <Badge render={<a href='/billing' />}>Upgrade</Badge>
 */
declare const Badge: React.ForwardRefExoticComponent<Omit<BadgeProps, 'ref'> & React.RefAttributes<HTMLSpanElement>>;
//#endregion
//#region src/mosaic/components/button/button.d.ts
interface ButtonProps extends React.ComponentPropsWithRef<'button'> {
  intent?: 'primary' | 'destructive';
  variant?: 'filled' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
  shape?: 'default' | 'square' | 'circle';
  fullWidth?: boolean;
}
/**
 * A clickable action styled by the Mosaic recipe. Renders a `button` and forwards its
 * ref; `intent`, `variant`, `size`, and `shape` compose to cover the full set of styles.
 *
 * @example
 * // Default (primary, filled, md)
 * <Button>Save</Button>
 *
 * @example
 * // Destructive intent with a non-filled variant
 * <Button intent='destructive' variant='outline'>Delete</Button>
 *
 * @example
 * // Icon-only, circular, small
 * <Button shape='circle' size='sm' aria-label='Close'><CloseIcon /></Button>
 *
 * @example
 * // Full-width ghost button
 * <Button variant='ghost' fullWidth>Continue</Button>
 */
declare const Button: React.ForwardRefExoticComponent<
  Omit<ButtonProps, 'ref'> & React.RefAttributes<HTMLButtonElement>
>;
//#endregion
//#region src/mosaic/components/typography.styles.d.ts
type TypographySize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
type TypographyColor = 'primary' | 'neutral' | 'warning' | 'negative' | 'positive';
//#endregion
//#region src/mosaic/components/heading/heading.d.ts
interface HeadingProps extends MosaicComponentProps<'h2'> {
  size?: TypographySize;
  color?: TypographyColor;
}
declare const HeadingContext: React.Context<Partial<HeadingProps> | null>;
/**
 * Themeable heading. Renders an `<h2>` by default, forwards refs, and supports
 * `size` and `color` variants. Pass `render` for a different heading level.
 */
declare const Heading: React.ForwardRefExoticComponent<
  Omit<HeadingProps, 'ref'> & React.RefAttributes<HTMLHeadingElement>
>;
//#endregion
//#region src/mosaic/icons/registry.d.ts
/** A default icon glyph — receives `svg` props (sizing/color flow in via `className`) and forwards a ref. */
type IconComponent = React$1.ForwardRefExoticComponent<
  React$1.ComponentPropsWithoutRef<'svg'> & React$1.RefAttributes<SVGSVGElement>
>;
/** Runtime name → glyph map. `Icon`'s `name` prop is typed from these keys. */
declare const iconRegistry: {
  'chevron-right': IconComponent;
  'chevron-left': IconComponent;
  'chevron-down': IconComponent;
  check: IconComponent;
  close: IconComponent;
};
type IconName = keyof typeof iconRegistry;
//#endregion
//#region src/mosaic/components/icon/icon.d.ts
interface IconProps extends React.ComponentPropsWithRef<'svg'> {
  name: IconName;
  size?: 'sm' | 'md' | 'lg';
  placement?: 'inline-start' | 'inline-end';
}
/**
 * Renders a Mosaic icon by name. The glyph can be swapped per-name via `appearance.icons` on
 * `MosaicProvider`; Mosaic's sizing is applied to the override exactly as it is to the built-in
 * glyph, so the two stay visually consistent.
 *
 * `placement` marks the icon as leading or trailing content within a container. It applies no
 * style here — it reflects an attribute the container styles against, so a `Button` can tighten
 * the padding on whichever side the icon sits. The values are the CSS logical directions, so they
 * follow the writing mode rather than naming a physical edge.
 */
declare const Icon: React.ForwardRefExoticComponent<Omit<IconProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
//#endregion
//#region src/mosaic/components/text/text.d.ts
interface TextProps extends MosaicComponentProps<'p'> {
  size?: TypographySize;
  color?: TypographyColor;
}
declare const TextContext: React.Context<Partial<TextProps> | null>;
/**
 * Themeable body copy. Renders a `<p>` by default, forwards refs, and supports
 * `size` and `color` variants. Pass `render` for inline copy (`<span>`).
 */
declare const Text: React.ForwardRefExoticComponent<Omit<TextProps, 'ref'> & React.RefAttributes<HTMLParagraphElement>>;
//#endregion
//#region src/mosaic/tokens.stylex.d.ts
declare const colorVars: stylex.VarGroup<
  Readonly<{
    readonly '--cl-color-primary': 'light-dark(oklch(0.205 0 0), oklch(0.922 0 0))';
    readonly '--cl-color-primary-foreground': 'light-dark(oklch(0.985 0 0), oklch(0.205 0 0))';
    readonly '--cl-color-primary-faded': 'light-dark(oklch(0.9583 0.0214 291.74), oklch(0.3097 0.1008 285.05))';
    readonly '--cl-color-neutral': 'light-dark(oklch(0.97 0 0), oklch(0.32 0 0))';
    readonly '--cl-color-neutral-foreground': 'light-dark(oklch(0.24 0 0), oklch(0.96 0 0))';
    readonly '--cl-color-negative': 'light-dark(oklch(0.577 0.245 27.325), oklch(0.637 0.237 25.331))';
    readonly '--cl-color-negative-foreground': 'oklch(0.985 0 0)';
    readonly '--cl-color-negative-faded': 'light-dark(oklch(0.9757 0.0118 17.36), oklch(0.255 0.0604 22.31))';
    readonly '--cl-color-positive': 'light-dark(oklch(0.548 0.153 152.535), oklch(0.696 0.17 162.48))';
    readonly '--cl-color-positive-foreground': 'oklch(0.985 0 0)';
    readonly '--cl-color-positive-faded': 'light-dark(oklch(0.9859 0.0164 156.92), oklch(0.3297 0.052 152.31))';
    readonly '--cl-color-warning': 'light-dark(oklch(0.646 0.222 41.116), oklch(0.75 0.183 55.934))';
    readonly '--cl-color-warning-foreground': 'oklch(0.985 0 0)';
    readonly '--cl-color-warning-faded': 'light-dark(oklch(0.9799 0.0147 70.89), oklch(0.2725 0.0547 55.7))';
    readonly '--cl-color-card': 'light-dark(oklch(1 0 0), oklch(0.205 0 0))';
    readonly '--cl-color-card-foreground': 'light-dark(oklch(0.145 0 0), oklch(0.985 0 0))';
    readonly '--cl-color-border': 'light-dark(oklch(0.922 0 0), oklch(1 0 0 / 10%))';
  }>,
  symbol
>;
declare const radiusVars: stylex.VarGroup<
  Readonly<{
    readonly '--cl-radius-none': '0rem';
    readonly '--cl-radius-inner': '0.25rem';
    readonly '--cl-radius-element': '0.5rem';
    readonly '--cl-radius-container': '0.75rem';
    readonly '--cl-radius-full': 'calc(infinity * 1px)';
  }>,
  symbol
>;
declare const spacingVars: stylex.VarGroup<
  Readonly<{
    readonly '--cl-spacing': '0.25rem';
  }>,
  symbol
>;
declare const space: stylex.VarGroup<
  Readonly<{
    '0': string;
    '0.5': string;
    '1': string;
    '1.5': string;
    '2': string;
    '2.5': string;
    '3': string;
    '3.5': string;
    '4': string;
    '5': string;
    '6': string;
    '7': string;
    '8': string;
    '9': string;
    '10': string;
    '11': string;
    '12': string;
  }>,
  symbol
>;
declare const typeScaleVars: stylex.VarGroup<
  Readonly<{
    readonly '--cl-text-xs-size': '0.75rem';
    readonly '--cl-text-xs-leading': 'calc(1 / 0.75)';
    readonly '--cl-text-sm-size': '0.875rem';
    readonly '--cl-text-sm-leading': 'calc(1.25 / 0.875)';
    readonly '--cl-text-base-size': '1rem';
    readonly '--cl-text-base-leading': 'calc(1.5 / 1)';
    readonly '--cl-text-lg-size': '1.125rem';
    readonly '--cl-text-lg-leading': 'calc(1.75 / 1.125)';
    readonly '--cl-text-xl-size': '1.25rem';
    readonly '--cl-text-xl-leading': 'calc(1.75 / 1.25)';
    readonly '--cl-text-2xl-size': '1.5rem';
    readonly '--cl-text-2xl-leading': 'calc(2 / 1.5)';
  }>,
  symbol
>;
declare const fontWeightVars: stylex.VarGroup<
  Readonly<{
    readonly '--cl-font-normal': '400';
    readonly '--cl-font-medium': '500';
    readonly '--cl-font-semibold': '600';
    readonly '--cl-font-bold': '700';
  }>,
  symbol
>;
//#endregion
//#region src/mosaic/styles/index.d.ts
type ColorVarName = keyof typeof colorVars;
type FontWeightVarName = keyof typeof fontWeightVars;
type RadiusVarName = keyof typeof radiusVars;
type SpacingVarName = keyof typeof spacingVars;
type TypeScaleVarName = keyof typeof typeScaleVars;
//#endregion
export {
  Avatar,
  type AvatarFallbackProps,
  type AvatarImageProps,
  type AvatarProps,
  Badge,
  type BadgeProps,
  Button,
  type ButtonProps,
  ColorVarName,
  FontWeightVarName,
  Heading,
  HeadingContext,
  type HeadingProps,
  Icon,
  type IconProps,
  RadiusVarName,
  SpacingVarName,
  Text,
  TextContext,
  type TextProps,
  TypeScaleVarName,
  colorVars,
  fontWeightVars,
  mergeStyleProps,
  radiusVars,
  space,
  spacingVars,
  themeProps,
  typeScaleVars,
};
//# sourceMappingURL=index.d.ts.map
