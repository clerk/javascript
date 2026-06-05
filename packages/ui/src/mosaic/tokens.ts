export const defaultMosaicTokens = Object.freeze({
  color: {
    primary: '#6C47FF',
    primaryHover: '#5A38E0',
    primaryActive: '#4D2FBF',
    primaryMuted: '#6C47FF1A',
    primaryContrast: '#FFFFFF',
    danger: '#EF4444',
    dangerHover: '#DC2626',
    bg: '#FFFFFF',
    fg: '#111111',
    fgMuted: '#6B7280',
    surface: '#F8F8F8',
    border: '#E5E5E5',
    input: '#FFFFFF',
    ring: '#6C47FF66',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
} as const);

export type MosaicTheme = typeof defaultMosaicTokens;

export interface MosaicVariables {
  colorPrimary?: string;
  colorDanger?: string;
  colorBackground?: string;
  borderRadius?: string;
}
