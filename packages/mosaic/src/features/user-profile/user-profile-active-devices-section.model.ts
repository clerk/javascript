import { differenceInCalendarDays } from '@clerk/shared/date';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useSession, useUser } from '@clerk/shared/react';
import type { SessionWithActivitiesResource } from '@clerk/shared/types';
import { useEffect, useRef, useState } from 'react';

import { fill, toLocalizableApiError, useErrorText, useLocale, useMessages } from '../../localization';
import type { UserProfileDevice } from './user-profile-active-devices.types';

export type UserProfileActiveDevicesModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | { status: 'error'; message: string; retry: () => void }
  | {
      status: 'ready';
      identity: string;
      devices: UserProfileDevice[];
      revoke: (id: string) => Promise<boolean>;
    };

type SessionsQuery =
  | { status: 'loading'; identity: string | undefined }
  | { status: 'error'; identity: string }
  | { status: 'ready'; identity: string; sessions: SessionWithActivitiesResource[] };

function isActiveDevice(session: SessionWithActivitiesResource): boolean {
  return session.status === 'active' || session.status === 'pending';
}

function lastActiveLabel(date: Date, locale: string): string {
  const days = differenceInCalendarDays(new Date(), date, { absolute: false });
  if (Math.abs(days) <= 6) {
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(days, 'day');
  }
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

export function useUserProfileActiveDevicesModel(): UserProfileActiveDevicesModel {
  const clerk = useClerk();
  const { isLoaded: isUserLoaded, user } = useUser();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const locale = useLocale();
  const m = useMessages('userProfileActiveDevices');
  const userId = user?.id;
  const sessionId = session?.id;

  const identity = userId && sessionId ? `${userId}:${sessionId}` : undefined;
  const errorText = useErrorText();
  const translation = useRef({ m, errorText });
  translation.current = { m, errorText };
  const [query, setQuery] = useState<SessionsQuery>({ status: 'loading', identity });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const currentUser = clerk.user;
    if (!identity || !currentUser || currentUser.id !== userId || clerk.session?.id !== sessionId) {
      return;
    }
    let active = true;
    setQuery({ status: 'loading', identity });
    void currentUser.getSessions({ forceRefresh: true, throwOnError: true }).then(
      sessions => {
        if (active && clerk.user?.id === userId && clerk.session?.id === sessionId) {
          setQuery({ status: 'ready', identity, sessions });
        }
      },
      () => {
        if (active && clerk.user?.id === userId && clerk.session?.id === sessionId) {
          setQuery({ status: 'error', identity });
        }
      },
    );
    return () => {
      active = false;
    };
  }, [clerk, userId, sessionId, identity, attempt]);

  const toDevice = (item: SessionWithActivitiesResource): UserProfileDevice => {
    const activity = item.latestActivity;
    const isCurrent = item.id === sessionId;
    const isMobile = Boolean(activity.isMobile);
    const model = activity.deviceType || (isMobile ? m.mobileDevice : m.desktopDevice);
    const browser = [activity.browserName, activity.browserVersion].filter(Boolean).join(' ') || m.webBrowser;
    const location = [activity.city, activity.country].filter(Boolean).join(', ');
    const lastActive = lastActiveLabel(item.lastActiveAt, locale);
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
  if (query.status === 'error') {
    return {
      status: 'error',
      message: m.loadError,
      retry: () => setAttempt(value => value + 1),
    };
  }

  return {
    status: 'ready',
    identity,
    devices: query.sessions
      .filter(isActiveDevice)
      .sort((a, b) => Number(b.id === sessionId) - Number(a.id === sessionId))
      .map(toDevice),
    // TODO: Add bulk revocation when a dedicated API is available, preserving the current session and reverification.
    // TODO: Add session reverification for device revocation; surface API errors until then.
    revoke: async id => {
      try {
        const currentUser = clerk.user;
        if (
          !currentUser ||
          !sessionId ||
          currentUser.id !== userId ||
          clerk.session?.id !== sessionId ||
          id === sessionId
        ) {
          throw new Error(translation.current.m.signOutError);
        }
        const sessions = await currentUser.getSessions({ forceRefresh: true, throwOnError: true });
        const target = sessions.find(item => item.id === id && isActiveDevice(item));
        if (!target || clerk.user?.id !== userId || clerk.session?.id !== sessionId) {
          throw new Error(translation.current.m.signOutError);
        }
        await target.revoke();
        return clerk.user?.id === userId && clerk.session?.id === sessionId;
      } catch (error) {
        const { m: messages, errorText: translate } = translation.current;
        const first = isClerkAPIResponseError(error) ? error.errors[0] : undefined;
        throw new Error(first ? translate(toLocalizableApiError(first, messages.signOutError)) : messages.signOutError);
      }
    },
  };
}
