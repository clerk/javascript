import { clerkCssVar } from '../utils/css';

export const borderStyles = Object.freeze({
  solid: 'solid',
  dashed: 'dashed',
} as const);

const borderWidthDefaultVar = clerkCssVar('border-width', '1px');
export const borderWidths = Object.freeze({
  normal: clerkCssVar('border-width-normal', borderWidthDefaultVar),
  heavy: clerkCssVar('border-width-heavy', `calc(${borderWidthDefaultVar} * 2)`),
});
