export const shadows = Object.freeze({
  /* Dashboard/Shadow 2 */
  cardDropShadow: '0px 24px 48px rgba(0, 0, 0, 0.16)',
  boxShadow1: '0px 24px 48px rgba(0, 0, 0, 0.16)',
  fabShadow: '0px 12px 24px rgba(0, 0, 0, 0.32)',
  focusRing: '0 0 0 3px {{color}}',
  buttonShadow:
    '0px 0px 0px 1px {{color}}, 0px 1px 1px 0px rgba(255, 255, 255, 0.07) inset, 0px 2px 3px 0px rgba(34, 42, 53, 0.20), 0px 1px 1px 0px rgba(0, 0, 0, 0.24)',
  shadowShimmer: '1px 1px 2px rgba(0, 0, 0, 0.36)',
  sm: '0 1px 1px 0 rgb(0 0 0 / 0.05)',
} as const);
