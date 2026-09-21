import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Profile } from '../../components/profile';
import { mergeStyleProps, themeProps } from '../../props';
import { styles } from './organization-profile-billing-panel.styles';

export type OrganizationProfileBillingPanelViewProps = Record<string, never>;

export function OrganizationProfileBillingPanelView(_props: OrganizationProfileBillingPanelViewProps): ReactElement {
  return (
    <div {...mergeStyleProps(themeProps('organization-profile-billing-panel'), stylex.props(styles.root))}>
      <Profile.PageTitle>Billing</Profile.PageTitle>
    </div>
  );
}
