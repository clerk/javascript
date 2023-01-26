import type { TOTPResource } from '@clerk/types';
import React from 'react';

import { useCoreUser } from '../../contexts';
import { Col, descriptors, localizationKeys } from '../../customizables';
import {
  ContentPage,
  FormButtonContainer,
  NavigateToFlowStartButton,
  useCardState,
  useCodeControl,
} from '../../elements';
import { CodeForm } from '../../elements/CodeForm';
import { useLoadingStatus } from '../../hooks';
import { handleError, sleep, useFormControl } from '../../utils';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

type VerifyTOTPProps = {
  onVerified: () => void;
  resourceRef: React.MutableRefObject<TOTPResource | undefined>;
};

export const VerifyTOTP = (props: VerifyTOTPProps) => {
  const { onVerified, resourceRef } = props;
  const card = useCardState();
  const user = useCoreUser();
  const status = useLoadingStatus();
  const [success, setSuccess] = React.useState(false);
  const codeControlState = useFormControl('code', '');
  const codeControl = useCodeControl(codeControlState);

  const resolve = async (totp: TOTPResource) => {
    setSuccess(true);
    resourceRef.current = totp;
    await sleep(750);
    onVerified();
  };

  const reject = async (err: any) => {
    handleError(err, [codeControlState], card.setError);
    status.setIdle();
    await sleep(750);
    codeControl.reset();
  };

  codeControl.onCodeEntryFinished(code => {
    status.setLoading();
    codeControlState.setError(undefined);
    return user
      .verifyTOTP({ code })
      .then((totp: TOTPResource) => resolve(totp))
      .catch(reject);
  });

  return (
    <ContentPage
      headerTitle={localizationKeys('userProfile.mfaTOTPPage.title')}
      Breadcrumbs={UserProfileBreadcrumbs}
    >
      <Col>
        <CodeForm
          title={localizationKeys('userProfile.mfaTOTPPage.verifyTitle')}
          subtitle={localizationKeys('userProfile.mfaTOTPPage.verifySubtitle')}
          isLoading={status.isLoading}
          success={success}
          codeControl={codeControl}
        />
      </Col>

      <FormButtonContainer sx={{ marginTop: 0 }}>
        <NavigateToFlowStartButton
          localizationKey={localizationKeys('userProfile.formButtonReset')}
          elementDescriptor={descriptors.formButtonReset}
        />
      </FormButtonContainer>
    </ContentPage>
  );
};
