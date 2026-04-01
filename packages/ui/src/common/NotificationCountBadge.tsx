import { formatToCompactNumber } from '@/utils/intl';

import { Flex, localizationKeys, NotificationBadge, useLocalizations } from '../customizables';
import { usePrefersReducedMotion } from '../hooks';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { animations } from '../styledSystem';

type NotificationCountBadgeProps = PropsOfComponent<typeof NotificationBadge> & {
  notificationCount: number;
  containerSx?: ThemableCssProp;
  shouldAnimate?: boolean;
};

export const NotificationCountBadge = (props: NotificationCountBadgeProps) => {
  const { notificationCount, containerSx, shouldAnimate = true, ...restProps } = props;
  const prefersReducedMotion = usePrefersReducedMotion();
  const { t } = useLocalizations();
  const localeKey = t(localizationKeys('locale'));
  const formattedNotificationCount = formatToCompactNumber(notificationCount, localeKey);

  const enterExitAnimation: ThemableCssProp = t => ({
    animation:
      shouldAnimate && !prefersReducedMotion
        ? `${animations.notificationAnimation} ${t.transitionDuration.$textField} ${t.transitionTiming.$slowBezier} 0s 1 normal forwards`
        : 'none',
  });

  return (
    <Flex
      justify='center'
      align='center'
      as='span'
      sx={[
        t => ({
          marginInlineStart: t.space.$1x5,
        }),
        containerSx,
      ]}
    >
      <NotificationBadge
        sx={enterExitAnimation}
        {...restProps}
      >
        {formattedNotificationCount}
      </NotificationBadge>
    </Flex>
  );
};
