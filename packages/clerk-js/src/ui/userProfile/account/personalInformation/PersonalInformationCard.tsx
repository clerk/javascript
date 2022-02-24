import { List } from '@clerk/shared/components/list';
import { TitledCard } from '@clerk/shared/components/titledCard';
import React from 'react';
import { useCoreUser, useEnvironment } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';

export const PersonalInformationCard = (): JSX.Element | null => {
  const user = useCoreUser();
  const { navigate } = useNavigate();
  const { userSettings } = useEnvironment();
  const {
    attributes: { first_name, last_name },
  } = userSettings;

  const hasAtLeastOneAttributeEnable =
    first_name?.enabled || last_name?.enabled;

  if (!hasAtLeastOneAttributeEnable) {
    return null;
  }

  const firstNameRow = (
    <List.Item
      className='cl-list-item'
      key='first-name'
      itemTitle='First name'
      onClick={() => navigate('first-name')}
    >
      {user.firstName || ''}
    </List.Item>
  );

  const lastnameRow = (
    <List.Item
      className='cl-list-item'
      key='last-name'
      itemTitle='Last name'
      onClick={() => navigate('last-name')}
    >
      {user.lastName || ''}
    </List.Item>
  );

  const showFirstName = first_name.enabled;
  const showLastName = last_name.enabled;

  return (
    <TitledCard
      className='cl-themed-card'
      title='Personal information'
      subtitle='Manage personal information settings'
    >
      <List className='cl-titled-card-list'>
        {showFirstName && firstNameRow}
        {showLastName && lastnameRow}
      </List>
    </TitledCard>
  );
};
