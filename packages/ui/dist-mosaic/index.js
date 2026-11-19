import * as stylex from '@stylexjs/stylex';
import * as React$1 from 'react';
import React from 'react';
import { jsx } from 'react/jsx-runtime';
import { useRender } from '@clerk/headless/utils';

//#region src/mosaic/props.ts
const kebab = name => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
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
function themeProps(slot, variants) {
  const attrs = {};
  for (const [axis, value] of Object.entries(variants ?? {})) {
    if (value == null || value === false) continue;
    attrs[`data-${kebab(axis)}`] = value === true ? '' : String(value);
  }
  return {
    className: `cl-${slot}`,
    ...attrs,
  };
}
/** Merge two prop bags, concatenating `className` and spreading `style` (overrides last). */
function mergeTwoProps(base, overrides) {
  const merged = {
    ...base,
    ...overrides,
  };
  const cls = [base.className, overrides.className].filter(Boolean).join(' ');
  if (cls) merged.className = cls;
  else delete merged.className;
  const mergedStyle =
    overrides.style && base.style
      ? {
          ...base.style,
          ...overrides.style,
        }
      : overrides.style || base.style;
  if (mergedStyle) merged.style = mergedStyle;
  else delete merged.style;
  return merged;
}
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
function mergeStyleProps(first, second, classNameOrStyle, style) {
  let merged = mergeTwoProps(first, typeof second === 'string' ? { className: second } : (second ?? {}));
  if (typeof classNameOrStyle === 'string') merged = mergeTwoProps(merged, { className: classNameOrStyle });
  else if (classNameOrStyle != null) merged = mergeTwoProps(merged, { style: classNameOrStyle });
  if (style != null) merged = mergeTwoProps(merged, { style });
  return merged;
}

//#endregion
//#region src/mosaic/tokens.stylex.ts
const colorVars = {
  '--cl-color-primary': 'var(--cl-color-primary)',
  '--cl-color-primary-foreground': 'var(--cl-color-primary-foreground)',
  '--cl-color-primary-faded': 'var(--cl-color-primary-faded)',
  '--cl-color-neutral': 'var(--cl-color-neutral)',
  '--cl-color-neutral-foreground': 'var(--cl-color-neutral-foreground)',
  '--cl-color-negative': 'var(--cl-color-negative)',
  '--cl-color-negative-foreground': 'var(--cl-color-negative-foreground)',
  '--cl-color-negative-faded': 'var(--cl-color-negative-faded)',
  '--cl-color-positive': 'var(--cl-color-positive)',
  '--cl-color-positive-foreground': 'var(--cl-color-positive-foreground)',
  '--cl-color-positive-faded': 'var(--cl-color-positive-faded)',
  '--cl-color-warning': 'var(--cl-color-warning)',
  '--cl-color-warning-foreground': 'var(--cl-color-warning-foreground)',
  '--cl-color-warning-faded': 'var(--cl-color-warning-faded)',
  '--cl-color-card': 'var(--cl-color-card)',
  '--cl-color-card-foreground': 'var(--cl-color-card-foreground)',
  '--cl-color-border': 'var(--cl-color-border)',
  __varGroupHash__: 'x1pppt44',
};
const radiusVars = {
  '--cl-radius-none': 'var(--cl-radius-none)',
  '--cl-radius-inner': 'var(--cl-radius-inner)',
  '--cl-radius-element': 'var(--cl-radius-element)',
  '--cl-radius-container': 'var(--cl-radius-container)',
  '--cl-radius-full': 'var(--cl-radius-full)',
  __varGroupHash__: 'xo5lcej',
};
const spacingVars = {
  '--cl-spacing': 'var(--cl-spacing)',
  __varGroupHash__: 'xwhwew9',
};
const space = {
  0: 'var(--x1mjdd8l)',
  1: 'var(--x1a53y5a)',
  2: 'var(--xdy756j)',
  3: 'var(--xy9qo3a)',
  4: 'var(--xhc2ez)',
  5: 'var(--x192isxn)',
  6: 'var(--x1ovo3dy)',
  7: 'var(--xr8u8ci)',
  8: 'var(--x1mx0i3q)',
  9: 'var(--xzvjavo)',
  10: 'var(--x1j5xiwv)',
  11: 'var(--x1bmhtkd)',
  12: 'var(--xmufy6b)',
  0.5: 'var(--xq0ngzb)',
  1.5: 'var(--x1si9mhm)',
  2.5: 'var(--xkzh3wu)',
  3.5: 'var(--xtthhbj)',
  __varGroupHash__: 'xh18x0r',
};
const typeScaleVars = {
  '--cl-text-xs-size': 'var(--cl-text-xs-size)',
  '--cl-text-xs-leading': 'var(--cl-text-xs-leading)',
  '--cl-text-sm-size': 'var(--cl-text-sm-size)',
  '--cl-text-sm-leading': 'var(--cl-text-sm-leading)',
  '--cl-text-base-size': 'var(--cl-text-base-size)',
  '--cl-text-base-leading': 'var(--cl-text-base-leading)',
  '--cl-text-lg-size': 'var(--cl-text-lg-size)',
  '--cl-text-lg-leading': 'var(--cl-text-lg-leading)',
  '--cl-text-xl-size': 'var(--cl-text-xl-size)',
  '--cl-text-xl-leading': 'var(--cl-text-xl-leading)',
  '--cl-text-2xl-size': 'var(--cl-text-2xl-size)',
  '--cl-text-2xl-leading': 'var(--cl-text-2xl-leading)',
  __varGroupHash__: 'x1wvf28a',
};
const fontWeightVars = {
  '--cl-font-normal': 'var(--cl-font-normal)',
  '--cl-font-medium': 'var(--cl-font-medium)',
  '--cl-font-semibold': 'var(--cl-font-semibold)',
  '--cl-font-bold': 'var(--cl-font-bold)',
  __varGroupHash__: 'xbaf74w',
};

