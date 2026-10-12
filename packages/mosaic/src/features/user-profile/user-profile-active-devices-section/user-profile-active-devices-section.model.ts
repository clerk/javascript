import { differenceInCalendarDays } from '@clerk/shared/date';
import { ClerkRuntimeError } from '@clerk/shared/error';
import { useClerk, useSession, useUser } from '@clerk/shared/react';
import type { SessionWithActivitiesResource } from '@clerk/shared/types';
import { useEffect, useState } from 'react';

import { useNow } from '../../../hooks/use-now';
import { fill, useLocale, useMessages } from '../../../localization';
import type { UserProfileDevice } from './user-profile-active-devices.types';

export type UserProfileActiveDevicesModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      identity: string;
      devices: UserProfileDevice[];
      revoke: (id: string) => Promise<void>;
    };

type SessionsQuery =
  | { status: 'loading'; identity: string | undefined }
  | { status: 'ready'; identity: string; sessions: SessionWithActivitiesResource[] };

function isActiveDevice(session: SessionWithActivitiesResource): boolean {
  return session.status === 'active' || session.status === 'pending';
}

function lastActiveLabel(date: Date, now: Date, locale: string): string {
  const days = differenceInCalendarDays(now, date, { absolute: false });
  if (Math.abs(days) <= 6) {
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(days, 'day');
  }
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

export function useUserProfileActiveDevicesModel(): UserProfileActiveDevicesModel {
  const clerk = useClerk();
  const { isLoaded: isUserLoaded, user } = useUser();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const now = useNow({ updateInterval: 60_000 });
  const locale = useLocale();
  const m = useMessages('userProfileActiveDevices');
  const userId = user?.id;
  const sessionId = session?.id;

  const identity = userId && sessionId ? `${userId}:${sessionId}` : undefined;
  const [query, setQuery] = useState<SessionsQuery>({ status: 'loading', identity });

  useEffect(() => {
    const currentUser = clerk.user;
    if (!identity || !currentUser || currentUser.id !== userId || clerk.session?.id !== sessionId) {
      return;
    }
    let active = true;
    setQuery({ status: 'loading', identity });
    void currentUser.getSessions().then(sessions => {
      if (active && clerk.user?.id === userId && clerk.session?.id === sessionId) {
        setQuery({ status: 'ready', identity, sessions });
      }
    });
    return () => {
      active = false;
    };
  }, [clerk, userId, sessionId, identity]);

  const toDevice = (item: SessionWithActivitiesResource): UserProfileDevice => {
    const activity = item.latestActivity;
    const isCurrent = item.id === sessionId;
    const isMobile = Boolean(activity.isMobile);
    const model = activity.deviceType || (isMobile ? m.mobileDevice : m.desktopDevice);
    const browser = [activity.browserName, activity.browserVersion].filter(Boolean).join(' ') || m.webBrowser;
    const location = [activity.city, activity.country].filter(Boolean).join(', ');
    const lastActive = lastActiveLabel(item.lastActiveAt, now, locale);
    const description = [fill(m.lastSeen, { date: lastActive }), location].filter(Boolean).join(' · ');

    return {
      id: item.id,
      name: fill(m.deviceName, { browser: activity.browserName || m.webBrowser, device: model }),
      description,
      type: isMobile ? 'mobile' : 'desktop',
      isCurrent,
      isUserDevice: Boolean(session?.actor && !item.actor && !isCurrent),
      isImpersonationDevice: Boolean(item.actor && !isCurrent),
      lastActive,
      model: activity.deviceType || undefined,
      browser,
      ipAddress: activity.ipAddress,
      location: location || undefined,
    };
  };

  if (!isUserLoaded || !isSessionLoaded) {
    return { status: 'loading' };
  }
  if (!user || !session || !identity) {
    return { status: 'hidden' };
  }

  if (query.identity !== identity || query.status === 'loading') {
    return { status: 'loading' };
  }
  return {
    status: 'ready',
    identity,
    devices: query.sessions
      .filter(isActiveDevice)
      .sort((a, b) => Number(b.id === sessionId) - Number(a.id === sessionId))
      .map(toDevice),
    revoke: async id => {
      const currentUser = clerk.user;
      const target = query.sessions.find(item => item.id === id && isActiveDevice(item));
      if (
        !target ||
        !currentUser ||
        !sessionId ||
        currentUser.id !== userId ||
        clerk.session?.id !== sessionId ||
        id === sessionId
      ) {
        throw new ClerkRuntimeError('This device is no longer available.', { code: 'active_device_unavailable' });
      }
      await target.revoke();
    },
  };
}
