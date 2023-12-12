export const shadows = Object.freeze({
  boxShadow1: '0px 24px 48px rgba(0, 0, 0, 0.16)',
  fabShadow: '0px 12px 24px rgba(0, 0, 0, 0.32)',
  buttonShadow:
    '0px 0px 0px 1px {{color}}, 0px 1px 1px 0px rgba(255, 255, 255, 0.07) inset, 0px 2px 3px 0px rgba(34, 42, 53, 0.20), 0px 1px 1px 0px rgba(0, 0, 0, 0.24)',
  cardShadow:
    '0px 0px 2px 0px rgba(0, 0, 0, 0.08), 0px 1px 2px 0px rgba(25, 28, 33, 0.06), 0px 0px 0px 1px rgba(25, 28, 33, 0.04)',
  secondaryButtonShadow:
    '0px 2px 3px -1px rgba(0, 0, 0, 0.08), 0px 1px 0px 0px rgba(0, 0, 0, 0.02), 0px 0px 0px 1px rgba(0, 0, 0, 0.08)',
  shadowShimmer: '1px 1px 2px rgba(0, 0, 0, 0.36)',
  sm: '0 1px 1px 0 rgb(0 0 0 / 0.05)',
  input: '0px 0px 0px 1px {{color1}}, 0px 1px 1px 0px {{color2}}',
  inputHover: '0px 0px 0px 1px {{color1}}, 0px 1px 1px 0px {{color2}}',
  focusRing: '0px 0px 0px 4px {{color}}',
} as const);
