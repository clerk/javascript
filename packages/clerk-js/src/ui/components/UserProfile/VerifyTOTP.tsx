import { useUser } from '@clerk/shared/react';
import type { TOTPResource } from '@clerk/types';
import React from 'react';

import { Button, Col, descriptors, localizationKeys } from '../../customizables';
import type { FormProps } from '../../elements';
import { Form, FormButtonContainer, FormContainer, useFieldOTP, withCardStateProvider } from '../../elements';

type VerifyTOTPProps = FormProps & {
  resourceRef: React.MutableRefObject<TOTPResource | undefined>;
};

export const VerifyTOTP = withCardStateProvider((props: VerifyTOTPProps) => {
  const { onSuccess, onReset, resourceRef } = props;
  const { user } = useUser();

  const otp = useFieldOTP<TOTPResource>({
    onCodeEntryFinished: (code, resolve, reject) => {
      user
        ?.verifyTOTP({ code })
        .then((totp: TOTPResource) => resolve(totp))
        .catch(reject);
    },
    onResolve: a => {
      resourceRef.current = a;
      onSuccess();
    },
  });

  return (
    <FormContainer headerTitle={localizationKeys('userProfile.mfaTOTPPage.title')}>
      <Col>
        <Form.OTPInput
          {...otp}
          label={localizationKeys('userProfile.mfaTOTPPage.verifyTitle')}
          description={localizationKeys('userProfile.mfaTOTPPage.verifySubtitle')}
        />
      </Col>

      <FormButtonContainer sx={{ marginTop: 0 }}>
        <Button
          onClick={onReset}
          variant='ghost'
          isDisabled={otp.isLoading}
          localizationKey={localizationKeys('userProfile.formButtonReset')}
          elementDescriptor={descriptors.formButtonReset}
        />
      </FormButtonContainer>
    </FormContainer>
  );
});
