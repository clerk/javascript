import React from 'react';
import { useCoreUser } from 'ui/contexts';
import { AddVerifiableField } from 'ui/userProfile/AddVerifiableField';

export const AddNewPhone = (): JSX.Element => {
  const user = useCoreUser();
  return (
    <AddVerifiableField
      label='Phone number'
      slug='phone_number'
      type='phone'
      stepTitle={{
        0: 'Enter a phone number to add',
        1: 'Verify the added phone number',
        2: 'Phone number successfully added',
      }}
      stepText={{
        0: (
          <>
            A text message with a verification code will be sent to your phone
            number.
            <div className='cl-tip'>
              Standard carrier SMS and data fees may apply.
            </div>
          </>
        ),
        1: 'A text message with a verification code has been sent to',
        2: (
          <>
            has successfully been added to your account. You can now receive
            communications on this phone number.
            <div className='cl-tip'>
              Standard carrier SMS and data fees may apply.
            </div>
          </>
        ),
      }}
      onAdd={(value: string) => user.createPhoneNumber({ phoneNumber: value })}
    />
  );
};
