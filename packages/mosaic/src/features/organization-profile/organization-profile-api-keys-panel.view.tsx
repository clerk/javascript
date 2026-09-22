import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Profile } from '../../components/profile';
import { useMessages } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import { styles } from './organization-profile-api-keys-panel.styles';

export type OrganizationProfileApiKeysPanelViewProps = Record<string, never>;

export function OrganizationProfileApiKeysPanelView(_props: OrganizationProfileApiKeysPanelViewProps): ReactElement {
  const m = useMessages('organizationProfile');

  return (
    <div {...mergeStyleProps(themeProps('organization-profile-api-keys-panel'), stylex.props(styles.root))}>
      <Profile.PageTitle>{m.pages.apiKeys}</Profile.PageTitle>
    </div>
  );
}
