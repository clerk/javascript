import React from 'react';

import { useOrganizationSecurityPageController } from './organization-security-page.controller';
import {
  useOrganizationSecurityPageGuardModel,
  useOrganizationSecurityPageModel,
} from './organization-security-page.model';
import { OrganizationSecurityPageView } from './organization-security-page.view';

type OrganizationSecurityPageProps = {
  contentRef: React.RefObject<HTMLDivElement>;
};

export const OrganizationSecurityPage = ({ contentRef }: OrganizationSecurityPageProps) => {
  const { hasOrganization } = useOrganizationSecurityPageGuardModel();

  if (!hasOrganization) {
    // We should never reach this point, but we'll return null to make TS happy
    return null;
  }

  return <OrganizationSecurityPageContent contentRef={contentRef} />;
};

const OrganizationSecurityPageContent = ({ contentRef }: OrganizationSecurityPageProps) => {
  const model = useOrganizationSecurityPageModel();
  const controller = useOrganizationSecurityPageController(model);
  return (
    <OrganizationSecurityPageView
      contentRef={contentRef}
      controller={controller}
    />
  );
};
