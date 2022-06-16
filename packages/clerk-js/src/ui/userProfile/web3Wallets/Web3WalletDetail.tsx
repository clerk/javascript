// @ts-ignore
import { default as BinIcon } from '@clerk/shared/assets/icons/bin.svg';
// @ts-ignore
import { default as MailIcon } from '@clerk/shared/assets/icons/mail.svg';
import { Button } from '@clerk/shared/components/button';
import { List } from '@clerk/shared/components/list';
import { VerificationStatusTag } from '@clerk/shared/components/tag';
import { TitledCard } from '@clerk/shared/components/titledCard';
import { Toggle } from '@clerk/shared/components/toggle';
import React from 'react';
import { handleError } from 'ui/common';
import { Alert } from 'ui/common/alert';
import { useCoreUser } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { useRouter } from 'ui/router';
import { PageHeading } from 'ui/userProfile/pageHeading';

import { EditableListFieldRemoveCard } from '../EditableListFieldRemoveCard';
import { PrimaryTag } from '../util';

export function Web3WalletDetail(): JSX.Element | null {
  const { navigate } = useNavigate();
  const user = useCoreUser();
  const { params } = useRouter();
  const [showRemovalPage, setShowRemovalPage] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();

  const web3Wallet = user.web3Wallets.find(ea => ea.id === params.web3_wallet_id);
  const isPrimary = web3Wallet?.id === user.primaryWeb3WalletId;

  if (!web3Wallet) {
    return null;
  }

  const verificationStatus = web3Wallet.verification?.status || 'unverified';
  const isVerified = web3Wallet.verification?.status === 'verified';

  const handleRemove = () => {
    setShowRemovalPage(true);
  };

  const onWeb3WalletRemove = () => {
    return web3Wallet.destroy();
  };

  const makeIdentPrimary = async () => {
    await user.update({ primaryWeb3WalletId: web3Wallet.id }).catch(e => handleError(e, [], setError));
  };

  const removeWeb3WalletScreen = (
    <EditableListFieldRemoveCard
      type='web3_wallet'
      label={web3Wallet.web3Wallet}
      buttonLabel='Unlink'
      onCancel={() => {
        setShowRemovalPage(false);
      }}
      onRemove={onWeb3WalletRemove}
      onRemoved={() => {
        navigate('../');
      }}
    />
  );

  return (
    <>
      <PageHeading
        title='Web3 wallet'
        subtitle={isVerified ? 'Manage this Web3 wallet' : 'Verify this Web3 wallet'}
        backTo='./../'
      />
      {showRemovalPage && removeWeb3WalletScreen}
      {!showRemovalPage && (
        <TitledCard className='cl-themed-card cl-list-card cl-verifiable-field-card'>
          <Alert
            type='error'
            style={{ margin: '0 2em' }}
          >
            {error}
          </Alert>

          <List>
            <List.Item
              className='cl-list-item'
              hoverable={false}
              detail={false}
              lines
            >
              <div>
                <div className='cl-ident-detail'>
                  {web3Wallet.web3Wallet}
                  <div className='cl-tags'>
                    {isPrimary && <PrimaryTag />}
                    <VerificationStatusTag
                      className='cl-tag'
                      status={verificationStatus}
                    />
                  </div>
                </div>
              </div>
            </List.Item>

            {isVerified && (
              <List.Item
                className='cl-list-item'
                hoverable={false}
                detail={false}
                lines
              >
                <div className='cl-primary-status-container'>
                  <div className='cl-description'>
                    <MailIcon />
                    <div className='cl-text'>
                      <div className='cl-title'>Primary web3 wallet</div>
                    </div>
                  </div>
                  <Toggle
                    name='primary_toggle'
                    disabled={isPrimary}
                    checked={isPrimary}
                    handleChange={makeIdentPrimary}
                  />
                </div>
              </List.Item>
            )}
          </List>
          <Button
            onClick={handleRemove}
            className='cl-add-resource-button cl-remove-button'
            type='button'
            flavor='text'
            buttonColor='error'
            hoverable
          >
            <BinIcon />
            Unlink
          </Button>
        </TitledCard>
      )}
    </>
  );
}
