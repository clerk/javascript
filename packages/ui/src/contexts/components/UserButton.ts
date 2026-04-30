import { useClerk } from '@clerk/shared/react';
import { createContext, useContext, useMemo } from 'react';

import { USER_BUTTON_ITEM_ID } from '@/ui/constants';
import { useAms } from '@/ui/hooks/useAms';
import { createUserButtonCustomMenuItems, type MenuItem } from '@/ui/utils/createCustomMenuItems';

import { useEnvironment, useOptions } from '../../contexts';
import { useRouter } from '../../router';
import type { UserButtonCtx } from '../../types';

export const UserButtonContext = createContext<UserButtonCtx | null>(null);

export const useUserButtonContext = () => {
  const context = useContext(UserButtonContext);
  const clerk = useClerk();
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();
  const options = useOptions();

  if (!context || context.componentName !== 'UserButton') {
    throw new Error('Clerk: useUserButtonContext called outside of the mounted UserButton component.');
  }

  const { componentName, customMenuItems, ...ctx } = context;

  const signInUrl = ctx.signInUrl || options.signInUrl || displayConfig.signInUrl;
  const userProfileUrl = ctx.userProfileUrl || displayConfig.userProfileUrl;

  const afterSignOutUrl = clerk.buildAfterSignOutUrl();
  const navigateAfterSignOut = () => navigate(afterSignOutUrl);

  const afterMultiSessionSingleSignOutUrl = clerk.buildAfterMultiSessionSingleSignOutUrl();
  const navigateAfterMultiSessionSingleSignOut = () => clerk.redirectWithAuth(afterMultiSessionSingleSignOutUrl);

  const afterSwitchSessionUrl = ctx.afterSwitchSessionUrl || displayConfig.afterSwitchSessionUrl;

  const userProfileMode = !!ctx.userProfileUrl && !ctx.userProfileMode ? 'navigation' : ctx.userProfileMode;

  const menuItems = useMemo(() => {
    return createUserButtonCustomMenuItems(customMenuItems || [], clerk);
  }, []);

  // When the active session carries the `ams` claim, the "Manage account"
  // entry would launch a <UserProfile/> modal whose underlying writes are
  // rejected by the issuer. Strip it from the menu while the claim is
  // active so users aren't presented with actions that can never succeed.
  const ams = useAms();
  const visibleMenuItems = ams.isActive
    ? menuItems.filter((item: MenuItem) => item.id !== USER_BUTTON_ITEM_ID.MANAGE_ACCOUNT)
    : menuItems;

  return {
    ...ctx,
    componentName,
    navigateAfterMultiSessionSingleSignOut,
    navigateAfterSignOut,
    signInUrl,
    userProfileUrl,
    afterMultiSessionSingleSignOutUrl,
    afterSignOutUrl,
    afterSwitchSessionUrl,
    userProfileMode: userProfileMode || 'modal',
    menutItems: visibleMenuItems,
  };
};
