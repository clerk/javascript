import React from 'react';
import { useNavigate } from 'ui/hooks';
import { svgUrl } from 'ui/common/constants';
import { List } from '@clerk/shared/components/list';
import type { ExternalAccountResource } from '@clerk/types';

type ConnectedAccountListItemProps = {
  externalAccount: ExternalAccountResource;
};

export function ConnectedAccountListItem({
  externalAccount,
}: ConnectedAccountListItemProps): JSX.Element {
  const { navigate } = useNavigate();

  return (
    <List.Item
      className='cl-list-item'
      key={externalAccount.id}
      onClick={() => navigate(externalAccount.id)}
    >
      <div>
        <img
          alt={externalAccount.providerTitle()}
          src={svgUrl(externalAccount.provider)}
          className='cl-left-icon-wrapper'
        />
        {externalAccount.emailAddress}
      </div>
    </List.Item>
  );
}
