import type { OrganizationDomainResource } from '@clerk/types';
import React, { useEffect } from 'react';

import { useWizard, Wizard } from '../../common';
import { useCoreOrganization } from '../../contexts';
import { Button, descriptors, Flex, localizationKeys, Spinner } from '../../customizables';
import type { VerificationCodeCardProps } from '../../elements';
import {
  ContentPage,
  Form,
  FormButtonContainer,
  FormButtons,
  useCardState,
  useCodeControl,
  withCardStateProvider,
} from '../../elements';
import { CodeForm } from '../../elements/CodeForm';
import { useLoadingStatus } from '../../hooks';
import { useRouter } from '../../router';
import { handleError, sleep, useFormControl } from '../../utils';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

export const VerifyDomainPage = withCardStateProvider(() => {
  const card = useCardState();
  const { organization } = useCoreOrganization();
  const { navigate, params } = useRouter();

  const [success, setSuccess] = React.useState(false);
  const [domain, setDomain] = React.useState<OrganizationDomainResource | null>(null);

  const title = localizationKeys('organizationProfile.verifyDomainPage.title');
  const subtitle = localizationKeys('organizationProfile.verifyDomainPage.subtitle', {
    domainName: domain?.name ?? '',
  });
  const status = useLoadingStatus();
  const domainStatus = useLoadingStatus({
    status: 'loading',
  });
  const codeControlState = useFormControl('code', '');
  const codeControl = useCodeControl(codeControlState);

  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });

  const emailField = useFormControl('emailAddress', '', {
    type: 'email',
    label: localizationKeys('formFieldLabel__organizationEmailDomain'),
    placeholder: localizationKeys('formFieldInputPlaceholder__organizationName'),
  });

  useEffect(() => {
    domainStatus.setLoading();
    organization
      ?.getDomain?.({
        domainId: params.id,
      })
      .then(domain => {
        domainStatus.setIdle();
        setDomain(domain);
      })
      .catch(() => {
        setDomain(null);
        domainStatus.setError();
      });
  }, [params.id]);

  const resolve = async () => {
    setSuccess(true);
    await sleep(750);
  };

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    organization
      ?.attemptDomainAffiliationVerification({
        domainId: params.id,
        code,
      })
      .then(async res => {
        await resolve();
        if (res.verification?.status === 'verified') {
          return navigate('../../');
        }
        return;
      })
      .catch(err => reject(err));
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
    action(code, resolve, reject);
  });

  if (!organization) {
    return null;
  }
  const handleResend = () => {
    codeControl.reset();
  };

  const dataChanged = organization.name !== emailField.value;
  const canSubmit = dataChanged;

  const onSubmitPrepare = (e: React.FormEvent) => {
    e.preventDefault();
    return organization
      .prepareDomainAffiliationVerification({
        domainId: params.id,
        emailAddress: emailField.value,
      })
      .then(wizard.nextStep)
      .catch(err => {
        handleError(err, [emailField], card.setError);
      });
  };

  if (domainStatus.isLoading) {
    return (
      <Flex
        direction={'row'}
        align={'center'}
        justify={'center'}
        sx={{
          height: '100%',
        }}
      >
        <Spinner
          size={'lg'}
          colorScheme={'primary'}
        />
      </Flex>
    );
  }

  return (
    <Wizard {...wizard.props}>
      <ContentPage
        headerTitle={title}
        headerSubtitle={subtitle}
        Breadcrumbs={OrganizationProfileBreadcrumbs}
      >
        <Form.Root onSubmit={onSubmitPrepare}>
          <Form.ControlRow elementId={emailField.id}>
            <Form.Control
              {...emailField.props}
              autoFocus
              required
            />
          </Form.ControlRow>
          <FormButtons isDisabled={!canSubmit} />
        </Form.Root>
      </ContentPage>

      <ContentPage
        headerTitle={title}
        headerSubtitle={subtitle}
        Breadcrumbs={OrganizationProfileBreadcrumbs}
      >
        <CodeForm
          title={localizationKeys('organizationProfile.verifyDomainPage.formTitle')}
          subtitle={localizationKeys('organizationProfile.verifyDomainPage.formSubtitle')}
          resendButton={localizationKeys('organizationProfile.verifyDomainPage.resendButton')}
          isLoading={status.isLoading}
          success={success}
          codeControl={codeControl}
          onResendCodeClicked={handleResend}
        />

        <FormButtonContainer>
          <Button
            elementDescriptor={descriptors.formButtonReset}
            block={false}
            variant='ghost'
            textVariant='buttonExtraSmallBold'
            type='reset'
            isDisabled={status.isLoading || success}
            onClick={wizard.prevStep}
            localizationKey={localizationKeys('userProfile.formButtonReset')}
          />
        </FormButtonContainer>
      </ContentPage>
    </Wizard>
  );
});
