import { Button } from '@clerk/shared/components/button';
import { PhoneViewer } from '@clerk/shared/components/phoneInput';
import { Radio } from '@clerk/shared/components/radio';
import { TitledCard } from '@clerk/shared/components/titledCard';
import { PhoneNumberResource } from '@clerk/types';
import React from 'react';
import { handleError } from 'ui/common';
import { Error } from 'ui/common/error';
import { useCoreUser } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { Link } from 'ui/router';
import { PageHeading } from 'ui/userProfile/pageHeading';

// This is a temp workaround to make the standalone version
// of the security pages (<UserProfile only='security'/>) to work correctly
// even when the account pages are not present
// TODO: Properly handle routing during the components v2 epic
type AddPhoneProps = {
  standAlone?: boolean;
};

export const AddPhone = ({ standAlone }: AddPhoneProps): JSX.Element => {
  const user = useCoreUser();
  const { navigate } = useNavigate();
  const [error, setError] = React.useState<string | undefined>();
  const twoStepValidPhoneNumbers = React.useMemo(() => {
    return user.phoneNumbers.filter(ph => {
      return ph.verification.status === 'verified' && !ph.reservedForSecondFactor;
    });
  }, [user.phoneNumbers]);
  const [selectedPhone, setSelectedPhone] = React.useState<PhoneNumberResource | undefined>(undefined);

  const onClickCancel = () => {
    navigate('../');
  };

  const onClickContinue = async () => {
    try {
      setError(undefined);
      await selectedPhone?.setReservedForSecondFactor({ reserved: !selectedPhone?.reservedForSecondFactor });
      navigate('../');
    } catch (err) {
      handleError(err, [], setError);
    }
  };

  const phoneRows = twoStepValidPhoneNumbers.map(phone => (
    <div
      title={phone.phoneNumber}
      onClick={() => setSelectedPhone(phone)}
      key={phone.id}
      className='cl-phone-select-row'
      role='button'
      tabIndex={0}
    >
      <Radio checked={phone.id === selectedPhone?.id} label={<PhoneViewer phoneNumber={phone.phoneNumber} />} />
    </div>
  ));
  return (
    <>
      <PageHeading title='Back' backTo='../' />
      <TitledCard
        className='cl-themed-card cl-two-step-verification'
        title='Add two-step verification'
        subtitle='Choose a phone number to receive a verification code'
      >
        <Error>{error}</Error>
        <div className='cl-phone-select'>{phoneRows}</div>
        {!standAlone && (
          <div className='cl-add-phone'>
            <Link to='../../../account/phone-numbers/add'>Add new number</Link>
          </div>
        )}
        {standAlone && twoStepValidPhoneNumbers.length === 0 && (
          <div className='cl-add-phone'>No phone numbers found.</div>
        )}
        {standAlone && twoStepValidPhoneNumbers.length === 0 ? null : (
          <div className='cl-message'>
            A text message with a verification code will be sent to your phone number.
            <div className='cl-tip'>Standard carrier SMS and data fees may apply.</div>
          </div>
        )}
        <div className='cl-form-button-group'>
          <Button className='primary-button' onClick={onClickContinue} disabled={!selectedPhone}>
            Continue
          </Button>
          <Button flavor='text' type='reset' onClick={onClickCancel}>
            Cancel
          </Button>
        </div>
      </TitledCard>
    </>
  );
};
