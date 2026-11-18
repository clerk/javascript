import { createContext, type ReactNode, useContext } from 'react';

import type { AdditionalOAuthScopes } from './user-profile-connected-accounts-section/user-profile-connected-accounts-section.model';

export interface UserProfileOptions {
  /**
   * Extra OAuth scopes to request per provider. A connected account missing any of them offers
   * Reconnect to grant them.
   *
   * @example { google: ['https://www.googleapis.com/auth/calendar.readonly'] }
   */
  additionalOAuthScopes?: AdditionalOAuthScopes;
  mode?: 'modal' | 'mounted';
  combined?: boolean;
}

export interface UserProfileProviderProps extends UserProfileOptions {
  children: ReactNode;
}

const UserProfileContext = createContext<UserProfileOptions>({});

export function UserProfileProvider({ additionalOAuthScopes, mode, combined, children }: UserProfileProviderProps) {
  return (
    <UserProfileContext.Provider value={{ additionalOAuthScopes, mode, combined }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfileOptions(): UserProfileOptions {
  return useContext(UserProfileContext);
}
