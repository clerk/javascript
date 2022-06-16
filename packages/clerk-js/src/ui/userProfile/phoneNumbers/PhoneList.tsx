import { Button } from '@clerk/shared/components/button';
import { List } from '@clerk/shared/components/list';
import { PhoneViewer } from '@clerk/shared/components/phoneInput';
import { Tag, VerificationStatusTag } from '@clerk/shared/components/tag';
import { TitledCard } from '@clerk/shared/components/titledCard';
import { PhoneNumberResource } from '@clerk/types';
import React from 'react';
import { useCoreUser } from 'ui/contexts';
import { useRouter } from 'ui/router';
import { PageHeading } from 'ui/userProfile/pageHeading';

export const PhoneList = (): JSX.Element => {
  const user = useCoreUser();
  const router = useRouter();

  const createPhoneListItem = (phone: PhoneNumberResource) => {
    const verificationStatus = phone.verification.status || 'unverified';
    const isPrimary = user.primaryPhoneNumber?.id === phone.id;
    const primaryTag = isPrimary ? (
      <Tag
        color='primary'
        className='cl-tag'
      >
        Primary
      </Tag>
    ) : null;

    const connections = phone.linkedTo.map(connection => (
      <div
        key={connection.id}
        className='cl-connection-info'
      >
        Connected to {connection.type}
      </div>
    ));

    return (
      <List.Item
        className='cl-list-item'
        onClick={() => router.navigate(phone.id)}
        key={phone.id}
      >
        <div className='cl-phone-item'>
          <PhoneViewer phoneNumber={phone.phoneNumber} />
          <div className='cl-tags'>
            {primaryTag}
            <VerificationStatusTag
              className='cl-tag'
              status={verificationStatus}
            />
          </div>
          {connections}
        </div>
      </List.Item>
    );
  };

  return (
    <>
      <PageHeading
        title='Phone numbers'
        subtitle='Manage phone numbers associated with your account'
        backTo='../'
      />
      <TitledCard className='cl-themed-card cl-list-card'>
        {user.phoneNumbers.length > 0 && <List>{user.phoneNumbers.map(createPhoneListItem)}</List>}
        {user.phoneNumbers.length === 0 && <div className='cl-empty-list-item'>No phone numbers to display</div>}
        <Button
          onClick={() => router.navigate('add')}
          className='cl-add-resource-button'
          type='button'
          flavor='text'
          buttonColor='primary'
          hoverable
        >
          Add phone number
        </Button>
      </TitledCard>
    </>
  );
};
