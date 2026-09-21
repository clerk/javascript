import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Profile } from '../../components/profile';
import { useMessages } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import { styles } from './organization-profile-billing-panel.styles';

export type OrganizationProfileBillingPanelViewProps = Record<string, never>;

export function OrganizationProfileBillingPanelView(_props: OrganizationProfileBillingPanelViewProps): ReactElement {
  const m = useMessages('organizationProfile');

  return (
    <div {...mergeStyleProps(themeProps('organization-profile-billing-panel'), stylex.props(styles.root))}>
      <Profile.PageTitle>{m.pages.billing}</Profile.PageTitle>
    </div>
  );
}
