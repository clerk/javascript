import { useClerk } from '@clerk/shared/react';
import { createContext, useContext, useMemo } from 'react';

import type { NavbarRoute } from '../../elements';
import type { ParsedQueryString } from '../../router';
import { useRouter } from '../../router';
import type { UserProfileCtx } from '../../types';
import type { CustomPageContent } from '../../utils';
import { createUserProfileCustomPages } from '../../utils';

type PagesType = {
  routes: NavbarRoute[];
  contents: CustomPageContent[];
  pageToRootNavbarRouteMap: Record<string, NavbarRoute>;
};

export type UserProfileContextType = UserProfileCtx & {
  queryParams: ParsedQueryString;
  authQueryString: string | null;
  pages: PagesType;
};

export const UserProfileContext = createContext<UserProfileCtx | null>(null);

export const useUserProfileContext = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  const { queryParams } = useRouter();
  const clerk = useClerk();

  if (!context || context.componentName !== 'UserProfile') {
    throw new Error('Clerk: useUserProfileContext called outside of the mounted UserProfile component.');
  }

  const { componentName, customPages, ...ctx } = context;

  const pages = useMemo(() => {
    return createUserProfileCustomPages(customPages || [], clerk);
  }, [customPages]);

  return {
    ...ctx,
    pages,
    componentName,
    queryParams,
    authQueryString: '',
  };
};
