import { Flex, NotificationBadge } from '../customizables';
import { useDelayedVisibility, usePrefersReducedMotion } from '../hooks';
import type { ThemableCssProp } from '../styledSystem';
import { animations } from '../styledSystem';

type NotificationCountBadgeProps = {
  notificationCount: number | string;
  containerSx?: ThemableCssProp;
  colorScheme?: 'primary' | 'neutral';
};

export const NotificationCountBadge = (props: NotificationCountBadgeProps) => {
  const { notificationCount, containerSx, colorScheme = 'primary' } = props;
  const prefersReducedMotion = usePrefersReducedMotion();
  const showNotification = useDelayedVisibility(!!notificationCount, 350) || false;

  const enterExitAnimation: ThemableCssProp = t => ({
    animation: prefersReducedMotion
      ? 'none'
      : `${notificationCount ? animations.notificationAnimation : animations.outAnimation} ${
          t.transitionDuration.$textField
        } ${t.transitionTiming.$slowBezier} 0s 1 normal forwards`,
  });

  if (!showNotification) {
    return null;
  }

  return (
    <Flex
      justify='center'
      align='center'
      sx={[
        t => ({
          marginLeft: t.space.$1x5,
        }),
        containerSx,
      ]}
    >
      <NotificationBadge
        sx={enterExitAnimation}
        colorScheme={colorScheme}
      >
        {notificationCount}
      </NotificationBadge>
    </Flex>
  );
};
