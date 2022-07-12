const baseSpaceUnits = Object.freeze({
  none: '0',
  xxs: '0.5px',
  px: '1px',
} as const);

const dynamicSpaceUnits = Object.freeze({
  '0x5': '0.125rem',
  '1': '0.25rem',
  '1x5': '0.375rem',
  '2': '0.5rem',
  '2x5': '0.625rem',
  '3': '0.75rem',
  '3x5': '0.875rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '7': '1.75rem',
  '8': '2rem',
  '9': '2.25rem',
  '9x5': '2.375rem',
  '10': '2.5rem',
  '11': '2.75rem',
  '12': '3rem',
  '12x5': '3.125rem',
  '14': '3.5rem',
  '15': '3.75rem',
  '16': '4rem',
  '20': '5rem',
  '24': '6rem',
  '60': '15rem',
  '94': '23.5rem',
  '100': '25rem',
  '120': '30rem',
  '140': '35rem',
  '160': '40rem',
  '176': '44rem',
  '220': '55rem',
} as const);

/**
 * Instead of generating these values with the helpers of parseVariables,
 * we hard code them in order to have better intellisense support while developing
 */
const space = Object.freeze({
  ...baseSpaceUnits,
  ...dynamicSpaceUnits,
} as const);

const sizes = Object.freeze({ ...space } as const);

const radii = Object.freeze({
  none: '0px',
  circle: '50%',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '1rem',
  '2xl': '1.25rem',
} as const);

/**
 * Used by the space scale generation helpers.
 * These keys should always match {@link space}
 */
const spaceScaleKeys = Object.keys(dynamicSpaceUnits) as Array<keyof typeof dynamicSpaceUnits>;

export { sizes, space, radii, spaceScaleKeys };
