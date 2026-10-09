import { createContext, type ReactNode, useContext } from 'react';

import type { AdditionalOAuthScopes } from './user-profile-connected-accounts-section/user-profile-connected-accounts-section.model';

export interface UserProfileOptions {
  additionalOAuthScopes?: AdditionalOAuthScopes;
  mode?: 'modal' | 'mounted';
}

export interface UserProfileProviderProps extends UserProfileOptions {
  children: ReactNode;
}

const UserProfileContext = createContext<UserProfileOptions>({});

export function UserProfileProvider({ additionalOAuthScopes, mode, children }: UserProfileProviderProps) {
  return <UserProfileContext.Provider value={{ additionalOAuthScopes, mode }}>{children}</UserProfileContext.Provider>;
}

export function useUserProfileOptions(): UserProfileOptions {
  return useContext(UserProfileContext);
}
