import { List } from '@clerk/shared/components/list';
import { Tag, VerificationStatusTag } from '@clerk/shared/components/tag';
import React from 'react';
import { useCoreUser } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';

export function ProfileWeb3Wallets(): JSX.Element {
  const { navigate } = useNavigate();
  const user = useCoreUser();

  return (
    <List.Item
      className='cl-list-item'
      key='web3-wallet'
      itemTitle='Web3 wallet'
      onClick={() => navigate('web3-wallets')}
    >
      {user.web3Wallets.length > 0 ? (
        <div className='cl-list-item-entry'>
          {user.web3Wallets.map(web3Wallet => (
            <div key={web3Wallet.id}>
              {web3Wallet.web3Wallet}
              {user.isPrimaryIdentification(web3Wallet) && <Tag color='primary'>Primary</Tag>}
              {web3Wallet.verification.status && (
                <VerificationStatusTag
                  className='cl-tag'
                  status={web3Wallet.verification.status}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className='cl-empty-list-item'>None</div>
      )}
    </List.Item>
  );
}
