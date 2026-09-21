import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Profile } from '../../components/profile';
import { useMessages } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import type { OrganizationProfileDangerSectionViewProps } from './organization-profile-danger-section/organization-profile-danger-section.view';
import { OrganizationProfileDangerSectionView } from './organization-profile-danger-section/organization-profile-danger-section.view';
import { styles } from './organization-profile-general-panel.styles';
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
    <div {...mergeStyleProps(themeProps('organization-profile-general-panel'), stylex.props(styles.root))}>
      <Profile.PageTitle>{m.pages.general}</Profile.PageTitle>
      <div {...stylex.props(styles.sections)}>
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
      </div>
    </div>
  );
}
