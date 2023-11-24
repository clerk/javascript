import type { EmailAddressResource, PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { descriptors, localizationKeys } from '../../customizables';
import { Form, FormButtonContainer, NavigateToFlowStartButton, useCardState, useFieldOTP } from '../../elements';
import { handleError } from '../../utils';

type VerifyWithCodeProps = {
  nextStep: () => void;
  identification?: EmailAddressResource | PhoneNumberResource;
  identifier?: string;
  prepareVerification?: () => Promise<any> | undefined;
};

export const VerifyWithCode = (props: VerifyWithCodeProps) => {
  const card = useCardState();
  const { nextStep, identification, identifier, prepareVerification } = props;

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
      />
      <FormButtonContainer>
        <NavigateToFlowStartButton
          localizationKey={localizationKeys('userProfile.formButtonReset')}
          elementDescriptor={descriptors.formButtonReset}
        />
      </FormButtonContainer>
    </>
  );
};