//#endregion
//#region src/mosaic/components/avatar/avatar.styles.ts
const styles$4 = {
  base: {
    kVQacm: 'xb3r6kr',
    kGNEyG: 'x6s0dn4',
    kB7OPa: 'x9f619',
    k1xSpc: 'x3nfvp2',
    kmuXW: 'x2lah0s',
    kMv6JI: 'xjb2p0i',
    k63SB2: 'x1356bol',
    kjj79g: 'xl56j7k',
    kLWn49: 'xo5v014',
    kVAEAm: 'x1n2onr6',
    kfSwDN: 'x87ps6o',
    kXLuUW: 'xxymvpz',
    $$css: true,
  },
  image: {
    kOBAk4: 'x1y5e3q9',
    k1xSpc: 'x1lliihq',
    kVIFPx: 'xl1xv1r',
    kZKoxP: 'x5yr21d',
    kzqmXN: 'xh8yej3',
    $$css: true,
  },
  fallback: {
    kGNEyG: 'x6s0dn4',
    kWkggS: 'xog9o3t',
    kMwMTN: 'x1dky8hy',
    k1xSpc: 'x78zum5',
    kGuDYH: 'x1qlqyl8',
    kjj79g: 'xl56j7k',
    kZKoxP: 'x5yr21d',
    kzqmXN: 'xh8yej3',
    $$css: true,
  },
};
const shapes = {
  circle: {
    kaIpWk: 'xsq0ucf',
    $$css: true,
  },
  square: {
    kaIpWk: 'x6i6fhv',
    $$css: true,
  },
};
const sizes$2 = {
  xs: {
    kGuDYH: 'x2ohwh0',
    kZKoxP: 'x1tx717c',
    kzqmXN: 'x1i4fex1',
    $$css: true,
  },
  sm: {
    kGuDYH: 'xboafo0',
    kZKoxP: 'x5ueopp',
    kzqmXN: 'xdlblfk',
    $$css: true,
  },
  md: {
    kGuDYH: 'xkpwil5',
    kZKoxP: 'xxgb554',
    kzqmXN: 'x14m2bez',
    $$css: true,
  },
  lg: {
    kGuDYH: 'x1jchvi3',
    kZKoxP: 'xahslz',
    kzqmXN: 'xcbigqw',
    $$css: true,
  },
};

