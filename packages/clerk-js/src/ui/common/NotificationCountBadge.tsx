import { Flex, NotificationBadge } from '../customizables';
import { useDelayedVisibility, usePrefersReducedMotion } from '../hooks';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { animations } from '../styledSystem';

type NotificationCountBadgeProps = PropsOfComponent<typeof NotificationBadge> & {
  notificationCount: number | string;
  containerSx?: ThemableCssProp;
};

export const NotificationCountBadge = (props: NotificationCountBadgeProps) => {
  const { notificationCount, containerSx, ...restProps } = props;
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
        {...restProps}
      >
        {notificationCount}
      </NotificationBadge>
    </Flex>
  );
};
