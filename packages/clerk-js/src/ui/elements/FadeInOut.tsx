import { forwardRef, type PropsWithChildren } from 'react';

import { Box, Grid } from '../../ui/customizables';
import { animations, type PropsOfComponent } from '../styledSystem';

type FadeInOutProps = PropsWithChildren<{ asChild?: boolean } & PropsOfComponent<typeof Grid>>;

export const FadeInOut = forwardRef<HTMLDivElement, FadeInOutProps>((props, ref) => {
  const { children, sx, ...rest } = props;

  return (
    <Grid
      ref={ref}
      sx={[
        t => ({
          '&[data-state="active"]': {
            animation: `${animations.actionActive} ${t.transitionDuration.$slowest} ${t.transitionTiming.$slowBezier}`,
          },
          '&[data-state="inactive"]': {
            animation: `${animations.actionInactive} ${t.transitionDuration.$slowest} ${t.transitionTiming.$slowBezier}`,
          },
        }),
        sx,
      ]}
      {...rest}
      style={{ animationFillMode: 'forwards' }}
    >
      <Box sx={{ overflow: 'hidden', padding: '15px', margin: '-15px' }}>{children}</Box>
    </Grid>
  );
});
