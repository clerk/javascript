import { deprecatedObjectProperty } from '@clerk/shared/deprecated';
import { useClerk } from '@clerk/shared/react';
import { createContext, useContext, useMemo } from 'react';

import { createUserButtonCustomMenuItems } from '@/ui/utils/createCustomMenuItems';

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

  if (ctx.afterSignOutUrl) {
    deprecatedObjectProperty(ctx, 'afterSignOutUrl', `Move 'afterSignOutUrl' to '<ClerkProvider/>`);
  }

  const afterSignOutUrl = ctx.afterSignOutUrl || clerk.buildAfterSignOutUrl();
  const navigateAfterSignOut = () => navigate(afterSignOutUrl);

  if (ctx.afterSignOutUrl) {
    deprecatedObjectProperty(
      ctx,
      'afterMultiSessionSingleSignOutUrl',
      `Move 'afterMultiSessionSingleSignOutUrl' to '<ClerkProvider/>`,
    );
  }
  const afterMultiSessionSingleSignOutUrl =
    ctx.afterMultiSessionSingleSignOutUrl || clerk.buildAfterMultiSessionSingleSignOutUrl();
  const navigateAfterMultiSessionSingleSignOut = () => clerk.redirectWithAuth(afterMultiSessionSingleSignOutUrl);

  const afterSwitchSessionUrl = ctx.afterSwitchSessionUrl || displayConfig.afterSwitchSessionUrl;

  const userProfileMode = !!ctx.userProfileUrl && !ctx.userProfileMode ? 'navigation' : ctx.userProfileMode;

  const menuItems = useMemo(() => {
    return createUserButtonCustomMenuItems(customMenuItems || [], clerk);
  }, []);

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
    menutItems: menuItems,
  };
};
