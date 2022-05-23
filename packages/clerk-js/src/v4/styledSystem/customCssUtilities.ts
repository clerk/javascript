/**
 *  Add any custom helpers here. These will be expanded and applied on the element
 *  during render.
 */
const CUSTOM_CSS_UTILITIES = [
  ['px', (value: any) => ({ paddingLeft: value, paddingRight: value })],
  ['py', (value: any) => ({ paddingTop: value, paddingBottom: value })],
  ['mx', (value: any) => ({ marginTop: value, marginBottom: value })],
  ['my', (value: any) => ({ marginTop: value, marginBottom: value })],
  ['flexCenter', () => ({ display: 'flex', justifyContent: 'center' })],
] as const;

type CustomCssUtilityKey = typeof CUSTOM_CSS_UTILITIES[number][0];

type CustomCssUtilities = {
  [k in CustomCssUtilityKey]?: string | number | '';
};

export type WithCustomCssUtilities<T> = T & CustomCssUtilities;

export const applyCustomCssUtilities = (computedStyles: Record<string, any>, utils = CUSTOM_CSS_UTILITIES) => {
  for (let i = 0; i < utils.length; i++) {
    const key = utils[i][0];
    if (key in computedStyles) {
      Object.assign(computedStyles, utils[i][1](computedStyles[key]));
      delete computedStyles[key];
    }
  }
};
