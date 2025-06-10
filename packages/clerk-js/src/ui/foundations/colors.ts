import { createAlphaScaleWithTransparentize, transparentize } from '../utils/colorMix';

type ColorScale<Prefix extends string> = {
  [K in `${Prefix}${'50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950'}`]: string;
};

// Create alpha scales separately to preserve types
export const whiteAlpha = createAlphaScaleWithTransparentize('white', 'whiteAlpha');
export const neutralAlpha = createAlphaScaleWithTransparentize('black', 'neutralAlpha');

const primaryAlpha = createAlphaScaleWithTransparentize('#2F3037', 'primaryAlpha');
const dangerAlpha = createAlphaScaleWithTransparentize('#EF4444', 'dangerAlpha');
const warningAlpha = createAlphaScaleWithTransparentize('#F36B16', 'warningAlpha');
const successAlpha = createAlphaScaleWithTransparentize('#22C543', 'successAlpha');

// Define the base colors object type
type BaseColors = {
  avatarBorder: string;
  avatarBackground: string;
  modalBackdrop: string;
  colorBackground: string;
  colorInputBackground: string;
  colorText: string;
  colorTextSecondary: string;
  colorInputText: string;
  colorTextOnPrimaryBackground: string;
  colorShimmer: string;
  transparent: string;
  white: string;
  black: string;
  primaryHover: string;
};

// Combine all types
type Colors = BaseColors &
  ColorScale<'primary'> &
  ColorScale<'danger'> &
  ColorScale<'warning'> &
  ColorScale<'success'> &
  typeof neutralAlpha &
  typeof whiteAlpha &
  typeof primaryAlpha &
  typeof dangerAlpha &
  typeof warningAlpha &
  typeof successAlpha;

export const colors: Colors = Object.freeze({
  avatarBorder: neutralAlpha.neutralAlpha200,
  avatarBackground: neutralAlpha.neutralAlpha400,
  modalBackdrop: neutralAlpha.neutralAlpha700,
  // Themable colors
  ...neutralAlpha,
  ...whiteAlpha,
  colorBackground: 'white',
  colorInputBackground: 'white',
  colorText: '#212126',
  colorTextSecondary: '#747686',
  colorInputText: '#131316',
  colorTextOnPrimaryBackground: 'white',
  colorShimmer: transparentize('white', '36%'),
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
  primary950: '#0F0D12',
  primaryHover: '#3B3C45', // primary 500 adjusted for lightness
  ...primaryAlpha,
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
  ...dangerAlpha,
  warning50: '#FFF6ED',
  warning100: '#FFEBD5',
  warning200: '#FED1AA',
  warning300: '#FDB674',
  warning400: '#F98C49',
  warning500: '#F36B16',
  warning600: '#EA520C',
  warning700: '#C23A0C',
  warning800: '#9A2F12',
  warning900: '#7C2912',
  warning950: '#431207',
  ...warningAlpha,
  success50: '#F0FDF2',
  success100: '#DCFCE2',
  success200: '#BBF7C6',
  success300: '#86EF9B',
  success400: '#4ADE68',
  success500: '#22C543',
  success600: '#16A332',
  success700: '#15802A',
  success800: '#166527',
  success900: '#145323',
  success950: '#052E0F',
  ...successAlpha,
} as const);
