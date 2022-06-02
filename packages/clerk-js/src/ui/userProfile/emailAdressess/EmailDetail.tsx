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
import { useCoreUser, useEnvironment } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { useRouter } from 'ui/router';
import { EmailAddressVerificationWithMagicLink } from 'ui/userProfile/emailAdressess/EmailAddressVerificationWithMagicLink';
import { EmailAddressVerificationWithOTP } from 'ui/userProfile/emailAdressess/EmailAddressVerificationWithOTP';
import { magicLinksEnabledForInstance } from 'ui/userProfile/emailAdressess/utils';
import { PageHeading } from 'ui/userProfile/pageHeading';

import { EditableListFieldRemoveCard } from '../EditableListFieldRemoveCard';
import { Connections, PrimaryTag } from '../util';

export function EmailDetail(): JSX.Element | null {
  const environment = useEnvironment();
  const { navigate } = useNavigate();
  const user = useCoreUser();
  const { params } = useRouter();
  const [showRemovalPage, setShowRemovalPage] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();

  const email = user.emailAddresses.find(ea => ea.id === params.email_address_id);

  const isPrimary = email?.id === user.primaryEmailAddressId;

  if (!email) {
    return null;
  }

  const verificationStatus = email.verification?.status || '';
  const isVerified = verificationStatus === 'verified';

  const handleRemove = () => {
    setShowRemovalPage(true);
  };

  const onEmailAddressRemove = () => {
    return email.destroy();
  };

  const makeIdentPrimary = async () => {
    user.update({ primaryEmailAddressId: email.id }).catch(e => handleError(e, [], setError));
  };

  const onErrorHandler = (e: any) => {
    handleError(e, [], setError);
  };

  const removeEmailAddressScreen = (
    <EditableListFieldRemoveCard
      type='email'
      label={email.emailAddress}
      buttonLabel='Remove'
      onCancel={() => {
        setShowRemovalPage(false);
      }}
      onRemove={onEmailAddressRemove}
      onRemoved={() => {
        navigate('../');
      }}
    />
  );

  return (
    <>
      <PageHeading
        title='Email'
        subtitle={isVerified ? 'Manage this email address' : 'Verify this email address'}
        backTo='./../'
      />
      {showRemovalPage && removeEmailAddressScreen}
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
                  {email.emailAddress}
                  <div className='cl-tags'>
                    {isPrimary && <PrimaryTag />}
                    <VerificationStatusTag
                      className='cl-tag'
                      status={verificationStatus}
                    />
                  </div>
                </div>
                <div>
                  <Connections linkedResources={email.linkedTo} />
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
                      <div className='cl-title'>Primary email</div>
                      <div className='cl-subtitle'>This email will receive communications regarding your account.</div>
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
            {!isVerified && (
              <List.Item
                className='cl-list-item'
                hoverable={false}
                detail={false}
                lines
              >
                {magicLinksEnabledForInstance(environment) ? (
                  <EmailAddressVerificationWithMagicLink
                    className='cl-verify-email-container'
                    email={email}
                  />
                ) : (
                  <EmailAddressVerificationWithOTP
                    className='cl-verify-email-container'
                    email={email}
                    onError={onErrorHandler}
                  />
                )}
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
            Remove
          </Button>
        </TitledCard>
      )}
    </>
  );
}
