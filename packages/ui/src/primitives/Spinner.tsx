import type { PrimitiveProps, StyleVariants } from '../styledSystem';
import { animations, createCssVariables, createVariants } from '../styledSystem';

const { size, thickness, speed } = createCssVariables('speed', 'size', 'thickness');

const { applyVariants, filterProps } = createVariants(theme => {
  return {
    base: {
      display: 'inline-block',
      borderRadius: '99999px',
      borderTop: `${thickness} solid currentColor`,
      borderRight: `${thickness} solid currentColor`,
      borderBottomWidth: thickness,
      borderLeftWidth: thickness,
      borderBottomStyle: 'solid',
      borderLeftStyle: 'solid',
      borderBottomColor: theme.colors.$transparent,
      borderLeftColor: theme.colors.$transparent,
      opacity: 1,
      animation: `${animations.spinning} ${speed} linear 0s infinite normal none running`,
      width: [size],
      height: [size],
      minWidth: [size],
      minHeight: [size],
    },
    variants: {
      colorScheme: {
        primary: { borderTopColor: theme.colors.$primary500, borderRightColor: theme.colors.$primary500, opacity: 1 },
        neutral: {
          borderTopColor: theme.colors.$borderAlpha700,
          borderRightColor: theme.colors.$borderAlpha700,
          opacity: 1,
        },
      },
      thickness: {
        sm: { [thickness]: theme.sizes.$0x5 },
        md: { [thickness]: theme.sizes.$1 },
      },
      size: {
        xs: { [size]: theme.sizes.$3 },
        sm: { [size]: theme.sizes.$4 },
        md: { [size]: theme.sizes.$5 },
        lg: { [size]: theme.sizes.$6 },
        xl: { [size]: theme.sizes.$8 },
      },
      speed: {
        slow: { [speed]: '600ms' },
        normal: { [speed]: '400ms' },
      },
    },
    defaultVariants: {
      speed: 'normal',
      thickness: 'sm',
      size: 'sm',
    },
  };
});

type SpinnerProps = PrimitiveProps<'div'> & StyleVariants<typeof applyVariants>;
export const Spinner = (props: SpinnerProps) => {
  return (
    <span
      {...filterProps(props)}
      css={applyVariants(props) as any}
      aria-busy
      aria-live='polite'
    />
  );
};