//#endregion
//#region src/mosaic/components/avatar/avatar.tsx
const AvatarContext = React.createContext(null);
function useAvatarContext(part) {
  const context = React.useContext(AvatarContext);
  if (!context) throw new Error(`<${part}> must be rendered inside <Avatar.Root>`);
  return context;
}
const AvatarRoot = React.forwardRef(function MosaicAvatarRoot(
  { shape = 'circle', size = 'md', className, style, children, ...rest },
  ref,
) {
  const [status, setStatus] = React.useState('idle');
  const value = React.useMemo(
    () => ({
      status,
      onStatusChange: setStatus,
    }),
    [status],
  );
  return /* @__PURE__ */ jsx(AvatarContext.Provider, {
    value,
    children: /* @__PURE__ */ jsx('span', {
      ref,
      ...mergeStyleProps(
        themeProps('avatar', {
          shape,
          size,
        }),
        stylex.props(styles$4.base, shapes[shape], sizes$2[size]),
        className,
        style,
      ),
      ...rest,
      children,
    }),
  });
});
const AvatarImage = React.forwardRef(function MosaicAvatarImage({ src, alt = '', className, style, ...rest }, ref) {
  const { status, onStatusChange } = useAvatarContext('Avatar.Image');
  React.useEffect(() => {
    if (!src) {
      onStatusChange('error');
      return;
    }
    let active = true;
    const image = new window.Image();
    onStatusChange('loading');
    image.onload = () => active && onStatusChange('loaded');
    image.onerror = () => active && onStatusChange('error');
    image.src = src;
    return () => {
      active = false;
    };
  }, [src, onStatusChange]);
  if (status !== 'loaded') return null;
  return /* @__PURE__ */ jsx('img', {
    ref,
    src,
    alt,
    ...mergeStyleProps(themeProps('avatar-image'), stylex.props(styles$4.image), className, style),
    ...rest,
  });
});
const AvatarFallback = React.forwardRef(function MosaicAvatarFallback(
  { delayMs, className, style, children, ...rest },
  ref,
) {
  const { status } = useAvatarContext('Avatar.Fallback');
  const [canRender, setCanRender] = React.useState(delayMs === void 0);
  React.useEffect(() => {
    if (delayMs === void 0) return;
    const timer = setTimeout(() => setCanRender(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);
  if (!canRender || status === 'loaded') return null;
  return /* @__PURE__ */ jsx('span', {
    ref,
    ...mergeStyleProps(themeProps('avatar-fallback'), stylex.props(styles$4.fallback), className, style),
    ...rest,
    children,
  });
});
/**
 * Compound avatar. `Avatar.Root` clips and sizes the box; `Avatar.Image` renders
 * once its source loads; `Avatar.Fallback` shows until then.
 */
const Avatar = {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
};

//#endregion
//#region src/mosaic/components/badge/badge.styles.ts
const styles$3 = {
  base: {
    kaIpWk: 'xsq0ucf',
    kOIVth: 'x1kkcdw1',
    kg3NbH: 'x1frjxyn',
    kGNEyG: 'x6s0dn4',
    kB7OPa: 'x9f619',
    k1xSpc: 'x3nfvp2',
    kMv6JI: 'xjb2p0i',
    kGuDYH: 'xoquv76',
    k63SB2: 'x1356bol',
    kjj79g: 'xl56j7k',
    kLWn49: 'x1s3bc0o',
    khDVqt: 'xuxw1ft',
    kZKoxP: 'x13bvjdt',
    $$css: true,
  },
};
const colors$1 = {
  primary: {
    kWkggS: 'x8iw500',
    kMwMTN: 'x1dssb7w',
    $$css: true,
  },
  neutral: {
    kWkggS: 'xog9o3t',
    kMwMTN: 'x1dky8hy',
    $$css: true,
  },
  warning: {
    kWkggS: 'x1js9a9q',
    kMwMTN: 'x1v0fbtm',
    $$css: true,
  },
  negative: {
    kWkggS: 'x1v0n27i',
    kMwMTN: 'xon2h3r',
    $$css: true,
  },
  positive: {
    kWkggS: 'xvifhcz',
    kMwMTN: 'x1clqapk',
    $$css: true,
  },
};

//#endregion
//#region src/mosaic/components/badge/badge.tsx
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
const Badge = React.forwardRef(function MosaicBadge({ color = 'primary', render, className, style, ...rest }, ref) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('badge', { color }),
        stylex.props(styles$3.base, colors$1[color]),
        className,
        style,
      ),
      ...rest,
    },
  });
});

