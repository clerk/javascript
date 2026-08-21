import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Button } from '../components/button';
import { Heading } from '../components/heading';
import { Icon } from '../components/icon';
import { Input } from '../components/input';
import { mergeStyleProps, themeProps } from '../props';
import { styles } from './organization-profile-api-keys-panel.styles';
import type { OrganizationProfileApiKeysSectionViewProps } from './organization-profile-api-keys-section.view';
import { OrganizationProfileApiKeysSectionView } from './organization-profile-api-keys-section.view';

export interface OrganizationProfileApiKeysPanelViewProps extends OrganizationProfileApiKeysSectionViewProps {
  searchValue: string;
  onCreate?: () => void;
  onSearchChange: (value: string) => void;
}

export function OrganizationProfileApiKeysPanelView({
  searchValue,
  onCreate,
  onSearchChange,
  ...sectionProps
}: OrganizationProfileApiKeysPanelViewProps): ReactElement {
  return (
    <div {...mergeStyleProps(themeProps('organization-profile-api-keys-panel'), stylex.props(styles.root))}>
      <Heading
        render={props => <h3 {...props} />}
        size='2xl'
      >
        API Keys
      </Heading>
      <div {...stylex.props(styles.toolbar)}>
        {/* TODO: Temporary search composition; replace with Mosaic InputGroup while preserving the icon and controlled value. */}
        <div {...stylex.props(styles.searchWrapper)}>
          <Icon
            aria-hidden
            name='search'
            size='sm'
            {...stylex.props(styles.searchIcon)}
          />
          <Input
            aria-label='Search API keys'
            autoComplete='off'
            placeholder='Search'
            size='sm'
            type='search'
            value={searchValue}
            {...stylex.props(styles.search)}
            onChange={event => onSearchChange(event.currentTarget.value)}
          />
        </div>
        {onCreate ? <Button onClick={onCreate}>Create API key</Button> : null}
      </div>
      <OrganizationProfileApiKeysSectionView {...sectionProps} />
    </div>
  );
}
