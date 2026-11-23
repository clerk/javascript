import React from 'react';

import { useModal } from '../../modals/use-modal';
import { profileModal } from '../profile/profile.modal';
import { profileModalOptions, useMosaicProfile, userProfileModalOptions } from '../profile-pages/use-mosaic-profile';
import { userProfileModal } from './user-profile.modal';
import type { UserProfileOptions } from './user-profile.provider';

const MODAL_PARAM = '__clerk_mosaic_modal';
const USER_ACCOUNT_PAGE = 'user-profile/account';
const COMBINED_ACCOUNT_PAGE = 'profile/account';

export function withUserProfileModalReturn(
  url: string,
  { mode, combined = false }: Pick<UserProfileOptions, 'mode' | 'combined'>,
): string {
  if (mode !== 'modal') {
    return url;
  }
  const next = new URL(url);
  next.searchParams.set(MODAL_PARAM, combined ? COMBINED_ACCOUNT_PAGE : USER_ACCOUNT_PAGE);
  return next.toString();
}

export function UserProfileModalReturn(): null {
  const { open: openUserProfile } = useModal(userProfileModal);
  const { open: openProfile } = useModal(profileModal);
  const profile = useMosaicProfile();

  React.useEffect(() => {
    queueMicrotask(() => {
      const url = new URL(window.location.href);
      const page = url.searchParams.get(MODAL_PARAM);
      if (page !== USER_ACCOUNT_PAGE && page !== COMBINED_ACCOUNT_PAGE) {
        return;
      }
      url.searchParams.delete(MODAL_PARAM);
      window.history.replaceState(withoutNextAppRouterMarker(window.history.state), '', url);
      if (page === COMBINED_ACCOUNT_PAGE) {
        openProfile({ ...profileModalOptions(profile), page: 'account' });
      } else {
        openUserProfile({ ...userProfileModalOptions(profile), page: 'account' });
      }
    });
  }, [openProfile, openUserProfile, profile]);

  return null;
}

function withoutNextAppRouterMarker(state: unknown): unknown {
  if (typeof state !== 'object' || state === null || !('__NA' in state)) {
    return state;
  }
  const copy: object = Object.assign(Array.isArray(state) ? [] : {}, state);
  Reflect.deleteProperty(copy, '__NA');
  return copy;
}