//#endregion
//#region src/mosaic/components/button/button.styles.ts
const styles$2 = {
  base: {
    kVAM5u: 'x9r1u3d',
    kaIpWk: 'xiy5lx6',
    ksu8eU: 'x1y0btm7',
    kMzoRj: 'xmkeg23',
    kOIVth: 'x23m7v',
    kI3sdo: 'x1a2a7pz x2gs3dh',
    kGNEyG: 'x6s0dn4',
    kB7OPa: 'x9f619',
    kkrTdU: 'x1ypdohk',
    k1xSpc: 'x3nfvp2',
    kMv6JI: 'xjb2p0i',
    k63SB2: 'x1356bol',
    kjj79g: 'xl56j7k',
    kInvED: 'x1hl8ikr',
    kIyJzY: 'xx6bhzk',
    k1ekBW: 'x1qsmvhx',
    $$css: true,
  },
  filledPrimary: {
    kWkggS: 'x8iw500 x1ozrsgg x1f1bnkq',
    kMwMTN: 'x1dssb7w',
    $$css: true,
  },
  filledDestructive: {
    kWkggS: 'x1i7qlve xeo93gq x1ar1xdf',
    kMwMTN: 'x17h5lh2',
    $$css: true,
  },
  outlinePrimary: {
    kVAM5u: 'x7vjwj5',
    kWkggS: 'xjbqb8w',
    kMwMTN: 'xfuwino',
    $$css: true,
  },
  outlineDestructive: {
    kVAM5u: 'x7vjwj5',
    kWkggS: 'xjbqb8w',
    kMwMTN: 'xon2h3r',
    $$css: true,
  },
  ghostPrimary: {
    kWkggS: 'xjbqb8w',
    kMwMTN: 'xfuwino',
    $$css: true,
  },
  ghostDestructive: {
    kWkggS: 'xjbqb8w',
    kMwMTN: 'xon2h3r',
    $$css: true,
  },
  sizeSm: {
    kg3NbH: 'x1frjxyn',
    kGuDYH: 'xoquv76',
    kLWn49: 'x1s3bc0o',
    kZKoxP: 'xpd21ip',
    $$css: true,
  },
  sizeMd: {
    kg3NbH: 'xqgele8',
    kGuDYH: 'xycjmc8',
    kLWn49: 'x4wh5sz',
    kZKoxP: 'x5ueopp',
    $$css: true,
  },
  shapeSquare: {
    kaIpWk: 'xiy5lx6',
    kg3NbH: 'xnjsko4',
    $$css: true,
  },
  shapeCircle: {
    kaIpWk: 'xsq0ucf',
    kg3NbH: 'xnjsko4',
    $$css: true,
  },
  iconSizeSm: {
    kzqmXN: 'xxh3iqc',
    $$css: true,
  },
  iconSizeMd: {
    kzqmXN: 'xdlblfk',
    $$css: true,
  },
  fullWidth: {
    kzqmXN: 'xh8yej3',
    $$css: true,
  },
  disabled: {
    kkrTdU: 'x1h6gzvc',
    kSiTet: 'xbyyjgo',
    kfzvcC: 'x47corl',
    $$css: true,
  },
};

