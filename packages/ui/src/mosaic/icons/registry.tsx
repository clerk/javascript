import * as React from 'react';

/** A default icon glyph — receives `svg` props (sizing/color flow in via `className`) and forwards a ref. */
type IconComponent = React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'svg'> & React.RefAttributes<SVGSVGElement>
>;

/**
 * Builds a glyph from its inner `<path>` markup. Glyphs omit `width`/`height` so the `Icon` recipe
 * controls size, and use `currentColor` so they inherit text color. Grow the set on demand.
 */
function glyph(children: React.ReactNode): IconComponent {
  return React.forwardRef<SVGSVGElement, React.ComponentPropsWithoutRef<'svg'>>((props, ref) => (
    <svg
      ref={ref}
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      {children}
    </svg>
  ));
}

const strokeProps = {
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const ChevronRight = glyph(
  <path
    d='M6.75 11.25L10.25 8L6.75 4.75'
    {...strokeProps}
  />,
);

const ChevronLeft = glyph(
  <path
    d='M9.25 11.25L5.75 8L9.25 4.75'
    {...strokeProps}
  />,
);

const ChevronDown = glyph(
  <path
    d='M4.75 6.75L8 10.25L11.25 6.75'
    {...strokeProps}
  />,
);

const Check = glyph(
  <path
    d='M3.75 8.5L6.5 11.25L12.25 4.75'
    {...strokeProps}
  />,
);

const Close = glyph(
  <path
    d='M4.75 4.75L11.25 11.25M11.25 4.75L4.75 11.25'
    {...strokeProps}
  />,
);

/** Runtime name → glyph map. `Icon`'s `name` prop is typed from these keys. */
export const iconRegistry = {
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'chevron-down': ChevronDown,
  check: Check,
  close: Close,
} satisfies Record<string, IconComponent>;

export type IconName = keyof typeof iconRegistry;
