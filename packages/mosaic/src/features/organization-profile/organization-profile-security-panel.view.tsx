import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Profile } from '../../components/profile';
import { useMessages } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import { styles } from './organization-profile-security-panel.styles';

export type OrganizationProfileSecurityPanelViewProps = Record<string, never>;

export function OrganizationProfileSecurityPanelView(_props: OrganizationProfileSecurityPanelViewProps): ReactElement {
  const m = useMessages('organizationProfile');

  return (
    <div {...mergeStyleProps(themeProps('organization-profile-security-panel'), stylex.props(styles.root))}>
      <Profile.PageTitle>{m.pages.security}</Profile.PageTitle>
    </div>
  );
}
