import { lazy } from 'react';

export const MountedCheckoutDrawer = lazy(() =>
  import('./MountedCheckoutDrawer').then(module => ({ default: module.MountedCheckoutDrawer })),
);
export const MountedSubscriptionDetailDrawer = lazy(() =>
  import('./MountedSubscriptionDetailDrawer').then(module => ({ default: module.MountedSubscriptionDetailDrawer })),
);
