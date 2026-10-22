import { useLoom, useSessions } from '@clerk/loom/react';
import { differenceInCalendarDays } from '@clerk/shared/date';

import { useReverificationFlow } from '../../features/reverification';
import type { UserProfileDevice } from '../../features/user-profile/user-profile-active-devices-section/user-profile-active-devices.types';
import { useNow } from '../../hooks/use-now';
import { fill, useErrorText, useLocale, useMessages } from '../../localization';
import { toLocalizableError } from '../../utils/errors';

export function useLoomActiveDevicesModel() {
  const client = useLoom();
  const query = useSessions();
  const [revoke, reverification] = useReverificationFlow((id: string) => client.revoke(id));
  const now = useNow({ updateInterval: 60_000 });
  const locale = useLocale();
  const m = useMessages('userProfileActiveDevices');
  const errorText = useErrorText();
  const currentHasActor = Boolean(query.data?.find(item => item.id === client.scope.sessionId)?.hasActor);
  const devices: UserProfileDevice[] = (query.data ?? [])
    .filter(item => item.status === 'active' || item.status === 'pending')
    .sort((a, b) => Number(b.id === client.scope.sessionId) - Number(a.id === client.scope.sessionId))
    .map(item => {
      const activity = item.latestActivity;
      const isCurrent = item.id === client.scope.sessionId;
      const isMobile = Boolean(activity.isMobile);
      const model = activity.deviceType || (isMobile ? m.mobileDevice : m.desktopDevice);
      const browser = [activity.browserName, activity.browserVersion].filter(Boolean).join(' ') || m.webBrowser;
      const location = [activity.city, activity.country].filter(Boolean).join(', ');
      const date = item.lastActiveAt === null ? null : new Date(item.lastActiveAt);
      const days = date ? differenceInCalendarDays(now, date, { absolute: false }) : 0;
      const lastActive = date
        ? Math.abs(days) <= 6
          ? new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(days, 'day')
          : new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
        : '';
      return {
        id: item.id,
        name: fill(m.deviceName, { browser: activity.browserName || m.webBrowser, device: model }),
        description: [lastActive ? fill(m.lastSeen, { date: lastActive }) : '', location].filter(Boolean).join(' · '),
        type: isMobile ? 'mobile' : 'desktop',
        isCurrent,
        isUserDevice: currentHasActor && !item.hasActor && !isCurrent,
        isImpersonationDevice: item.hasActor && !isCurrent,
        lastActive,
        model: activity.deviceType || undefined,
        browser,
        ipAddress: activity.ipAddress,
        location: location || undefined,
      };
    });
  return {
    devices,
    revoke: query.isEnabled ? revoke : undefined,
    reverification,
    pending: query.isPending,
    refreshing: query.isFetching,
    error: query.error ? errorText(toLocalizableError(query.error)) : undefined,
    refresh: query.isEnabled
      ? async () => {
          await query.refetch();
        }
      : undefined,
  };
}
