import type { OrganizationProfileModalProps, OrganizationProfileProps } from '@clerk/shared/types';
import type { ComponentType } from 'react';

import { withCoreUserGuard } from '@/contexts';
import { withCardStateProvider } from '@/elements/contexts';
import type { WithInternalRouting } from '@/internal';
import type { OrganizationProfileCtx } from '@/types';

import { useOrganizationProfileController } from './organization-profile.controller';
import { useOrganizationProfileModel } from './organization-profile.model';
import {
  OrganizationProfileModalView,
  OrganizationProfileRoutesView,
  OrganizationProfileView,
} from './organization-profile.view';

const OrganizationProfileInternal = () => {
  const model = useOrganizationProfileModel();

  if (!model.hasOrganization) {
    return null;
  }

  return (
    <OrganizationProfileView>
      <AuthenticatedRoutes />
    </OrganizationProfileView>
  );
};

const AuthenticatedRoutes = withCoreUserGuard(() => {
  const controller = useOrganizationProfileController();
  return <OrganizationProfileRoutesView contentRef={controller.contentRef} />;
});

export const OrganizationProfile: ComponentType<OrganizationProfileProps> =
  withCardStateProvider(OrganizationProfileInternal);

const InternalOrganizationProfile: ComponentType<WithInternalRouting<OrganizationProfileProps>> =
  withCardStateProvider(OrganizationProfileInternal);

export const OrganizationProfileModal = (props: OrganizationProfileModalProps): JSX.Element => {
  const organizationProfileProps: OrganizationProfileCtx = {
    ...props,
    routing: 'virtual',
    componentName: 'OrganizationProfile',
    mode: 'modal',
  };

  return (
    <OrganizationProfileModalView profileProps={organizationProfileProps}>
      <InternalOrganizationProfile {...organizationProfileProps} />
    </OrganizationProfileModalView>
  );
};
