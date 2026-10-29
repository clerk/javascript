import React from 'react';

import { useModal } from '../../modals/use-modal';
import { userProfileModal } from './user-profile.modal';

const MODAL_PARAM = '__clerk_mosaic_modal';
const ACCOUNT_PAGE = 'user-profile/account';

export function withUserProfileModalReturn(url: string): string {
  const next = new URL(url);
  next.searchParams.set(MODAL_PARAM, ACCOUNT_PAGE);
  return next.toString();
}

export function UserProfileModalReturn(): null {
  const { open } = useModal(userProfileModal);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get(MODAL_PARAM) !== ACCOUNT_PAGE) {
      return;
    }
    url.searchParams.delete(MODAL_PARAM);
    window.history.replaceState(null, '', url);
    open({ page: 'account' });
  }, [open]);

  return null;
}
