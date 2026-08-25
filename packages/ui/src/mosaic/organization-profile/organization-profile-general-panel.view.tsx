import * as stylex from '@stylexjs/stylex';

import { Heading } from '../components/heading';
import { mergeStyleProps, themeProps } from '../props';
import type { OrganizationProfileDangerSectionViewProps } from './organization-profile-danger-section.view';
import { OrganizationProfileDangerSectionView } from './organization-profile-danger-section.view';
import type { OrganizationProfileDetailsSectionViewProps } from './organization-profile-details-section.view';
import { OrganizationProfileDetailsSectionView } from './organization-profile-details-section.view';
import { styles } from './organization-profile-general-panel.styles';

export interface OrganizationProfileGeneralPanelViewProps
  extends OrganizationProfileDetailsSectionViewProps, OrganizationProfileDangerSectionViewProps {}

export function OrganizationProfileGeneralPanelView({
  logoUrl,
  name,
  slug,
  onCopySlug,
  onDeleteOrganization,
  onLeaveOrganization,
  onNameChange,
  onUploadLogo,
}: OrganizationProfileGeneralPanelViewProps) {
  return (
    <div {...mergeStyleProps(themeProps('organization-profile-general-panel'), stylex.props(styles.root))}>
      <Heading
        render={props => <h3 {...props} />}
        size='2xl'
      >
        General
      </Heading>
      <div {...stylex.props(styles.sections)}>
        <OrganizationProfileDetailsSectionView
          logoUrl={logoUrl}
          name={name}
          slug={slug}
          onCopySlug={onCopySlug}
          onNameChange={onNameChange}
          onUploadLogo={onUploadLogo}
        />
        <OrganizationProfileDangerSectionView
          onDeleteOrganization={onDeleteOrganization}
          onLeaveOrganization={onLeaveOrganization}
        />
      </div>
    </div>
  );
}
