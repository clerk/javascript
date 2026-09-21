import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Profile } from '../../components/profile';
import { mergeStyleProps, themeProps } from '../../props';
import { styles } from './organization-profile-api-keys-panel.styles';

export type OrganizationProfileApiKeysPanelViewProps = Record<string, never>;

export function OrganizationProfileApiKeysPanelView(_props: OrganizationProfileApiKeysPanelViewProps): ReactElement {
  return (
    <div {...mergeStyleProps(themeProps('organization-profile-api-keys-panel'), stylex.props(styles.root))}>
      <Profile.PageTitle>API Keys</Profile.PageTitle>
    </div>
  );
}
