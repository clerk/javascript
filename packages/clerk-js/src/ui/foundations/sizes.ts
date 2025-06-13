import { clerkCssVar } from '../utils/css';

const baseSpaceUnits = Object.freeze({
  none: '0',
  xxs: '0.5px',
  px: '1px',
} as const);

const dynamicSpaceUnitsDefaultVar = clerkCssVar('spacing', '1rem');
const calcDynamicSpaceUnits = (num: number) => `calc(${dynamicSpaceUnitsDefaultVar} * ((${num} / 0.5) * 0.125))`;

const dynamicSpaceUnits = Object.freeze({
  '0x25': calcDynamicSpaceUnits(0.25), // 0.0625rem
  '0x5': calcDynamicSpaceUnits(0.5), // 0.125rem
  '1': calcDynamicSpaceUnits(1), // 0.25rem
  '1x5': calcDynamicSpaceUnits(1.5), // 0.375rem
  '2': calcDynamicSpaceUnits(2), // 0.5rem
  '2x5': calcDynamicSpaceUnits(2.5), // 0.625rem
  '3': calcDynamicSpaceUnits(3), // 0.75rem
  '3x25': calcDynamicSpaceUnits(3.25), // 0.8125rem
  '3x5': calcDynamicSpaceUnits(3.5), // 0.875rem
  '4': dynamicSpaceUnitsDefaultVar, // 1rem
  '4x25': calcDynamicSpaceUnits(4.5), // 1.0625rem
  '5': calcDynamicSpaceUnits(5), // 1.25rem
  '5x5': calcDynamicSpaceUnits(5.5), // 1.375rem
  '6': calcDynamicSpaceUnits(6), // 1.5rem
  '7': calcDynamicSpaceUnits(7), // 1.75rem
  '7x5': calcDynamicSpaceUnits(7.5), // 1.875rem
  '8': calcDynamicSpaceUnits(8), // 2rem
  '8x5': calcDynamicSpaceUnits(8.5), // 2.125rem
  '8x75': calcDynamicSpaceUnits(8.75), // 2.1875rem
  '9': calcDynamicSpaceUnits(9), // 2.25rem
  '10': calcDynamicSpaceUnits(10), // 2.5rem
  '12': calcDynamicSpaceUnits(12), // 3rem
  '13': calcDynamicSpaceUnits(13), // 3.5rem
  '16': calcDynamicSpaceUnits(16), // 4rem
  '17': calcDynamicSpaceUnits(17), // 4.25rem
  '20': calcDynamicSpaceUnits(20), // 5rem
  '24': calcDynamicSpaceUnits(24), // 6rem
  '28': calcDynamicSpaceUnits(28), // 7rem
  '32': calcDynamicSpaceUnits(32), // 8rem
  '36': calcDynamicSpaceUnits(36), // 9rem
  '40': calcDynamicSpaceUnits(40), // 10rem
  '44': calcDynamicSpaceUnits(44), // 11rem
  '48': calcDynamicSpaceUnits(48), // 12rem
  '52': calcDynamicSpaceUnits(52), // 13rem
  '56': calcDynamicSpaceUnits(56), // 14rem
  '57': calcDynamicSpaceUnits(57), // 14.25rem
  '60': calcDynamicSpaceUnits(60), // 15rem
  '66': calcDynamicSpaceUnits(66), // 16.5rem
  '94': calcDynamicSpaceUnits(94), // 23.5rem
  '100': calcDynamicSpaceUnits(100), // 25rem
  '108': calcDynamicSpaceUnits(108), // 27rem
  '120': calcDynamicSpaceUnits(120), // 30rem
  '140': calcDynamicSpaceUnits(140), // 35rem
  '160': calcDynamicSpaceUnits(160), // 40rem
  '176': calcDynamicSpaceUnits(176), // 44rem
  '220': calcDynamicSpaceUnits(220), // 55rem
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

const radiiDefaultVar = clerkCssVar('radius', '0.375rem');
const radii = Object.freeze({
  none: '0px',
  circle: '50%',
  avatar: clerkCssVar('radius-avatar', radiiDefaultVar), // 0.375rem
  sm: clerkCssVar('radius-sm', `calc(${radiiDefaultVar} * 0.666)`), // 0.25rem
  md: clerkCssVar('radius-md', radiiDefaultVar), // 0.375rem
  lg: clerkCssVar('radius-lg', `calc(${radiiDefaultVar} * 1.333)`), // 0.5rem
  xl: clerkCssVar('radius-xl', `calc(${radiiDefaultVar} * 2)`), // 0.75rem
  halfHeight: '99999px',
} as const);

/**
 * Used by the space scale generation helpers.
 * These keys should always match {@link space}
 */
const spaceScaleKeys = Object.keys(dynamicSpaceUnits) as Array<keyof typeof dynamicSpaceUnits>;

export { sizes, space, radii, spaceScaleKeys };
