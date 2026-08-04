import { formatToCompactNumber } from '@/utils/intl';

import { Flex, localizationKeys, NotificationBadge, useLocalizations } from '../customizables';
import { Skeleton } from '../elements/Skeleton';
import { usePrefersReducedMotion } from '../hooks';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { animations } from '../styledSystem';

type NotificationCountBadgeProps = PropsOfComponent<typeof NotificationBadge> & {
  notificationCount: number;
  containerSx?: ThemableCssProp;
  shouldAnimate?: boolean;
  isLoading?: boolean;
};

export const NotificationCountBadge = (props: NotificationCountBadgeProps) => {
  const { notificationCount, containerSx, shouldAnimate = true, isLoading = false, ...restProps } = props;
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
      {isLoading ? (
        <Skeleton
          sx={t => ({
            height: t.space.$4,
            width: t.space.$5,
            borderRadius: t.radii.$lg,
          })}
        />
      ) : (
        <NotificationBadge
          sx={enterExitAnimation}
          {...restProps}
        >
          {formattedNotificationCount}
        </NotificationBadge>
      )}
    </Flex>
  );
};
