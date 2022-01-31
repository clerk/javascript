import { TitledCard } from '@clerk/shared/components/titledCard';
import { VerificationStatusTag } from '@clerk/shared/components/tag';
import { useRouter } from 'ui/router';
import { useCoreUser } from 'ui/contexts';
import React from 'react';
import { PageHeading } from 'ui/userProfile/pageHeading';
import { List } from '@clerk/shared/components/list';
import { Button } from '@clerk/shared/components/button';
import { Connections, PrimaryTag } from '../util';
import { EmailAddressResource } from '@clerk/types';

type EmailListItemProps = {
  emailAddress: EmailAddressResource;
  handleClick: () => any | undefined;
  isPrimary: boolean;
};

function EmailListItem({
  emailAddress,
  handleClick,
  isPrimary,
}: EmailListItemProps): JSX.Element {
  const status = emailAddress.verification.status || '';

  return (
    <List.Item className='cl-list-item' onClick={handleClick}>
      <div className='cl-email-item'>
        {emailAddress.emailAddress}{' '}
        <div className='cl-tags'>
          {isPrimary && <PrimaryTag />}
          <VerificationStatusTag className='cl-tag' status={status} />
        </div>
        <Connections linkedResources={emailAddress.linkedTo} />
      </div>
    </List.Item>
  );
}

export function EmailList(): JSX.Element {
  const user = useCoreUser();
  const router = useRouter();

  const emailItems = user.emailAddresses.map(ea => (
    <EmailListItem
      key={ea.id}
      emailAddress={ea}
      handleClick={() => router.navigate(ea.id)}
      isPrimary={user.primaryEmailAddressId === ea.id}
    />
  ));

  return (
    <>
      <PageHeading
        title='Emails'
        subtitle='Manage addresses associated with your account'
        backTo='../'
      />
      <TitledCard className='cl-themed-card cl-list-card'>
        {user.emailAddresses.length > 0 && <List>{emailItems}</List>}
        {user.emailAddresses.length === 0 && (
          <div className='cl-empty-list-item'>
            No email addresses to display
          </div>
        )}
        <Button
          onClick={() => router.navigate('add')}
          className='cl-add-resource-button'
          type='button'
          flavor='text'
          buttonColor='primary'
          hoverable
        >
          Add email address
        </Button>
      </TitledCard>
    </>
  );
}
