import type { ReactElement, ReactNode } from 'react';

import { Panel } from '../../components/panel';
import { useMessages } from '../../localization';
import { themeProps } from '../../props';
import type { OrganizationProfileWorkspaceSectionViewProps } from './organization-profile-workspace-section/organization-profile-workspace-section.view';
import { OrganizationProfileWorkspaceSectionView } from './organization-profile-workspace-section/organization-profile-workspace-section.view';

export interface OrganizationProfileGeneralPanelViewProps extends OrganizationProfileWorkspaceSectionViewProps {
  dangerSlot?: ReactNode;
}

export function OrganizationProfileGeneralPanelView({
  name,
  slug,
  imageUrl,
  hasImage,
  onLogoChange,
  onLogoReject,
  onRemoveLogo,
  onSubmitName,
  onSubmitSlug,
  dangerSlot,
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
        {dangerSlot}
      </Panel.Sections>
    </Panel.Root>
  );
}
