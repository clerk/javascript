import { useSession, useUser } from '@clerk/shared/react';
import type { EmailAddressResource } from '@clerk/shared/types';
import { useRef } from 'react';

import {
  Col,
  descriptors,
  Flow,
  Heading,
  Icon,
  Input,
  localizationKeys,
  Text,
  useLocalizations,
} from '@/customizables';
import { DuotoneAtSymbol, ExclamationTriangle } from '@/icons';

import { useConfigureSSOFlow } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { useWizard, Wizard } from '../elements/Wizard';

export const VerifyDomainStep = (): JSX.Element => {
  const { user } = useUser();
  const { session } = useSession();
  const { enterpriseConnection } = useConfigureSSOFlow();
  const { t } = useLocalizations();

  const emailToVerify =
    user?.primaryEmailAddress ?? user?.emailAddresses?.find(e => e.verification.status !== 'verified');
  const isVerified = emailToVerify?.verification.status === 'verified';

  // The user's domain is already wired to an enterprise connection that
  // doesn't belong to the org they're currently configuring
  const activeOrganizationId = session?.lastActiveOrganizationId ?? null;
  const isDomainTakenByOtherOrg = Boolean(
    isVerified && enterpriseConnection && enterpriseConnection.organizationId !== activeOrganizationId,
  );

  if (isDomainTakenByOtherOrg) {
    const conflictingDomain = enterpriseConnection?.domains[0] as string;

    return (
      <Flow.Part part='verifyDomain'>
        <Step>
          <Icon
            icon={ExclamationTriangle}
            sx={t => ({
              width: t.sizes.$8,
              height: t.sizes.$8,
              color: t.colors.$neutralAlpha600,
            })}
          />
          <Col sx={t => ({ gap: t.space.$1, textAlign: 'center', maxWidth: t.sizes.$66 })}>
            <Heading
              textVariant='h1'
              sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$md })}
              localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.domainTaken.title', {
                domain: conflictingDomain,
              })}
            />
            <Text
              as='p'
              variant='body'
              sx={t => ({ color: t.colors.$colorMutedForeground })}
              localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.domainTaken.subtitle')}
            />
          </Col>
        </Step>
      </Flow.Part>
    );
  }

  return (
    <Flow.Part part='verifyDomain'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('verify-domain')}
      >
        <Wizard>
          <Step.Header
            title={t(localizationKeys('configureSSO.verifyEmailDomainStep.title'))}
            description={t(localizationKeys('configureSSO.verifyEmailDomainStep.subtitle'))}
          >
            <InnerStepCounter />
          </Step.Header>

          <Step.Body>
            {!emailToVerify && (
              <Wizard.Step id='provide-email'>
                <ProvideEmailStep />
              </Wizard.Step>
            )}

            <Wizard.Step id='verify-email-address'>
              <EnterVerificationCodeStep emailToVerify={emailToVerify} />
            </Wizard.Step>
          </Step.Body>
        </Wizard>
      </Step>
    </Flow.Part>
  );
};

const InnerStepCounter = (): JSX.Element => {
  const { currentIndex, totalSteps } = useWizard();
  return (
    <Step.Counter
      total={totalSteps}
      current={currentIndex + 1}
    />
  );
};

export const ProvideEmailStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Section
        sx={{ flex: 1 }}
        align='center'
        justify='center'
      >
        <Text>UI goes here</Text>
      </Step.Section>

      <Step.Footer>
        <Step.Footer.Previous
          onClick={() => goPrev()}
          isDisabled={isFirstStep}
        />
        <Step.Footer.Continue
          onClick={() => goNext()}
          isDisabled={isLastStep}
        />
      </Step.Footer>
    </>
  );
};

export const EnterVerificationCodeStep = ({ emailToVerify }: { emailToVerify?: EmailAddressResource }): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  const codeSubmittedRef = useRef(false);
  const isVerified = emailToVerify?.verification.status === 'verified';
  const hasVerifiedEmail = emailToVerify?.emailAddress && isVerified && !codeSubmittedRef.current;

  return (
    <>
      <Step.Section
        sx={{ flex: 1 }}
        align='center'
        justify='center'
      >
        {hasVerifiedEmail ? (
          <EmailAlreadyVerified emailAddress={emailToVerify.emailAddress} />
        ) : (
          <Text>UI goes here</Text>
        )}
      </Step.Section>

      <Step.Footer>
        <Step.Footer.Previous
          onClick={() => goPrev()}
          isDisabled={isFirstStep}
        />
        <Step.Footer.Continue
          onClick={() => goNext()}
          isDisabled={isLastStep}
        />
      </Step.Footer>
    </>
  );
};

const EmailAlreadyVerified = ({ emailAddress }: { emailAddress: string }): JSX.Element => {
  const { t } = useLocalizations();

  return (
    <Col sx={t => ({ gap: t.space.$3, alignItems: 'center' })}>
      <Icon
        icon={DuotoneAtSymbol}
        sx={t => ({
          width: t.sizes.$8,
          height: t.sizes.$8,
          color: t.colors.$neutralAlpha600,
        })}
      />
      <Col sx={t => ({ gap: t.space.$1, textAlign: 'center', maxWidth: t.sizes.$66 })}>
        <Heading
          textVariant='h1'
          sx={t => ({ fontSize: t.fontSizes.$lg, fontWeight: t.fontWeights.$bold })}
          localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.emailCode.verified.title')}
        />
        <Col sx={t => ({ gap: t.space.$1, flex: 1 })}>
          <Text
            as='p'
            variant='body'
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.emailCode.verified.subtitle')}
          />
        </Col>
        <Input
          type='email'
          value={emailAddress}
          readOnly
          aria-label={t(localizationKeys('configureSSO.verifyEmailDomainStep.emailCode.verified.inputLabel'))}
          sx={t => ({ width: '100%', maxWidth: t.sizes.$66, backgroundColor: t.colors.$neutralAlpha50 })}
        />
      </Col>
    </Col>
  );
};
