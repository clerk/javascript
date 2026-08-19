import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Heading } from '../components/heading';
import { mergeStyleProps, themeProps } from '../props';
import { styles } from './organization-profile-security.styles';
import type { OrganizationProfileSsoSectionViewProps } from './organization-profile-sso-section.view';
import { OrganizationProfileSsoSectionView } from './organization-profile-sso-section.view';
import type { OrganizationProfileVerifiedDomainsSectionViewProps } from './organization-profile-verified-domains-section.view';
import { OrganizationProfileVerifiedDomainsSectionView } from './organization-profile-verified-domains-section.view';

export interface OrganizationProfileSecurityPanelViewProps {
  sso: OrganizationProfileSsoSectionViewProps;
  verifiedDomains: OrganizationProfileVerifiedDomainsSectionViewProps;
}

export function OrganizationProfileSecurityPanelView({
  sso,
  verifiedDomains,
}: OrganizationProfileSecurityPanelViewProps): ReactElement {
  return (
    <div {...mergeStyleProps(themeProps('organization-profile-security-panel'), stylex.props(styles.root))}>
      <Heading
        render={props => <h3 {...props} />}
        size='2xl'
      >
        Security
      </Heading>
      <div {...stylex.props(styles.sections)}>
        <OrganizationProfileSsoSectionView {...sso} />
        <OrganizationProfileVerifiedDomainsSectionView {...verifiedDomains} />
      </div>
    </div>
  );
}
