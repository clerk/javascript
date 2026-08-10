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

const ChevronUp = glyph(
  <path
    d='M4.75 10.25L8 6.75L11.25 10.25'
    {...strokeProps}
  />,
);

const ChevronUpDown = glyph(
  <path
    d='M5.75 6.5L8 4L10.25 6.5M5.75 10L8 12.5L10.25 10'
    {...strokeProps}
  />,
);

const Plus = glyph(
  <path
    d='M8 3.75V12.25M3.75 8H12.25'
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

const Cog = glyph(
  <path
    d='M8 7.98999V7.99999M3.46012 4.84271L2.81628 5.88403C2.68081 6.10314 2.76504 6.38383 2.9599 6.55612C3.82824 7.32388 3.82825 8.67611 2.95992 9.44387C2.76507 9.61616 2.68084 9.89685 2.81631 10.116L3.46014 11.1573C3.59 11.3673 3.86848 11.4338 4.11036 11.3616C5.26915 11.0161 6.54871 11.678 6.8223 12.8011C6.88157 13.0444 7.08518 13.25 7.34377 13.25H8.65623C8.91482 13.25 9.11842 13.0444 9.1777 12.8011C9.45129 11.678 10.7308 11.0161 11.8896 11.3616C12.1315 11.4338 12.41 11.3673 12.5399 11.1573L13.1837 10.116C13.3192 9.89685 13.2349 9.61616 13.0401 9.44387C12.1717 8.67611 12.1718 7.32388 13.0401 6.55612C13.235 6.38383 13.3192 6.10314 13.1837 5.88403L12.5399 4.84271C12.41 4.63267 12.1315 4.56622 11.8897 4.63835C10.7309 4.98389 9.45129 4.32196 9.1777 3.19892C9.11842 2.95562 8.91482 2.75 8.65623 2.75H7.34377C7.08518 2.75 6.88157 2.95562 6.8223 3.19892C6.54871 4.32196 5.26913 4.98389 4.11033 4.63835C3.86845 4.56622 3.58997 4.63267 3.46012 4.84271Z'
    {...strokeProps}
  />,
);

const Users = glyph(
  <path
    d='M10.4019 6C10.9101 5.69378 11.25 5.13658 11.25 4.5C11.25 3.86342 10.9101 3.30622 10.4019 3M9.5 13.25H12.4489C12.9612 13.25 13.3417 12.7993 13.2306 12.3242L13.0225 11.4345C12.8385 10.648 12.3786 9.97519 11.7524 9.49989M8.25 4.5C8.25 5.4665 7.4665 6.25 6.5 6.25C5.5335 6.25 4.75 5.4665 4.75 4.5C4.75 3.5335 5.5335 2.75 6.5 2.75C7.4665 2.75 8.25 3.5335 8.25 4.5ZM2.76939 12.3242L2.9775 11.4345C3.34439 9.86599 4.80874 8.75 6.5 8.75C8.19126 8.75 9.65561 9.86599 10.0225 11.4345L10.2306 12.3242C10.3417 12.7993 9.96121 13.25 9.44895 13.25H3.55105C3.03879 13.25 2.65827 12.7993 2.76939 12.3242Z'
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
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-up-down': ChevronUpDown,
  check: Check,
  close: Close,
  ellipsis: Ellipsis,
  pen: Pen,
  plus: Plus,
  'log-out': LogOut,
  cog: Cog,
  users: Users,
} satisfies Record<string, IconComponent>;

export type IconName = keyof typeof iconRegistry;
