import { useOrganization } from '@clerk/shared/react';
import React, { useRef } from 'react';

import { useFieldOTP } from '@/ui/elements/CodeControl';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer, FormButtons } from '@/ui/elements/FormButtons';
import type { FormProps } from '@/ui/elements/FormContainer';
import { FormContainer } from '@/ui/elements/FormContainer';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useWizard, Wizard } from '../../common';
import { useEnvironment } from '../../contexts';
import { Button, descriptors, Flex, localizationKeys, Spinner } from '../../customizables';
import { useFetch } from '../../hooks';
import { VerifiedDomainForm } from './VerifiedDomainForm';

type VerifyDomainFormProps = FormProps & {
  domainId: string;
  skipToVerified: boolean;
};

export const VerifyDomainForm = withCardStateProvider((props: VerifyDomainFormProps) => {
  const { domainId: id, onSuccess, onReset, skipToVerified } = props;
  const card = useCardState();
  const { organizationSettings } = useEnvironment();
  const { organization } = useOrganization();

  const { data: domain, isLoading: domainIsLoading } = useFetch(!skipToVerified ? organization?.getDomain : undefined, {
    domainId: id,
  });
  const title = localizationKeys('organizationProfile.verifyDomainPage.title');
  const subtitle = localizationKeys('organizationProfile.verifyDomainPage.subtitle', {
    domainName: domain?.name ?? '',
  });

  const wizard = useWizard({ defaultStep: skipToVerified ? 2 : 0, onNextStep: () => card.setError(undefined) });

  const emailField = useFormControl('affiliationEmailAddress', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__organizationDomainEmailAddress'),
    placeholder: localizationKeys('formFieldInputPlaceholder__organizationDomainEmailAddress'),
    infoText: localizationKeys('formFieldLabel__organizationDomainEmailAddressDescription'),
    isRequired: true,
  });

  const affiliationEmailAddressRef = useRef<string>();

  const subtitleVerificationCodeScreen = localizationKeys(
    'organizationProfile.verifyDomainPage.subtitleVerificationCodeScreen',
    {
      emailAddress: affiliationEmailAddressRef.current || '',
    },
  );

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    domain
      ?.attemptAffiliationVerification?.({ code })
      .then(async res => {
        await resolve();
        if (res.verification?.status === 'verified') {
          wizard.nextStep();
        } else {
          onSuccess?.();
        }

        return;
      })
      .catch(err => reject(err));
  };

  const otp = useFieldOTP({
    onCodeEntryFinished: (code, resolve, reject) => {
      action(code, resolve, reject);
    },
    onResendCodeClicked: () => {
      domain?.prepareAffiliationVerification({ affiliationEmailAddress: emailField.value }).catch(err => {
        handleError(err, [emailField], card.setError);
      });
    },
  });

  if (!organization || !organizationSettings) {
    return null;
  }

  const dataChanged = organization.name !== emailField.value;
  const canSubmit = dataChanged;
  const emailDomainSuffix = `@${domain?.name}`;

  const onSubmitPrepare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) {
      return;
    }
    affiliationEmailAddressRef.current = `${emailField.value}${emailDomainSuffix}`;
    return domain
      .prepareAffiliationVerification({
        affiliationEmailAddress: affiliationEmailAddressRef.current,
      })
      .then(wizard.nextStep)
      .catch(err => {
        handleError(err, [emailField], card.setError);
      });
  };

  if ((domainIsLoading || !domain) && !skipToVerified) {
    return (
      <Flex
        direction={'row'}
        align={'center'}
        justify={'center'}
      >
        <Spinner
          size={'lg'}
          colorScheme={'primary'}
          elementDescriptor={descriptors.spinner}
        />
      </Flex>
    );
  }

  return (
    <Wizard {...wizard.props}>
      <FormContainer
        headerTitle={title}
        headerSubtitle={subtitle}
      >
        <Form.Root onSubmit={onSubmitPrepare}>
          <Form.ControlRow elementId={emailField.id}>
            <Form.InputGroup
              {...emailField.props}
              autoFocus
              groupSuffix={emailDomainSuffix}
              ignorePasswordManager
            />
          </Form.ControlRow>
          <FormButtons
            isDisabled={!canSubmit}
            onReset={onReset}
          />
        </Form.Root>
      </FormContainer>

      <FormContainer
        headerTitle={title}
        headerSubtitle={subtitleVerificationCodeScreen}
      >
        <Form.OTPInput
          {...otp}
          label={localizationKeys('organizationProfile.verifyDomainPage.formTitle')}
          description={localizationKeys('organizationProfile.verifyDomainPage.formSubtitle')}
          resendButton={localizationKeys('organizationProfile.verifyDomainPage.resendButton')}
        />

        <FormButtonContainer>
          <Button
            elementDescriptor={descriptors.formButtonReset}
            block={false}
            variant='ghost'
            textVariant='buttonSmall'
            type='reset'
            isDisabled={otp.isLoading || otp.otpControl.otpInputProps.feedbackType === 'success'}
            onClick={() => {
              otp.otpControl.otpInputProps.clearFeedback();
              otp.otpControl.reset();
              wizard.prevStep();
            }}
            localizationKey={localizationKeys('userProfile.formButtonReset')}
          />
        </FormButtonContainer>
      </FormContainer>

      <VerifiedDomainForm
        domainId={id}
        mode='select'
        onSuccess={onSuccess}
        onReset={onReset}
      />
    </Wizard>
  );
});
