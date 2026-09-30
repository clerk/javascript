import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useSession, useUser } from '@clerk/shared/react';
import type { SessionWithActivitiesResource } from '@clerk/shared/types';
import { useCallback } from 'react';

import { fill, useLocale, useMessages } from '../../localization';
import type { UserProfileDevice } from './user-profile-active-devices.types';

export type UserProfileActiveDevicesModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      identity: string;
      loadSessions: () => Promise<UserProfileDevice[]>;
      revoke: (id: string) => Promise<void>;
    };

function lastActiveLabel(date: Date, locale: string): string {
  const today = new Date();
  const days = Math.round(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) /
      86_400_000,
  );
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

  const toDevice = useCallback(
    (item: SessionWithActivitiesResource): UserProfileDevice => {
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
    },
    [sessionId, session?.actor, locale, m],
  );

  const loadSessions = useCallback(async (): Promise<UserProfileDevice[]> => {
    if (!user || !sessionId) {
      return [];
    }
    const items = await user.getSessions();
    return items
      .filter(item => item.status === 'active' || item.status === 'pending')
      .sort((a, b) => Number(b.id === sessionId) - Number(a.id === sessionId))
      .map(toDevice);
  }, [user, sessionId, toDevice]);

  if (!isUserLoaded || !isSessionLoaded) {
    return { status: 'loading' };
  }
  if (!user || !session) {
    return { status: 'hidden' };
  }

  return {
    status: 'ready',
    identity: `${user.id}:${session.id}`,
    loadSessions,
    // TODO: Add bulk revocation when a dedicated API is available, preserving the current session and reverification.
    // TODO: Add session reverification for device revocation; surface API errors until then.
    revoke: async id => {
      try {
        if (clerk.user?.id !== userId || clerk.session?.id !== sessionId || id === sessionId) {
          throw new Error(m.signOutError);
        }
        const target = (await user.getSessions()).find(
          item => item.id === id && (item.status === 'active' || item.status === 'pending'),
        );
        if (!target || clerk.user?.id !== userId || clerk.session?.id !== sessionId) {
          throw new Error(m.signOutError);
        }
        await target.revoke();
      } catch (error) {
        if (isClerkAPIResponseError(error)) {
          const first = error.errors[0];
          throw new Error(first?.longMessage || first?.message || m.signOutError);
        }
        throw error;
      }
    },
  };
}
