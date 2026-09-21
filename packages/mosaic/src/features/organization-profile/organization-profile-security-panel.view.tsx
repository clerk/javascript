import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Profile } from '../../components/profile';
import { mergeStyleProps, themeProps } from '../../props';
import { styles } from './organization-profile-security-panel.styles';

export type OrganizationProfileSecurityPanelViewProps = Record<string, never>;

export function OrganizationProfileSecurityPanelView(_props: OrganizationProfileSecurityPanelViewProps): ReactElement {
  return (
    <div {...mergeStyleProps(themeProps('organization-profile-security-panel'), stylex.props(styles.root))}>
      <Profile.PageTitle>Security</Profile.PageTitle>
    </div>
  );
}
