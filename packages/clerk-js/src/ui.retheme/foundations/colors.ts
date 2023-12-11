export const whiteAlpha = Object.freeze({
  whiteAlpha20: 'hsla(0, 0%, 100%, 0.02)',
  whiteAlpha50: 'hsla(0, 0%, 100%, 0.04)',
  whiteAlpha100: 'hsla(0, 0%, 100%, 0.06)',
  whiteAlpha150: 'hsla(0, 0%, 100%, 0.07)',
  whiteAlpha200: 'hsla(0, 0%, 100%, 0.08)',
  whiteAlpha300: 'hsla(0, 0%, 100%, 0.16)',
  whiteAlpha400: 'hsla(0, 0%, 100%, 0.24)',
  whiteAlpha500: 'hsla(0, 0%, 100%, 0.36)',
  whiteAlpha600: 'hsla(0, 0%, 100%, 0.48)',
  whiteAlpha700: 'hsla(0, 0%, 100%, 0.64)',
  whiteAlpha750: 'hsla(0, 0%, 100%, 0.72)',
  whiteAlpha800: 'hsla(0, 0%, 100%, 0.80)',
  whiteAlpha850: 'hsla(0, 0%, 100%, 0.86)',
  whiteAlpha900: 'hsla(0, 0%, 100%, 0.92)',
  whiteAlpha950: 'hsla(0, 0%, 100%, 0.96)',
} as const);

export const blackAlpha = Object.freeze({
  blackAlpha20: 'hsla(0, 0%, 0%, 0.02)',
  blackAlpha50: 'hsla(0, 0%, 0%, 0.04)',
  blackAlpha100: 'hsla(0, 0%, 0%, 0.06)',
  blackAlpha150: 'hsla(0, 0%, 0%, 0.07)',
  blackAlpha200: 'hsla(0, 0%, 0%, 0.08)',
  blackAlpha300: 'hsla(0, 0%, 0%, 0.16)',
  blackAlpha400: 'hsla(0, 0%, 0%, 0.24)',
  blackAlpha500: 'hsla(0, 0%, 0%, 0.36)',
  blackAlpha600: 'hsla(0, 0%, 0%, 0.48)',
  blackAlpha700: 'hsla(0, 0%, 0%, 0.64)',
  blackAlpha750: 'hsla(0, 0%, 0%, 0.72)',
  blackAlpha800: 'hsla(0, 0%, 0%, 0.80)',
  blackAlpha850: 'hsla(0, 0%, 0%, 0.86)',
  blackAlpha900: 'hsla(0, 0%, 0%, 0.92)',
  blackAlpha950: 'hsla(0, 0%, 0%, 0.96)',
} as const);

export const colors = Object.freeze({
  // Colors that are not affected by `alphaShadesMode`
  avatarBorder: blackAlpha.blackAlpha200,
  avatarBackground: blackAlpha.blackAlpha400,
  modalBackdrop: blackAlpha.blackAlpha700,
  activeDeviceBackground: whiteAlpha.whiteAlpha200,
  // Themable colors
  ...blackAlpha,
  ...whiteAlpha,
  colorBackground: 'white',
  colorInputBackground: 'white',
  colorText: 'black',
  colorTextOnPrimaryBackground: 'white',
  colorTextSecondary: 'rgba(0,0,0,0.65)',
  colorTextTertiary: 'rgba(147,148,161,1)',
  colorInputText: 'black',
  colorShimmer: 'rgba(255, 255, 255, 0.36)',
  transparent: 'transparent',
  white: 'white',
  black: 'black',
  primary50: '#B9BDBC',
  primary100: '#9EA1A2',
  primary200: '#828687',
  primary300: '#66696D',
  primary400: '#4B4D52',
  primary500: '#2F3037',
  primary600: '#2A2930',
  primary700: '#25232A',
  primary800: '#201D23',
  primary900: '#1B171C',
  danger50: '#FEF2F2',
  danger100: '#FEE5E5',
  danger200: '#FECACA',
  danger300: '#FCA5A5',
  danger400: '#F87171',
  danger500: '#EF4444',
  danger600: '#DC2626',
  danger700: '#B91C1C',
  danger800: '#991B1B',
  danger900: '#7F1D1D',
  danger950: '#450A0A',
  warning50: '#FFFAEB',
  warning100: '#FEF0C7',
  warning200: '#FEDF89',
  warning300: '#FEC84B',
  warning400: '#FDB022',
  warning500: '#F79009',
  warning600: '#DC6803',
  warning700: '#B54708',
  warning800: '#93370D',
  warning900: '#7A2E0E',
  success50: '#ECFDF3',
  success100: '#D1FADF',
  success200: '#A6F4C5',
  success300: '#6CE9A6',
  success400: '#32D583',
  success500: '#12B76A',
  success600: '#039855',
  success700: '#027A48',
  success800: '#05603A',
  success900: '#054F31',
} as const);
