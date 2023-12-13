import { useOrganization } from '@clerk/shared/react';
import React, { useRef } from 'react';

import { useWizard, Wizard } from '../../common';
import { useEnvironment } from '../../contexts';
import { Button, descriptors, Flex, localizationKeys, Spinner } from '../../customizables';
import type { VerificationCodeCardProps } from '../../elements';
import {
  Form,
  FormButtonContainer,
  FormButtons,
  FormContent,
  useCardState,
  useFieldOTP,
  withCardStateProvider,
} from '../../elements';
import { useFetch } from '../../hooks';
import { useRouter } from '../../router';
import { handleError, useFormControl } from '../../utils';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

export const VerifyDomainPage = withCardStateProvider(() => {
  const card = useCardState();
  const { organizationSettings } = useEnvironment();
  const { organization } = useOrganization();
  const { params, navigate } = useRouter();

  const { data: domain, status: domainStatus } = useFetch(organization?.getDomain, {
    domainId: params.id,
  });
  const title = localizationKeys('organizationProfile.verifyDomainPage.title');
  const subtitle = localizationKeys('organizationProfile.verifyDomainPage.subtitle', {
    domainName: domain?.name ?? '',
  });

  const breadcrumbTitle = localizationKeys('organizationProfile.profilePage.domainSection.title');
  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });

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
      emailAddress: affiliationEmailAddressRef.current,
    },
  );

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    domain
      ?.attemptAffiliationVerification?.({ code })
      .then(async res => {
        await resolve();
        if (res.verification?.status === 'verified') {
          return navigate(`../../../domain/${res.id}?mode=select`);
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

  if (domainStatus.isLoading || !domain) {
    return (
      <Flex
        direction={'row'}
        align={'center'}
        justify={'center'}
        sx={t => ({
          height: '100%',
          minHeight: t.sizes.$120,
        })}
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
      <FormContent
        headerTitle={title}
        breadcrumbTitle={breadcrumbTitle}
        headerSubtitle={subtitle}
        Breadcrumbs={OrganizationProfileBreadcrumbs}
      >
        <Form.Root onSubmit={onSubmitPrepare}>
          <Form.ControlRow elementId={emailField.id}>
            <Form.InputGroup
              {...emailField.props}
              autoFocus
              groupSuffix={emailDomainSuffix}
            />
          </Form.ControlRow>
          <FormButtons isDisabled={!canSubmit} />
        </Form.Root>
      </FormContent>

      <FormContent
        headerTitle={title}
        breadcrumbTitle={breadcrumbTitle}
        headerSubtitle={subtitleVerificationCodeScreen}
        Breadcrumbs={OrganizationProfileBreadcrumbs}
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
      </FormContent>
    </Wizard>
  );
});
