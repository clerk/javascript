import { useUser } from '@clerk/shared/react';
import type { TOTPResource } from '@clerk/types';
import React from 'react';

import { Button, Col, descriptors, localizationKeys } from '../../customizables';
import type { FormProps } from '../../elements';
import { Form, FormButtonContainer, FormContent, useFieldOTP } from '../../elements';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

type VerifyTOTPProps = FormProps & {
  resourceRef: React.MutableRefObject<TOTPResource | undefined>;
};

export const VerifyTOTP = (props: VerifyTOTPProps) => {
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
    <FormContent
      headerTitle={localizationKeys('userProfile.mfaTOTPPage.title')}
      Breadcrumbs={UserProfileBreadcrumbs}
    >
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
          localizationKey={localizationKeys('userProfile.formButtonReset')}
          elementDescriptor={descriptors.formButtonReset}
        />
      </FormButtonContainer>
    </FormContent>
  );
};
