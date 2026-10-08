import type { PropsWithChildren } from 'react';

import { useOrganizationProfileRouteGuardModel } from './organization-profile-routes.guard.model';
import { OrganizationProfileRouteGuardView } from './organization-profile-routes.guard.view';

export type OrganizationProfileRouteGuardProps = PropsWithChildren<{
  kind: 'members' | 'billing' | 'apiKeys';
  redirectTo?: string;
}>;

export const OrganizationProfileRouteGuard = (props: OrganizationProfileRouteGuardProps) => {
  const model = useOrganizationProfileRouteGuardModel(props);

  return (
    <OrganizationProfileRouteGuardView allowed={model.allowed}>{props.children}</OrganizationProfileRouteGuardView>
  );
};
