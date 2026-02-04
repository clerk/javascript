import { style, variants } from './variants';

export const textStyles = variants({
  base: style(theme => ({
    boxSizing: 'border-box',
    padding: 0,
    margin: 0,
    background: 'none',
    border: 'none',
    fontFamily: theme.fontFamilies.sans,
    textDecoration: 'none',
    ...theme.fontRendering,
  })),
  variants: {
    variant: {
      'heading-1': style(theme => ({ ...theme.typography.heading[1] })),
      'heading-2': style(theme => ({ ...theme.typography.heading[2] })),
      'heading-3': style(theme => ({ ...theme.typography.heading[3] })),
      'heading-4': style(theme => ({ ...theme.typography.heading[4] })),
      'heading-5': style(theme => ({ ...theme.typography.heading[5] })),
      'heading-6': style(theme => ({ ...theme.typography.heading[6] })),
      'label-1': style(theme => ({ ...theme.typography.label[1] })),
      'label-2': style(theme => ({ ...theme.typography.label[2] })),
      'label-3': style(theme => ({ ...theme.typography.label[3] })),
      'label-4': style(theme => ({ ...theme.typography.label[4] })),
      'label-5': style(theme => ({ ...theme.typography.label[5] })),
      'body-1': style(theme => ({ ...theme.typography.body[1] })),
      'body-2': style(theme => ({ ...theme.typography.body[2] })),
      'body-3': style(theme => ({ ...theme.typography.body[3] })),
      'body-4': style(theme => ({ ...theme.typography.body[4] })),
    },
    color: {
      default: style(theme => ({ color: theme.colors.primary })),
      muted: style(theme => ({ color: theme.colors.secondary })),
      subtle: style(theme => ({ color: theme.colors.dimmed })),
      accent: style(theme => ({ color: theme.colors.brand })),
    },
    font: {
      sans: style(theme => ({ fontFamily: theme.fontFamilies.sans })),
      mono: style(theme => ({ fontFamily: theme.fontFamilies.mono })),
    },
  },
  defaultVariants: {
    variant: 'body-2',
    color: 'default',
    font: 'sans',
  },
});
