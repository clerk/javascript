import * as React from 'react';

/** A default icon glyph — receives `svg` props (sizing/color flow in via `className`) and forwards a ref. */
type IconComponent = React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'svg'> & React.RefAttributes<SVGSVGElement>
>;

/**
 * Builds a glyph from its inner `<path>` markup. Glyphs omit `width`/`height` so the `Icon` recipe
 * controls size, and use `currentColor` so they inherit text color. Grow the set on demand.
 */
function glyph(children: React.ReactNode, viewBox = '0 0 16 16'): IconComponent {
  return React.forwardRef<SVGSVGElement, React.ComponentPropsWithoutRef<'svg'>>((props, ref) => (
    <svg
      ref={ref}
      viewBox={viewBox}
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

const Ellipsis = glyph(
  <path
    d='M4 8h.008M8 8h.008M12 8h.008'
    {...strokeProps}
    strokeWidth={2.5}
  />,
);

const Plus = glyph(
  <path
    d='M8 3.75V12.25M3.75 8H12.25'
    {...strokeProps}
  />,
);

const ArrowRightTop = glyph(
  <path
    d='M6.35014 5.40727L10.8285 5.17157M10.8285 5.17157L10.5928 9.64991M10.8285 5.17157L5.17163 10.8284'
    {...strokeProps}
  />,
);

const Pen = glyph(
  <path
    clipRule='evenodd'
    d='M9.02209 2.97867C8.55345 2.50711 7.79511 2.50711 7.32647 2.97867L7.31857 2.98647L3.5273 6.65369C3.39533 6.78134 3.30375 6.94493 3.26392 7.12416L2.80602 9.1847L4.71264 8.73608C4.87966 8.69678 5.03269 8.6124 5.15506 8.49214L9.06427 4.65015C9.494 4.1715 9.47623 3.43565 9.02209 2.97867ZM6.53268 2.18146C7.44155 1.27145 8.91291 1.27285 9.82005 2.18566C10.7012 3.07231 10.7294 4.49927 9.88442 5.42042C9.87785 5.42757 9.87111 5.43455 9.86419 5.44135L5.94362 9.2945C5.67441 9.55909 5.33775 9.74472 4.97031 9.83117L2.19135 10.485C2.00293 10.5294 1.80496 10.4737 1.66724 10.3377C1.52953 10.2017 1.47142 10.0044 1.51341 9.81548L2.16571 6.88012C2.25333 6.48581 2.45481 6.12591 2.74514 5.84508L6.53268 2.18146Z'
    fill='currentColor'
    fillRule='evenodd'
  />,
  '0 0 12 12',
);

const LogOut = glyph(
  <path
    d='M6.25 13.25H3.75V2.75H6.25M10.25 10.75L13 8L10.25 5.25M13 8H6.25'
    {...strokeProps}
  />,
);

const AlertCircle = glyph(
  <>
    <circle
      cx='8'
      cy='8'
      r='5.25'
      {...strokeProps}
    />
    <path
      d='M8 5.25V8.5M8 10.75H8.008'
      {...strokeProps}
    />
  </>,
);

/** Runtime name → glyph map. `Icon`'s `name` prop is typed from these keys. */
export const iconRegistry = {
  'alert-circle': AlertCircle,
  'arrow-right-top': ArrowRightTop,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'chevron-down': ChevronDown,
  check: Check,
  close: Close,
  ellipsis: Ellipsis,
  pen: Pen,
  plus: Plus,
  'log-out': LogOut,
} satisfies Record<string, IconComponent>;

export type IconName = keyof typeof iconRegistry;
