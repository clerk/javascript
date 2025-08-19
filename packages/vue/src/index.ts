import { setClerkJsLoadingErrorPackageName } from '@clerk/shared/loadClerkJsScript';

import { setErrorThrowerOptions } from './errors/errorThrower';

export * from './components';
export * from './composables';

export { clerkPlugin, type PluginOptions } from './plugin';
export { updateClerkOptions } from './utils';

export type {
  __experimental_SubscriptionDetailsButtonProps as SubscriptionDetailsButtonProps,
  __experimental_CheckoutButtonProps as CheckoutButtonProps,
  __experimental_PlanDetailsButtonProps as PlanDetailsButtonProps,
} from '@clerk/types';

setErrorThrowerOptions({ packageName: PACKAGE_NAME });
setClerkJsLoadingErrorPackageName(PACKAGE_NAME);
