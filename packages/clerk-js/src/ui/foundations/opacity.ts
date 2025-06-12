import { clerkCssVar } from '../utils/css';

export const opacity = Object.freeze({
  sm: clerkCssVar('opacity-sm', '24%'),
  disabled: clerkCssVar('opacity-disabled', '50%'),
  inactive: clerkCssVar('opacity-inactive', '62%'),
} as const);
