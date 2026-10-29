import React from 'react';

import { useModal } from '../../modals/use-modal';
import { useModalOpenedBy } from '../../modals/use-modal-opener';
import { userProfileModal } from './user-profile.modal';
import { useUserProfileOptions } from './user-profile.provider';

const MODAL_PARAM = '__clerk_mosaic_modal';
const OPENER_PARAM = '__clerk_mosaic_opener';
const ACCOUNT_PAGE = 'user-profile/account';

export function useUserProfileModalReturn(): (url: string) => string {
  const { mode } = useUserProfileOptions();
  const opener = useModalOpenedBy();
  return url => (mode === 'modal' ? withUserProfileModalReturn(url, opener) : url);
}

export function UserProfileModalReturn(): null {
  const { open } = useModal(userProfileModal);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get(MODAL_PARAM) !== ACCOUNT_PAGE) {
      return;
    }
    const opener = url.searchParams.get(OPENER_PARAM) ?? undefined;
    url.searchParams.delete(MODAL_PARAM);
    url.searchParams.delete(OPENER_PARAM);
    window.history.replaceState(null, '', url);
    open({ page: 'account' }, undefined, opener);
  }, [open]);

  return null;
}

function withUserProfileModalReturn(url: string, opener: string | undefined): string {
  const next = new URL(url);
  next.searchParams.set(MODAL_PARAM, ACCOUNT_PAGE);
  if (opener !== undefined) {
    next.searchParams.set(OPENER_PARAM, opener);
  }
  return next.toString();
}
