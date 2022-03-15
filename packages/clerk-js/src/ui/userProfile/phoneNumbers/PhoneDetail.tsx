// @ts-ignore
import { default as BinIcon } from '@clerk/shared/assets/icons/bin.svg';
// @ts-ignore
import { default as PhoneIcon } from '@clerk/shared/assets/icons/phone.svg';
import { Button } from '@clerk/shared/components/button';
import { List } from '@clerk/shared/components/list';
import { OneTimeCodeInput, VerifyCodeHandler } from '@clerk/shared/components/oneTimeCodeInput';
import { PhoneViewer } from '@clerk/shared/components/phoneInput';
import { VerificationStatusTag } from '@clerk/shared/components/tag';
import { TitledCard } from '@clerk/shared/components/titledCard';
import { Toggle } from '@clerk/shared/components/toggle';
import React from 'react';
import { handleError, useFieldState, verificationErrorMessage } from 'ui/common';
import { Error } from 'ui/common/error';
import { useCoreUser } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { useRouter } from 'ui/router';
import { PageHeading } from 'ui/userProfile/pageHeading';

import { EditableListFieldRemoveCard } from '../EditableListFieldRemoveCard';
import { PrimaryTag } from '../util';

export const PhoneDetail = (): JSX.Element => {
  const { navigate } = useNavigate();
  const user = useCoreUser();
  const { params } = useRouter();
  const [showRemovalPage, setShowRemovalPage] = React.useState<boolean>(false);
  const [isPrimary, setIsPrimary] = React.useState(false);
  const currentCode = useFieldState('', '');
  const [error, setError] = React.useState<string | undefined>();

  const phoneIdent = user.phoneNumbers.find(pi => pi.id === params.phone_number_id);

  const verificationStatus = phoneIdent?.verification?.status || '';
  const isVerified = verificationStatus === 'verified';

  // TODO: we need this because updating the user obj
  // does not trigger a rerender through the context. Please discuss
  React.useLayoutEffect(() => {
    setIsPrimary(phoneIdent?.id === user?.primaryPhoneNumberId);
  }, []);

  React.useEffect(() => {
    if (!phoneIdent || isVerified) {
      return;
    }
    void sendVerificationCode();
  }, []);

  if (phoneIdent === undefined) {
    // TODO Braden: 404 here?
    return <></>;
  }

  const handleRemove = () => {
    setShowRemovalPage(true);
  };

  const onPhoneNumberRemove = () => {
    return phoneIdent.destroy();
  };

  const sendVerificationCode = async () => {
    try {
      await phoneIdent?.prepareVerification();
    } catch (err) {
      handleError(err, [currentCode], setError);
    }
  };

  const verifyCode: VerifyCodeHandler = async (verify, reject) => {
    try {
      await phoneIdent?.attemptVerification({ code: currentCode.value });
      verify(() => currentCode.setValue(''));
    } catch (err) {
      reject(verificationErrorMessage(err));
    }
  };

  const makeIdentPrimary = async () => {
    try {
      await user.update({ primary_phone_number_id: phoneIdent?.id });
      setIsPrimary(true);
    } catch (err) {
      handleError(err, [currentCode], setError);
    }
  };

  const otpInput = (
    <OneTimeCodeInput
      value={currentCode.value}
      setValue={currentCode.setValue}
      verifyCodeHandler={verifyCode}
      onResendCode={sendVerificationCode}
      className={'otp-input'}
    />
  );

  const connections = phoneIdent.linkedTo.map(connection => (
    <div key={connection.id} className='cl-connection-info'>
      Connected to {connection.type}
    </div>
  ));

  const removalPage = (
    <EditableListFieldRemoveCard
      type='phone'
      label={phoneIdent.phoneNumber}
      onCancel={() => {
        setShowRemovalPage(false);
      }}
      onRemove={onPhoneNumberRemove}
      onRemoved={() => {
        navigate('../');
      }}
    />
  );

  return (
    <>
      <PageHeading
        title='Phone number'
        subtitle={isVerified ? 'Manage this phone number' : 'Verify this phone number'}
        backTo='./../'
      />
      {showRemovalPage ? (
        removalPage
      ) : (
        <TitledCard className='cl-themed-card cl-list-card'>
          <Error style={{ margin: '0 2em' }}>{error}</Error>
          <List>
            <List.Item className='cl-list-item' hoverable={false} detail={false} lines>
              <div>
                <div className='cl-ident-detail'>
                  <PhoneViewer phoneNumber={phoneIdent.phoneNumber} showFlag={true} />
                  <div className='cl-tags'>
                    {isPrimary && <PrimaryTag />}
                    <VerificationStatusTag className='cl-tag' status={verificationStatus} />
                  </div>
                </div>
                <div>{connections}</div>
              </div>
            </List.Item>

            {isVerified && (
              <List.Item className='cl-list-item' hoverable={false} detail={false} lines>
                <div className='cl-primary-status-container'>
                  <div className='cl-description'>
                    <PhoneIcon />
                    <div className='cl-text'>
                      <div className='cl-title'>Primary phone</div>
                      <div className='cl-subtitle'>This phone will receive communications regarding your account.</div>
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
          {!isVerified && otpInput}
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
};
