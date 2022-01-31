import React from 'react';
import { useCoreUser } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { List } from '@clerk/shared/components/list';

import { TitledCard } from '@clerk/shared/components/titledCard';

export const PersonalInformationCard = (): JSX.Element => {
  const user = useCoreUser();
  const { navigate } = useNavigate();

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

  return (
    <TitledCard
      className='cl-themed-card'
      title='Personal information'
      subtitle='Manage personal information settings'
    >
      <List className='cl-titled-card-list'>
        {firstNameRow}
        {lastnameRow}
      </List>
    </TitledCard>
  );
};
