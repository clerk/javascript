import { useUser } from '@clerk/shared/react';
import type { TOTPResource } from '@clerk/shared/types';
import React from 'react';

import { useFieldOTP } from '@/ui/elements/CodeControl';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import type { FormProps } from '@/ui/elements/FormContainer';
import { FormContainer } from '@/ui/elements/FormContainer';

import { Button, Col, descriptors, localizationKeys } from '../../customizables';

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
