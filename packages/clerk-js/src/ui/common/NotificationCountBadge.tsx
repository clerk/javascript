import { Box, NotificationBadge } from '../customizables';
import { useDelayedVisibility, usePrefersReducedMotion } from '../hooks';
import type { ThemableCssProp } from '../styledSystem';
import { animations } from '../styledSystem';

type NotificationCountBadgeProps = {
  notificationCount: number;
  containerSx?: ThemableCssProp;
};

export const NotificationCountBadge = ({ notificationCount, containerSx }: NotificationCountBadgeProps) => {
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
          position: 'absolute',
          top: `-${t.space.$2}`,
          right: `-${t.space.$1}`,
          width: t.sizes.$2,
          height: t.sizes.$2,
        }),
        containerSx,
      ]}
    >
      {showNotification && <NotificationBadge sx={enterExitAnimation}>{notificationCount}</NotificationBadge>}
    </Box>
  );
};
