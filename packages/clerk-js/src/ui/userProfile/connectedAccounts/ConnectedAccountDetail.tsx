// @ts-ignore
import { default as BinIcon } from '@clerk/shared/assets/icons/bin.svg';
import { Avatar } from '@clerk/shared/components/avatar';
import { Button } from '@clerk/shared/components/button';
import { List } from '@clerk/shared/components/list';
import { TitledCard } from '@clerk/shared/components/titledCard';
import React from 'react';
import { svgUrl } from 'ui/common/constants';
import { useCoreUser } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { useRouter } from 'ui/router';
import { EditableListFieldRemoveCard } from 'ui/userProfile/EditableListFieldRemoveCard';
import { PageHeading } from 'ui/userProfile/pageHeading';

export function ConnectedAccountDetail(): JSX.Element | null {
  const { navigate } = useNavigate();
  const user = useCoreUser();
  const { params } = useRouter();
  const [showRemovalPage, setShowRemovalPage] = React.useState<boolean>(false);

  const externalAccount = user.externalAccounts.find(ea => ea.id === params.connected_account_id);

  if (!externalAccount) {
    return null;
  }

  const handleRemove = () => {
    setShowRemovalPage(true);
  };

  const onExternalAccountRemove = () => {
    return externalAccount.destroy();
  };

  const avatarRow = (
    <List.Item
      className='cl-list-item'
      key='photo'
      itemTitle='Photo'
      hoverable={false}
      detail={false}
    >
      <Avatar
        className='cl-image'
        profileImageUrl={externalAccount.avatarUrl}
        size={32}
      />
    </List.Item>
  );

  const emailAddressRow = (
    <List.Item
      className='cl-list-item'
      key='email'
      itemTitle='Email'
      hoverable={false}
      detail={false}
    >
      <div>{externalAccount.emailAddress}</div>
    </List.Item>
  );

  const usernameRow = externalAccount.username ? (
    <List.Item
      className='cl-list-item'
      key='username'
      itemTitle='Username'
      hoverable={false}
      detail={false}
    >
      <div>{externalAccount.username}</div>
    </List.Item>
  ) : (
    <></>
  );

  const disconnectExternalAccountScreen = (
    <EditableListFieldRemoveCard
      type='external_account'
      label={externalAccount.providerTitle()}
      onCancel={() => {
        setShowRemovalPage(false);
      }}
      onRemove={onExternalAccountRemove}
      onRemoved={() => {
        navigate('../');
      }}
    />
  );

  return (
    <>
      <PageHeading
        title='Connected account'
        backTo='./../'
      />
      {showRemovalPage && disconnectExternalAccountScreen}
      {!showRemovalPage && (
        <TitledCard
          title={
            <div style={{ paddingLeft: '1em' }}>
              <img
                alt={externalAccount.providerTitle()}
                src={svgUrl(externalAccount.providerSlug())}
                className='cl-left-icon-wrapper'
              />
              &nbsp; {externalAccount.providerTitle()}
            </div>
          }
          subtitle=' '
          className='cl-themed-card cl-list-card'
        >
          <List>
            {avatarRow}
            {emailAddressRow}
            {usernameRow}
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
            Disconnect
          </Button>
        </TitledCard>
      )}
    </>
  );
}
