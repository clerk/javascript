import { lazy } from 'react';

export const MountedCheckoutDrawer = lazy(() =>
  import('./MountedCheckoutDrawer').then(module => ({ default: module.MountedCheckoutDrawer })),
);
export const MountedPlanDetailDrawer = lazy(() =>
  import('./MountedPlanDetailDrawer').then(module => ({ default: module.MountedPlanDetailDrawer })),
);
