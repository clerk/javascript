import type { ReactNode } from 'react';

export const OrganizationProfileRouteGuardView = ({ allowed, children }: { allowed: boolean; children: ReactNode }) =>
  allowed ? <>{children}</> : null;
