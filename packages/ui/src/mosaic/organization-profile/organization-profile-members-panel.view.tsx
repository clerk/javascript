import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Button } from '../components/button';
import { Heading } from '../components/heading';
import { Icon } from '../components/icon';
import { Input } from '../components/input';
import { mergeStyleProps, themeProps } from '../props';
import { styles } from './organization-profile-members-panel.styles';
import type { OrganizationProfileMembersSectionViewProps } from './organization-profile-members-section.view';
import { OrganizationProfileMembersSectionView } from './organization-profile-members-section.view';

export interface OrganizationProfileMembersPanelViewProps extends OrganizationProfileMembersSectionViewProps {
  searchValue: string;
  onFilter?: () => void;
  onInvite?: () => void;
  onSearchChange: (value: string) => void;
}

export function OrganizationProfileMembersPanelView({
  searchValue,
  onFilter,
  onInvite,
  onSearchChange,
  ...sectionProps
}: OrganizationProfileMembersPanelViewProps): ReactElement {
  return (
    <div {...mergeStyleProps(themeProps('organization-profile-members-panel'), stylex.props(styles.root))}>
      <Heading
        render={props => <h3 {...props} />}
        size='2xl'
      >
        Members
      </Heading>
      <div {...stylex.props(styles.toolbar)}>
        <div {...stylex.props(styles.searchGroup)}>
          {/* TODO: Temporary search composition; replace with Mosaic InputGroup while preserving the icon and controlled value. */}
          <div {...stylex.props(styles.searchWrapper)}>
            <Icon
              aria-hidden
              name='search'
              size='sm'
              {...stylex.props(styles.searchIcon)}
            />
            <Input
              aria-label='Search members'
              autoComplete='off'
              placeholder='Search'
              size='sm'
              type='search'
              value={searchValue}
              {...stylex.props(styles.search)}
              onChange={event => onSearchChange(event.currentTarget.value)}
            />
          </div>
          {onFilter ? (
            <Button
              aria-label='Filter members'
              color='neutral'
              size='sm'
              touchTarget={false}
              variant='outline'
              {...stylex.props(styles.filterButton)}
              onClick={onFilter}
            >
              Filter
            </Button>
          ) : null}
        </div>
        {onInvite ? (
          <Button
            size='sm'
            onClick={onInvite}
          >
            Invite
          </Button>
        ) : null}
      </div>
      <OrganizationProfileMembersSectionView {...sectionProps} />
    </div>
  );
}
