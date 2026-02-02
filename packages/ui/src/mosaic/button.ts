import { style, variants } from './variants';

export const buttonStyles = variants({
  base: style(theme => ({
    boxSizing: 'border-box',
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[1],
    height: theme.spacing[7],
    borderRadius: theme.spacing[1.5],
    fontSize: theme.typography.label[3].fontSize,
    fontWeight: theme.fontWeights.medium,
    fontFamily: theme.fontFamilies.sans,
    border: 'none',
    outline: 'none',
    margin: 0,
    paddingBlock: 0,
    paddingInline: theme.spacing[3],
    cursor: 'pointer',
    textDecoration: 'none',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: `linear-gradient(180deg, ${theme.alpha(theme.colors.white, 16)} 46%, ${theme.alpha(theme.colors.white, 0)} 54%)`,
      mixBlendMode: 'overlay',
      borderRadius: 'inherit',
      pointerEvents: 'none',
    },
    '&:focus-visible': {
      outline: `2px solid ${theme.colors.purple[700]}`,
      outlineOffset: '2px',
    },
  })),
  variants: {
    variant: {
      primary: style(theme => ({
        background: theme.colors.purple[700],
        color: theme.colors.white,
        boxShadow: `${theme.colors.white} 0px 0px 0px 0px, ${theme.colors.purple[700]} 0px 0px 0px 1px, ${theme.alpha(theme.colors.white, 7)} 0px 1px 0px 0px inset, ${theme.alpha(theme.colors.gray[1300], 20)} 0px 1px 3px 0px`,
      })),
    },
    fullWidth: {
      true: { width: '100%' },
      false: { width: 'fit-content' },
    },
  },
  defaultVariants: {
    variant: 'primary',
    fullWidth: false,
  },
});
