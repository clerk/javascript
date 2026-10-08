import { USER_PROFILE_NAVBAR_ROUTE_ID } from '@/ui/constants';
import { useUserProfileContext } from '@/ui/contexts';

import type { UserProfileNavbarData } from './user-profile-navigation.types';

export const useUserProfileNavbarModel = (): UserProfileNavbarData => {
  const { pages, apiKeysProps } = useUserProfileContext();

  return {
    routes: pages.routes.filter(route => route.id !== USER_PROFILE_NAVBAR_ROUTE_ID.API_KEYS || !apiKeysProps?.hide),
  };
};
