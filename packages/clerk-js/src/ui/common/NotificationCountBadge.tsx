import { formatToCompactNumber } from '../../ui/utils/intl';
import { Flex, localizationKeys, NotificationBadge, useLocalizations } from '../customizables';
import { useDelayedVisibility, usePrefersReducedMotion } from '../hooks';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { animations } from '../styledSystem';

type NotificationCountBadgeProps = PropsOfComponent<typeof NotificationBadge> & {
  notificationCount: number;
  shouldDelayVisibility?: boolean;
  containerSx?: ThemableCssProp;
};

export const NotificationCountBadge = (props: NotificationCountBadgeProps) => {
  const { notificationCount, containerSx, shouldDelayVisibility, ...restProps } = props;
  const prefersReducedMotion = usePrefersReducedMotion();
  const delayVisibility = shouldDelayVisibility || notificationCount > 0;
  const showNotification = useDelayedVisibility(delayVisibility, 350) || false;
  const { t } = useLocalizations();
  const localeKey = t(localizationKeys('locale'));
  const formatedNotificationCount = formatToCompactNumber(notificationCount, localeKey);

  const enterExitAnimation: ThemableCssProp = t => ({
    animation: prefersReducedMotion
      ? 'none'
      : `${showNotification ? animations.notificationAnimation : animations.outAnimation} ${
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
        {formatedNotificationCount}
      </NotificationBadge>
    </Flex>
  );
};
