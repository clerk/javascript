import React from 'react';

import { useModal } from '../../modals/use-modal';
import { useMosaicProfile, userProfileModalOptions } from '../profile-pages/use-mosaic-profile';
import { userProfileModal } from './user-profile.modal';
import type { UserProfileOptions } from './user-profile.provider';

const MODAL_PARAM = '__clerk_mosaic_modal';
const ACCOUNT_PAGE = 'user-profile/account';

export function withUserProfileModalReturn(url: string, mode: UserProfileOptions['mode']): string {
  if (mode !== 'modal') {
    return url;
  }
  const next = new URL(url);
  next.searchParams.set(MODAL_PARAM, ACCOUNT_PAGE);
  return next.toString();
}

export function UserProfileModalReturn(): null {
  const { open } = useModal(userProfileModal);
  const profile = useMosaicProfile();

  React.useEffect(() => {
    queueMicrotask(() => {
      const url = new URL(window.location.href);
      if (url.searchParams.get(MODAL_PARAM) !== ACCOUNT_PAGE) {
        return;
      }
      url.searchParams.delete(MODAL_PARAM);
      window.history.replaceState(withoutNextAppRouterMarker(window.history.state), '', url);
      open({ ...userProfileModalOptions(profile), page: 'account' });
    });
  }, [open, profile]);

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
