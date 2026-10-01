import type { ReactElement } from 'react';

import { Panel } from '../../components/panel';
import { useMessages } from '../../localization';
import { themeProps } from '../../props';
import type { OrganizationProfileDangerSectionViewProps } from './organization-profile-danger-section/organization-profile-danger-section.view';
import { OrganizationProfileDangerSectionView } from './organization-profile-danger-section/organization-profile-danger-section.view';
import type { OrganizationProfileWorkspaceSectionViewProps } from './organization-profile-workspace-section/organization-profile-workspace-section.view';
import { OrganizationProfileWorkspaceSectionView } from './organization-profile-workspace-section/organization-profile-workspace-section.view';

export interface OrganizationProfileGeneralPanelViewProps
  extends OrganizationProfileWorkspaceSectionViewProps, Omit<OrganizationProfileDangerSectionViewProps, 'name'> {}

export function OrganizationProfileGeneralPanelView({
  name,
  slug,
  memberCount,
  imageUrl,
  hasImage,
  onLogoChange,
  onLogoReject,
  onRemoveLogo,
  onSubmitName,
  onSubmitSlug,
  onLeave,
  onDelete,
}: OrganizationProfileGeneralPanelViewProps): ReactElement {
  const m = useMessages('organizationProfile');

  return (
    <Panel.Root render={<div {...themeProps('organization-profile-general-panel')} />}>
      <Panel.Title>{m.pages.general}</Panel.Title>
      <Panel.Sections>
        <OrganizationProfileWorkspaceSectionView
          name={name}
          slug={slug}
          imageUrl={imageUrl}
          hasImage={hasImage}
          onLogoChange={onLogoChange}
          onLogoReject={onLogoReject}
          onRemoveLogo={onRemoveLogo}
          onSubmitName={onSubmitName}
          onSubmitSlug={onSubmitSlug}
        />
        <OrganizationProfileDangerSectionView
          name={name}
          memberCount={memberCount}
          onLeave={onLeave}
          onDelete={onDelete}
        />
      </Panel.Sections>
    </Panel.Root>
  );
}
