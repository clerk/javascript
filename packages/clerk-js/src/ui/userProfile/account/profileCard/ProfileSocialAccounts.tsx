import { List } from '@clerk/shared/components/list';
import { ExternalAccountResource } from '@clerk/types';
import React from 'react';
import { svgUrl } from 'ui/common';
import { useCoreUser } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';

export function ProfileSocialAccounts(): JSX.Element {
  const { navigate } = useNavigate();
  const user = useCoreUser();
  const verifiedAccounts = user.verifiedExternalAccounts;

  return (
    <List.Item
      className='cl-list-item'
      key='social-accounts'
      itemTitle='Social accounts'
      onClick={() => navigate('social-accounts')}
    >
      {verifiedAccounts.length === 0 ? (
        <div className='cl-empty-list-item'>None</div>
      ) : (
        <div className='cl-list-item-entry'>
          {verifiedAccounts.map((externalAccount: ExternalAccountResource) => (
            <div key={externalAccount.id}>
              <img
                alt={externalAccount.providerTitle()}
                src={svgUrl(externalAccount.provider)}
                className='cl-left-icon-wrapper'
              />

              {externalAccount.username || externalAccount.emailAddress}
            </div>
          ))}
        </div>
      )}
    </List.Item>
  );
}
