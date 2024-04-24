const baseSpaceUnits = Object.freeze({
  none: '0',
  xxs: '0.5px',
  px: '1px',
} as const);

const dynamicSpaceUnits = Object.freeze({
  '0x25': '0.0625rem',
  '0x5': '0.125rem',
  '1': '0.25rem',
  '1x5': '0.375rem',
  '2': '0.5rem',
  '2x5': '0.625rem',
  '3': '0.75rem',
  '3x25': '0.8125rem',
  '3x5': '0.875rem',
  '4': '1rem',
  '4x25': '1.0625rem',
  '5': '1.25rem',
  '5x5': '1.375rem',
  '6': '1.5rem',
  '7': '1.75rem',
  '7x5': '1.875rem',
  '8': '2rem',
  '8x5': '2.125rem',
  '9': '2.25rem',
  '10': '2.5rem',
  '12': '3rem',
  '13': '3.5rem',
  '16': '4rem',
  '17': '4.25rem',
  '20': '5rem',
  '24': '6rem',
  '28': '7rem',
  '32': '8rem',
  '36': '9rem',
  '40': '10rem',
  '44': '11rem',
  '48': '12rem',
  '52': '13rem',
  '56': '14rem',
  '57': '14.25rem',
  '60': '15rem',
  '66': '16.5rem',
  '94': '23.5rem',
  '100': '25rem',
  '108': '27rem',
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
  avatar: '0.375rem',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  halfHeight: '99999px',
} as const);

/**
 * Used by the space scale generation helpers.
 * These keys should always match {@link space}
 */
const spaceScaleKeys = Object.keys(dynamicSpaceUnits) as Array<keyof typeof dynamicSpaceUnits>;

export { sizes, space, radii, spaceScaleKeys };
