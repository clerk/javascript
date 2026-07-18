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
    d='M8 3.75V8M8 8V12.25M8 8H12.25M8 8L3.75 8'
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

const SignOut = glyph(
  <path
    d='M10.7155 5.64655L13.25 8L10.7155 10.3534M13.069 8H7.09483M10.3534 2.75H4.19828C3.39841 2.75 2.75 3.39841 2.75 4.19828V11.8017C2.75 12.6016 3.39841 13.25 4.19828 13.25H10.3534'
    {...strokeProps}
  />,
);

/** Runtime name → glyph map. `Icon`'s `name` prop is typed from these keys. */
export const iconRegistry = {
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-up-down': ChevronUpDown,
  check: Check,
  close: Close,
  plus: Plus,
  cog: Cog,
  users: Users,
  'sign-out': SignOut,
} satisfies Record<string, IconComponent>;

export type IconName = keyof typeof iconRegistry;
