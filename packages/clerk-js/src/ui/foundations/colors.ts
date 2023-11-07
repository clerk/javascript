export const whiteAlpha = Object.freeze({
  whiteAlpha20: 'hsla(0, 0%, 100%, 0.02)',
  whiteAlpha50: 'hsla(0, 0%, 100%, 0.04)',
  whiteAlpha100: 'hsla(0, 0%, 100%, 0.06)',
  whiteAlpha200: 'hsla(0, 0%, 100%, 0.08)',
  whiteAlpha300: 'hsla(0, 0%, 100%, 0.16)',
  whiteAlpha400: 'hsla(0, 0%, 100%, 0.24)',
  whiteAlpha500: 'hsla(0, 0%, 100%, 0.36)',
  whiteAlpha600: 'hsla(0, 0%, 100%, 0.48)',
  whiteAlpha700: 'hsla(0, 0%, 100%, 0.64)',
  whiteAlpha800: 'hsla(0, 0%, 100%, 0.80)',
  whiteAlpha900: 'hsla(0, 0%, 100%, 0.92)',
} as const);

export const blackAlpha = Object.freeze({
  blackAlpha20: 'hsla(0, 0%, 0%, 0.02)',
  blackAlpha50: 'hsla(0, 0%, 0%, 0.04)',
  blackAlpha100: 'hsla(0, 0%, 0%, 0.06)',
  blackAlpha200: 'hsla(0, 0%, 0%, 0.08)',
  blackAlpha300: 'hsla(0, 0%, 0%, 0.16)',
  blackAlpha400: 'hsla(0, 0%, 0%, 0.24)',
  blackAlpha500: 'hsla(0, 0%, 0%, 0.36)',
  blackAlpha600: 'hsla(0, 0%, 0%, 0.48)',
  blackAlpha700: 'hsla(0, 0%, 0%, 0.64)',
  blackAlpha800: 'hsla(0, 0%, 0%, 0.80)',
  blackAlpha900: 'hsla(0, 0%, 0%, 0.92)',
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
  colorInputText: 'black',
  colorShimmer: 'rgba(255, 255, 255, 0.36)',
  transparent: 'transparent',
  white: 'white',
  black: 'black',
  // TODO: Primary colors below aren't final yet (6 November 2023)
  primary25: '#FAFAFB',
  primary50: '#F7F7F8',
  primary100: '#EEEEF0',
  primary150: '#E3E3E7',
  primary200: '#D9D9DE',
  primary300: '#B7B8C2',
  primary400: '#9394A1',
  primary500: '#747686',
  primary600: '#5E5F6E',
  primary700: '#42434D',
  primary750: '#373840',
  primary800: '#2F3037',
  primary850: '#27272D',
  primary900: '#212126',
  primary950: '#131316',
  danger50: '#FEF3F2',
  danger100: '#FEE4E2',
  danger200: '#FECDCA',
  danger300: '#FDA29B',
  danger400: '#F97066',
  danger500: '#F04438',
  danger600: '#D92D20',
  danger700: '#B42318',
  danger800: '#912018',
  danger900: '#7A271A',
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