//#endregion
//#region src/mosaic/components/button/button.tsx
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
const Button = React.forwardRef(function MosaicButton(
  {
    intent = 'primary',
    variant = 'filled',
    size = 'md',
    shape = 'default',
    fullWidth = false,
    disabled = false,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const isIconShape = shape === 'square' || shape === 'circle';
  return /* @__PURE__ */ jsx('button', {
    ref,
    type: 'button',
    disabled,
    ...mergeStyleProps(
      themeProps('button', {
        intent,
        variant,
        size,
        shape,
        fullWidth,
        disabled,
      }),
      stylex.props(
        styles$2.base,
        variant === 'filled' && intent === 'primary' && styles$2.filledPrimary,
        variant === 'filled' && intent === 'destructive' && styles$2.filledDestructive,
        variant === 'outline' && intent === 'primary' && styles$2.outlinePrimary,
        variant === 'outline' && intent === 'destructive' && styles$2.outlineDestructive,
        variant === 'ghost' && intent === 'primary' && styles$2.ghostPrimary,
        variant === 'ghost' && intent === 'destructive' && styles$2.ghostDestructive,
        size === 'sm' ? styles$2.sizeSm : styles$2.sizeMd,
        shape === 'square' && styles$2.shapeSquare,
        shape === 'circle' && styles$2.shapeCircle,
        isIconShape && (size === 'sm' ? styles$2.iconSizeSm : styles$2.iconSizeMd),
        fullWidth && styles$2.fullWidth,
        disabled && styles$2.disabled,
      ),
      className,
      style,
    ),
    ...rest,
    children,
  });
});

//#endregion
//#region src/mosaic/utils/context.ts
function useContextProps(props, context) {
  const ctx = React.useContext(context);
  if (!ctx) return props;
  const result = { ...ctx };
  for (const key of Object.keys(props)) if (props[key] !== void 0) result[key] = props[key];
  return result;
}

//#endregion
//#region src/mosaic/components/typography.styles.ts
const sizes$1 = {
  xs: {
    kGuDYH: 'xoquv76',
    kLWn49: 'x1s3bc0o',
    $$css: true,
  },
  sm: {
    kGuDYH: 'xycjmc8',
    kLWn49: 'x4wh5sz',
    $$css: true,
  },
  base: {
    kGuDYH: 'xiavimo',
    kLWn49: 'x60xny5',
    $$css: true,
  },
  lg: {
    kGuDYH: 'x10wtlqb',
    kLWn49: 'xlz07k7',
    $$css: true,
  },
  xl: {
    kGuDYH: 'x151w8eg',
    kLWn49: 'xbuswt8',
    $$css: true,
  },
  '2xl': {
    kGuDYH: 'xmrwz5s',
    kLWn49: 'x1k5ophi',
    $$css: true,
  },
};
const colors = {
  primary: {
    kMwMTN: 'xfuwino',
    $$css: true,
  },
  neutral: {
    kMwMTN: 'x1dky8hy',
    $$css: true,
  },
  warning: {
    kMwMTN: 'x1v0fbtm',
    $$css: true,
  },
  negative: {
    kMwMTN: 'xon2h3r',
    $$css: true,
  },
  positive: {
    kMwMTN: 'x1clqapk',
    $$css: true,
  },
};

//#endregion
//#region src/mosaic/components/heading/heading.styles.ts
const styles$1 = {
  base: {
    k63SB2: 'x15k4r3u',
    $$css: true,
  },
};

//#endregion
//#region src/mosaic/components/heading/heading.tsx
const HeadingContext = React.createContext(null);
/**
 * Themeable heading. Renders an `<h2>` by default, forwards refs, and supports
 * `size` and `color` variants. Pass `render` for a different heading level.
 */
const Heading = React.forwardRef(function MosaicHeading(rawProps, ref) {
  const {
    size = 'base',
    color = 'primary',
    render,
    className,
    style,
    ...rest
  } = useContextProps(rawProps, HeadingContext);
  const props = {
    ...mergeStyleProps(
      themeProps('heading', {
        size,
        color,
      }),
      stylex.props(styles$1.base, sizes$1[size], colors[color]),
      className,
      style,
    ),
    ...rest,
  };
  const element = useRender({
    defaultTagName: 'h2',
    render,
    ref,
    enabled: Boolean(render),
    props,
  });
  if (element) return element;
  return /* @__PURE__ */ jsx('h2', {
    ref,
    ...props,
  });
});

//#endregion
//#region src/mosaic/appearance.ts
const MosaicAppearanceContext = React$1.createContext([]);
const MosaicAppearanceProvider = MosaicAppearanceContext.Provider;
const MosaicIconsContext = React$1.createContext({});
const MosaicIconsProvider = MosaicIconsContext.Provider;
/** Returns the icon glyph overrides from the nearest `MosaicProvider` (or `{}` standalone). */
const useMosaicIcons = () => React$1.useContext(MosaicIconsContext);

//#endregion
//#region src/mosaic/icons/registry.tsx
/**
 * Builds a glyph from its inner `<path>` markup. Glyphs omit `width`/`height` so the `Icon` recipe
 * controls size, and use `currentColor` so they inherit text color. Grow the set on demand.
 */
function glyph(children) {
  return React$1.forwardRef((props, ref) =>
    /* @__PURE__ */ jsx('svg', {
      ref,
      viewBox: '0 0 16 16',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      ...props,
      children,
    }),
  );
}
const strokeProps = {
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};
const ChevronRight = glyph(
  /* @__PURE__ */ jsx('path', {
    d: 'M6.75 11.25L10.25 8L6.75 4.75',
    ...strokeProps,
  }),
);
const ChevronLeft = glyph(
  /* @__PURE__ */ jsx('path', {
    d: 'M9.25 11.25L5.75 8L9.25 4.75',
    ...strokeProps,
  }),
);
const ChevronDown = glyph(
  /* @__PURE__ */ jsx('path', {
    d: 'M4.75 6.75L8 10.25L11.25 6.75',
    ...strokeProps,
  }),
);
const Check = glyph(
  /* @__PURE__ */ jsx('path', {
    d: 'M3.75 8.5L6.5 11.25L12.25 4.75',
    ...strokeProps,
  }),
);
const Close = glyph(
  /* @__PURE__ */ jsx('path', {
    d: 'M4.75 4.75L11.25 11.25M11.25 4.75L4.75 11.25',
    ...strokeProps,
  }),
);
/** Runtime name → glyph map. `Icon`'s `name` prop is typed from these keys. */
const iconRegistry = {
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'chevron-down': ChevronDown,
  check: Check,
  close: Close,
};

//#endregion
//#region src/mosaic/components/icon/icon.styles.ts
const styles = {
  base: {
    k1xSpc: 'x1rg5ohu',
    kmuXW: 'x2lah0s',
    $$css: true,
  },
};
const sizes = {
  sm: {
    kZKoxP: 'xjyqqt9',
    kzqmXN: 'x125yc2o',
    $$css: true,
  },
  md: {
    kZKoxP: 'x1jumdjj',
    kzqmXN: 'xrv0xk7',
    $$css: true,
  },
  lg: {
    kZKoxP: 'x13bvjdt',
    kzqmXN: 'xb8nub8',
    $$css: true,
  },
};

//#endregion
//#region src/mosaic/components/icon/icon.tsx
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
const Icon = React.forwardRef(function MosaicIcon({ name, size = 'md', placement, className, style, ...rest }, ref) {
  const override = useMosaicIcons()[name];
  const props = mergeStyleProps(
    themeProps('icon', {
      size,
      icon: placement,
    }),
    stylex.props(styles.base, sizes[size]),
    className,
    style,
  );
  if (override) {
    const overrideClassName = override.props.className;
    return React.cloneElement(override, {
      ...rest,
      ...mergeStyleProps(props, overrideClassName),
    });
  }
  const Glyph = iconRegistry[name];
  return /* @__PURE__ */ jsx(Glyph, {
    ref,
    ...props,
    ...rest,
  });
});

//#endregion
//#region src/mosaic/components/text/text.tsx
const TextContext = React.createContext(null);
/**
 * Themeable body copy. Renders a `<p>` by default, forwards refs, and supports
 * `size` and `color` variants. Pass `render` for inline copy (`<span>`).
 */
const Text = React.forwardRef(function MosaicText(rawProps, ref) {
  const { size = 'sm', color = 'primary', render, className, style, ...rest } = useContextProps(rawProps, TextContext);
  const props = {
    ...mergeStyleProps(
      themeProps('text', {
        size,
        color,
      }),
      stylex.props(sizes$1[size], colors[color]),
      className,
      style,
    ),
    ...rest,
  };
  const element = useRender({
    defaultTagName: 'p',
    render,
    ref,
    enabled: Boolean(render),
    props,
  });
  if (element) return element;
  return /* @__PURE__ */ jsx('p', {
    ref,
    ...props,
  });
});

//#endregion
export {
  Avatar,
  Badge,
  Button,
  Heading,
  HeadingContext,
  Icon,
  Text,
  TextContext,
  colorVars,
  fontWeightVars,
  mergeStyleProps,
  radiusVars,
  space,
  spacingVars,
  themeProps,
  typeScaleVars,
};
//# sourceMappingURL=index.js.map
