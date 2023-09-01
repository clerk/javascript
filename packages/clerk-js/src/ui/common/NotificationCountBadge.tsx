import { Box, NotificationBadge } from '../customizables';
import { useDelayedVisibility, usePrefersReducedMotion } from '../hooks';
import type { ThemableCssProp } from '../styledSystem';
import { animations } from '../styledSystem';

export const NotificationCountBadge = ({
  notificationCount,
  containerSx,
}: {
  notificationCount: number;
  containerSx?: ThemableCssProp;
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const showNotification = useDelayedVisibility(notificationCount > 0, 350) || false;

  const enterExitAnimation: ThemableCssProp = t => ({
    animation: prefersReducedMotion
      ? 'none'
      : `${notificationCount ? animations.notificationAnimation : animations.outAnimation} ${
          t.transitionDuration.$textField
        } ${t.transitionTiming.$slowBezier} 0s 1 normal forwards`,
  });

  return (
    <Box
      sx={[
        t => ({
          position: 'relative',
          width: t.sizes.$4,
          height: t.sizes.$4,
        }),
        containerSx,
      ]}
    >
      {showNotification && <NotificationBadge sx={enterExitAnimation}>{notificationCount}</NotificationBadge>}
    </Box>
  );
};
