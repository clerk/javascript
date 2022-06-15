import { Button } from '@clerk/shared/components/button';
import { List } from '@clerk/shared/components/list';
import { VerificationStatusTag } from '@clerk/shared/components/tag';
import { TitledCard } from '@clerk/shared/components/titledCard';
import { Web3WalletResource } from '@clerk/types';
import React from 'react';
import { useCoreUser } from 'ui/contexts';
import { useRouter } from 'ui/router';
import { PageHeading } from 'ui/userProfile/pageHeading';

import { PrimaryTag } from '../util';

type Web3WalletListItemProps = {
  web3Wallet: Web3WalletResource;
  handleClick: () => any | undefined;
  isPrimary: boolean;
};

function Web3WalletListItem({ web3Wallet, handleClick, isPrimary }: Web3WalletListItemProps): JSX.Element {
  const status = web3Wallet.verification.status || 'unverified';

  return (
    <List.Item
      className='cl-list-item'
      onClick={handleClick}
    >
      <div className='cl-web3-wallet-item'>
        {web3Wallet.web3Wallet}{' '}
        <div className='cl-tags'>
          {isPrimary && <PrimaryTag />}
          <VerificationStatusTag
            className='cl-tag'
            status={status}
          />
        </div>
      </div>
    </List.Item>
  );
}

export function Web3WalletList(): JSX.Element {
  const user = useCoreUser();
  const router = useRouter();

  const web3WalletItems = user.web3Wallets.map(web3Wallet => (
    <Web3WalletListItem
      key={web3Wallet.id}
      web3Wallet={web3Wallet}
      handleClick={() => router.navigate(web3Wallet.id)}
      isPrimary={user.primaryWeb3WalletId === web3Wallet.id}
    />
  ));

  return (
    <>
      <PageHeading
        title='Web3 wallets'
        subtitle='Manage web3 wallets associated with your account'
        backTo='../'
      />
      <TitledCard className='cl-themed-card cl-list-card'>
        {user.web3Wallets.length > 0 && <List>{web3WalletItems}</List>}
        {user.web3Wallets.length === 0 && (
          <>
            <div className='cl-empty-list-item'>No web3 wallets to display</div>
            {/*Since only Metamask wallet is supported for now, we don't allow the user to add another*/}
            {/*Web3 wallet address. When we add support for more wallets, this logic should be refactored*/}
            <Button
              onClick={() => router.navigate('add')}
              className='cl-add-resource-button'
              type='button'
              flavor='text'
              buttonColor='primary'
              hoverable
            >
              Add web3 wallet
            </Button>
          </>
        )}
      </TitledCard>
    </>
  );
}
