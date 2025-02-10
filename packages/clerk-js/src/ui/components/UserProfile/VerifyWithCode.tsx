import type { EmailAddressResource, PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { Button, descriptors, localizationKeys } from '../../customizables';
import { Form, FormButtonContainer, useCardState, useFieldOTP } from '../../elements';
import { handleError } from '../../utils';

type VerifyWithCodeProps = {
  nextStep: () => void;
  identification?: EmailAddressResource | PhoneNumberResource;
  identifier?: string;
  prepareVerification?: () => Promise<any> | undefined;
  onReset: () => void;
};

export const VerifyWithCode = (props: VerifyWithCodeProps) => {
  const card = useCardState();
  const { nextStep, identification, identifier, onReset, prepareVerification } = props;

  const prepare = () => {
    return prepareVerification?.()?.catch(err => handleError(err, [], card.setError));
  };

  const otp = useFieldOTP({
    onCodeEntryFinished: (code, resolve, reject) => {
      identification
        ?.attemptVerification({ code: code })
        .then(() => resolve())
        .catch(reject);
    },
    onResendCodeClicked: prepare,
    onResolve: nextStep,
  });

  React.useEffect(() => {
    void prepare();
  }, []);

  return (
    <>
      <Form.OTPInput
        {...otp}
        label={localizationKeys('userProfile.emailAddressPage.emailCode.formTitle')}
        description={localizationKeys('userProfile.emailAddressPage.emailCode.formSubtitle', { identifier })}
        resendButton={localizationKeys('userProfile.emailAddressPage.emailCode.resendButton')}
        centerAlign={false}
      />
      <FormButtonContainer>
        <Button
          isLoading={otp.isLoading}
          localizationKey={localizationKeys('formButtonPrimary__verify')}
          elementDescriptor={descriptors.formButtonPrimary}
          onClick={otp.onFakeContinue}
        />
        <Button
          variant='ghost'
          isDisabled={otp.isLoading}
          localizationKey={localizationKeys('userProfile.formButtonReset')}
          elementDescriptor={descriptors.formButtonReset}
          onClick={onReset}
        />
      </FormButtonContainer>
    </>
  );
};
