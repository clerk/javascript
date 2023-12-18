export const shadows = Object.freeze({
  menuShadow:
    '00px 5px 15px 0px rgba(0, 0, 0, 0.08), 0px 15px 35px -5px rgba(25, 28, 33, 0.20), 0px 0px 0px 1px rgba(25, 28, 33, 0.06)',
  fabShadow: '0px 12px 24px rgba(0, 0, 0, 0.32)',
  buttonShadow:
    '0px 0px 0px 1px {{color}}, 0px 1px 1px 0px rgba(255, 255, 255, 0.07) inset, 0px 2px 3px 0px rgba(34, 42, 53, 0.20), 0px 1px 1px 0px rgba(0, 0, 0, 0.24)',
  cardRootShadow:
    '0px 5px 15px 0px rgba(0, 0, 0, 0.08), 0px 15px 35px -5px rgba(25, 28, 33, 0.20), 0px 0px 0px 1px rgba(25, 28, 33, 0.06)',
  cardContentShadow:
    '0px 0px 2px 0px rgba(0, 0, 0, 0.08), 0px 1px 2px 0px rgba(25, 28, 33, 0.06), 0px 0px 0px 1px rgba(25, 28, 33, 0.04)',
  actionCardShadow:
    '0px 1px 4px 0px rgba(0, 0, 0, 0.12), 0px 4px 8px 0px rgba(106, 115, 133, 0.12), 0px 0px 0px 1px rgba(106, 115, 133, 0.12)',
  actionCardDestructiveShadow: '0px 0px 0px 1px rgba(0, 0, 0, 0.08)',
  secondaryButtonShadow:
    '0px 2px 3px -1px rgba(0, 0, 0, 0.08), 0px 1px 0px 0px rgba(0, 0, 0, 0.02), 0px 0px 0px 1px rgba(0, 0, 0, 0.08)',
  shadowShimmer: '1px 1px 2px rgba(0, 0, 0, 0.36)',
  sm: '0 1px 1px 0 rgb(0 0 0 / 0.05)',
  input: '0px 1px 1px 0px {{color1}}, 0px 0px 0px 1px {{color2}}',
  inputHover: '0px 0px 0px 1px {{color1}}, 0px 1px 1px 0px {{color2}}',
  focusRing: '0px 0px 0px 4px {{color}}',
} as const);
