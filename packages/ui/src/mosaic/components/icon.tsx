// eslint-disable-next-line no-restricted-imports
import { ClassNames } from '@emotion/react';
import React from 'react';

import { useMosaicIcons } from '../appearance';
import type { IconName } from '../icons/registry';
import { iconRegistry } from '../icons/registry';
import type { RecipeVariantProps } from '../slot-recipe';
import { defineSlotRecipe, useRecipe } from '../slot-recipe';

/** Mosaic icon slot recipe — sizes the glyph; color comes from `currentColor`. */
export const iconRecipe = defineSlotRecipe(theme => ({
  slot: 'icon',
  base: { display: 'inline-block', flexShrink: 0 },
  variants: {
    size: {
      sm: { width: theme.spacing(3.5), height: theme.spacing(3.5) },
      md: { width: theme.spacing(4), height: theme.spacing(4) },
      lg: { width: theme.spacing(5), height: theme.spacing(5) },
    },
  },
  defaultVariants: { size: 'md' },
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    icon: true;
  }
}

/** Props for the Icon component: svg attributes, recipe variants, and the required glyph `name`. */
export type IconProps = React.ComponentPropsWithRef<'svg'> & RecipeVariantProps<typeof iconRecipe> & { name: IconName };

/**
 * Renders a Mosaic icon by name. The glyph can be swapped per-name via `appearance.icons` on
 * `MosaicProvider`. Mosaic's recipe styling (sizing/color) is applied to *both* the built-in glyph and
 * an override so they stay visually consistent — the override element is cloned with the resolved
 * `className` (merged with its own), `data-cl-slot="icon"`, and forwarded props.
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(function MosaicIcon({ name, size, sx, ...rest }, ref) {
  const { root } = useRecipe(iconRecipe, { variants: { size }, sx });
  const override = useMosaicIcons()[name];

  if (override) {
    // The override is authored in a consumer file without the Emotion jsx pragma, so its own `css`
    // prop would be ignored. Serialize Mosaic's styling to a real `className` (via the Mosaic cache)
    // and inject it — plus `data-cl-slot` and the forwarded svg props — into the override element with
    // cloneElement, so it styles exactly like the built-in glyph. Cloning an element (rather than
    // calling a render fn) is what lets overrides be plain elements, which unlike functions serialize
    // across the RSC boundary.
    return (
      <ClassNames>
        {emotion => {
          // SAFETY: React 18 types `ReactElement.props` as `any`; we only read an optional className
          // to merge with Mosaic's so a consumer's own class survives. cloneElement re-validates the
          // merged props against the element's real type at render, surfacing any mismatch there.
          const overrideClassName = (override.props as { className?: string }).className;
          return React.cloneElement(override, {
            ...rest,
            'data-cl-slot': root['data-cl-slot'],
            className: emotion.cx(emotion.css(root.css), root.className, overrideClassName),
          });
        }}
      </ClassNames>
    );
  }

  const Glyph = iconRegistry[name];
  return (
    <Glyph
      ref={ref}
      {...root}
      {...rest}
    />
  );
});
