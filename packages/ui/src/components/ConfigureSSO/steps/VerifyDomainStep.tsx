import { useReverification, useUser } from '@clerk/shared/react';
import type { EmailAddressResource } from '@clerk/shared/types';
import React, { useCallback, useEffect, useRef, useState } from 'react';

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
import { useFieldOTP } from '@/elements/CodeControl';
import { useCardState } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { DuotoneAtSymbol, ExclamationTriangle } from '@/icons';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSO } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { useWizard, Wizard } from '../elements/Wizard';
import { InnerStepCounter } from '../elements/Wizard/InnerStepCounter';
import { useWizardMachine } from '../elements/WizardMachineContext';

export const VerifyDomainStep = (): JSX.Element => {
  const { user } = useUser();
  const { enterpriseConnection, facts } = useConfigureSSO();
  const { t } = useLocalizations();
  // The top-level machine advances when this step completes. The inner
  // provide-email → verify-email flow keeps its own nested <Wizard>; only its
  // terminal step bubbles into the machine via the `onComplete` injected below.
  const { dispatch } = useWizardMachine();
  const completeStep = () => dispatch({ type: 'NEXT' });

  const emailToVerify =
    user?.primaryEmailAddress ?? user?.emailAddresses?.find(e => e.verification.status !== 'verified');
  const isVerified = emailToVerify?.verification.status === 'verified';

  // The user's domain is already wired to an enterprise connection that
  // doesn't belong to the org they're currently configuring
  const { isDomainTakenByOtherOrg } = facts;

  const wasVerifiedOnMountRef = useRef(isVerified);
  const emailAddressRef = useRef<EmailAddressResource | undefined>(emailToVerify);
  const preExistingEmailIdRef = useRef<string | undefined>(emailToVerify?.id);
  const initialInnerStepIdRef = useRef<'provide-email' | 'verify-email-address'>(
    emailToVerify ? 'verify-email-address' : 'provide-email',
  );

  if (isDomainTakenByOtherOrg) {
    const conflictingDomain = enterpriseConnection?.domains[0] as string;

    return (
      <Flow.Part part='verifyDomain'>
        <Step>
          <Col
            elementDescriptor={descriptors.configureSSOVerifyDomainErrorRoot}
            justify='center'
            align='center'
            sx={t => ({ gap: t.space.$3, alignItems: 'center', flex: 1 })}
          >
            <Icon
              elementDescriptor={descriptors.configureSSOVerifyDomainErrorIcon}
              icon={ExclamationTriangle}
              sx={t => ({
                width: t.sizes.$8,
                height: t.sizes.$8,
                color: t.colors.$neutralAlpha600,
              })}
            />
            <Col
              gap={1}
              sx={t => ({ textAlign: 'center', maxWidth: t.sizes.$94 })}
            >
              <Heading
                elementDescriptor={descriptors.configureSSOVerifyDomainErrorTitle}
                textVariant='h1'
                sx={t => ({ fontSize: t.fontSizes.$lg, textWrap: 'balance' })}
                localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.domainTaken.title', {
                  domain: conflictingDomain,
                })}
              />
              <Text
                elementDescriptor={descriptors.configureSSOVerifyDomainErrorSubtitle}
                as='p'
                variant='body'
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.domainTaken.subtitle')}
              />
            </Col>
          </Col>
        </Step>
      </Flow.Part>
    );
  }

  if (wasVerifiedOnMountRef.current && emailToVerify?.emailAddress) {
    return (
      <Flow.Part part='verifyDomain'>
        <Step
          elementDescriptor={descriptors.configureSSOStep}
          elementId={descriptors.configureSSOStep.setId('verify-domain')}
        >
          <Step.Header
            title={t(localizationKeys('configureSSO.verifyEmailDomainStep.title'))}
            description={t(localizationKeys('configureSSO.verifyEmailDomainStep.subtitle'))}
          />

          <Step.Body>
            <Step.Section
              sx={{ flex: 1 }}
              align='center'
              justify='center'
            >
              <EmailAlreadyVerified emailAddress={emailToVerify.emailAddress} />
            </Step.Section>
          </Step.Body>

          <Step.Footer>
            <Step.Footer.Continue onClick={completeStep} />
          </Step.Footer>
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
        <Wizard
          initialStepId={initialInnerStepIdRef.current}
          onComplete={completeStep}
        >
          <Step.Header
            title={t(localizationKeys('configureSSO.verifyEmailDomainStep.title'))}
            description={t(localizationKeys('configureSSO.verifyEmailDomainStep.subtitle'))}
          >
            <InnerStepCounter />
          </Step.Header>

          <Step.Body>
            <Wizard.Step id='provide-email'>
              <ProvideEmailStep
                emailAddressRef={emailAddressRef}
                preExistingEmailIdRef={preExistingEmailIdRef}
              />
            </Wizard.Step>

            <Wizard.Step id='verify-email-address'>
              <EnterVerificationCodeStep emailAddressRef={emailAddressRef} />
            </Wizard.Step>
          </Step.Body>
        </Wizard>
      </Step>
    </Flow.Part>
  );
};

const isEmail = (str: string) => /^\S+@\S+\.\S+$/.test(str);

type ProvideEmailStepProps = {
  emailAddressRef: React.MutableRefObject<EmailAddressResource | undefined>;
  preExistingEmailIdRef: React.MutableRefObject<string | undefined>;
};

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

export const ProvideEmailStep = ({ emailAddressRef, preExistingEmailIdRef }: ProvideEmailStepProps): JSX.Element => {
  const { goNext, goPrev } = useWizard();
  const { user } = useUser();
  const card = useCardState();
  const { t } = useLocalizations();
  // Pre-fill with whatever email the parent is currently tracking so navigating back from the
  // verify step shows the user what they previously submitted instead of an empty field.
  const [email, setEmail] = useState(() => emailAddressRef.current?.emailAddress ?? '');
  const createEmailAddress = useReverification((value: string) => user?.createEmailAddress({ email: value }));

  const canSubmit = isEmail(email) && !card.isLoading;
  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      return;
    }

    const current = emailAddressRef.current;
    const submittedEmail = email.trim();

    // Same email address as previously submitted, skip the flow
    if (current && normalizeEmail(current.emailAddress) === normalizeEmail(submittedEmail)) {
      await goNext();
      return;
    }

    card.setError(undefined);
    card.setLoading();

    try {
      const created = await createEmailAddress(submittedEmail);
      const previous = current;
      emailAddressRef.current = created ?? undefined;

      // Clean up the previous in-flight address so the user doesn't accumulate orphans on
      // their account
      if (previous && previous.id !== preExistingEmailIdRef.current && previous.id !== created?.id) {
        try {
          await previous.destroy();
        } catch {
          // A leftover unverified address is preferable to surfacing a cleanup
          // error after a successful create.
        }
      }

      await goNext();
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  }, [canSubmit, email, createEmailAddress, card, goNext, emailAddressRef, preExistingEmailIdRef]);

  return (
    <>
      <Step.Section
        sx={{ flex: 1 }}
        align='center'
        justify='center'
      >
        <Form.Root
          elementDescriptor={descriptors.configureSSOEmailVerificationForm}
          elementId={descriptors.configureSSOEmailVerificationForm.setId('provide')}
          onSubmit={handleSubmit}
          gap={3}
          sx={t => ({
            display: 'flex',
            maxWidth: t.sizes.$66,
            textAlign: 'center',
            flexDirection: 'column',
            alignItems: 'center',
          })}
        >
          <Icon
            elementDescriptor={descriptors.configureSSOEmailVerificationIcon}
            elementId={descriptors.configureSSOEmailVerificationIcon.setId('provide')}
            icon={DuotoneAtSymbol}
            sx={t => ({
              width: t.sizes.$8,
              height: t.sizes.$8,
              color: t.colors.$neutralAlpha600,
            })}
          />
          <Col gap={1}>
            <Heading
              elementDescriptor={descriptors.configureSSOEmailVerificationTitle}
              elementId={descriptors.configureSSOEmailVerificationTitle.setId('provide')}
              textVariant='h1'
              sx={t => ({ fontSize: t.fontSizes.$lg, fontWeight: t.fontWeights.$bold })}
              localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.addEmailAddress.formTitle')}
            />
          </Col>

          <Col
            gap={1}
            sx={{ width: '100%' }}
          >
            <Text
              elementDescriptor={descriptors.configureSSOEmailVerificationSubtitle}
              elementId={descriptors.configureSSOEmailVerificationSubtitle.setId('provide')}
              as='p'
              variant='body'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.addEmailAddress.formSubtitle')}
            />
            <Input
              elementDescriptor={descriptors.configureSSOEmailVerificationInput}
              elementId={descriptors.configureSSOEmailVerificationInput.setId('provide')}
              type='email'
              placeholder={t(localizationKeys('configureSSO.verifyEmailDomainStep.addEmailAddress.inputPlaceholder'))}
              aria-label={t(localizationKeys('configureSSO.verifyEmailDomainStep.addEmailAddress.inputLabel'))}
              value={email}
              onChange={e => setEmail(e.currentTarget.value)}
              hasError={Boolean(card.error)}
              isDisabled={card.isLoading}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
            {card.error ? (
              <Text
                elementDescriptor={descriptors.configureSSOEmailVerificationError}
                as='p'
                variant='body'
                sx={t => ({ color: t.colors.$danger500, fontSize: t.fontSizes.$sm, textAlign: 'start' })}
              >
                {card.error}
              </Text>
            ) : null}
          </Col>
        </Form.Root>
      </Step.Section>

      <Step.Footer>
        <Step.Footer.Previous
          onClick={() => goPrev()}
          isDisabled
        />
        <Step.Footer.Continue
          onClick={handleSubmit}
          isLoading={card.isLoading}
          isDisabled={!canSubmit || card.isLoading}
        />
      </Step.Footer>
    </>
  );
};

export const EnterVerificationCodeStep = ({
  emailAddressRef,
}: {
  emailAddressRef: React.MutableRefObject<EmailAddressResource | undefined>;
}): JSX.Element | null => {
  const { user } = useUser();
  const card = useCardState();
  const { goNext, goPrev } = useWizard();
  const primaryEmailAddress = user?.primaryEmailAddress;

  const emailToVerify = emailAddressRef.current;
  const isVerified = emailToVerify?.verification.status === 'verified';
  const isPrimary = emailToVerify?.id === user?.primaryEmailAddressId;

  const prepareEmailVerification = useReverification(() =>
    emailAddressRef.current?.prepareVerification({ strategy: 'email_code' }),
  );
  const attemptEmailVerification = useReverification((code: string) =>
    emailAddressRef.current?.attemptVerification({ code }),
  );
  const setPrimaryEmailAddress = useReverification((emailAddressId: string) =>
    user?.update({ primaryEmailAddressId: emailAddressId }),
  );

  const prepare = useCallback(
    () => prepareEmailVerification()?.catch(err => handleError(err, [], card.setError)),
    [prepareEmailVerification, card],
  );

  const otp = useFieldOTP({
    onCodeEntryFinished: (code, resolve, reject) => {
      attemptEmailVerification(code)
        .then(() => resolve())
        .catch(reject);
    },
    onResendCodeClicked: () => {
      void prepare();
    },
    onResolve: async () => {
      const target = emailAddressRef.current;
      if (target && !isPrimary) {
        try {
          await setPrimaryEmailAddress(target.id);
        } catch (err) {
          handleError(err as Error, [], card.setError);
          return;
        }
      }

      void goNext();
    },
  });

  // Send a code on mount, but only when the target address is not already verified
  useEffect(() => {
    if (emailToVerify && !isVerified) {
      void prepare();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!emailToVerify) {
    return null;
  }

  return (
    <>
      <Step.Section
        sx={{ flex: 1 }}
        align='center'
        justify='center'
      >
        <Col
          gap={4}
          sx={{ textAlign: 'center' }}
        >
          <Col gap={1}>
            <Heading
              elementDescriptor={descriptors.configureSSOEmailVerificationTitle}
              elementId={descriptors.configureSSOEmailVerificationTitle.setId('enter-code')}
              textVariant='h1'
              sx={t => ({ fontSize: t.fontSizes.$sm })}
              localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.emailCode.formTitle')}
            />
            <Text
              elementDescriptor={descriptors.configureSSOEmailVerificationSubtitle}
              elementId={descriptors.configureSSOEmailVerificationSubtitle.setId('enter-code')}
              as='p'
              variant='body'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.emailCode.formSubtitle', {
                identifier: emailToVerify.emailAddress,
              })}
            />
          </Col>
          <Form.OTPInput
            {...otp}
            resendButton={localizationKeys('configureSSO.verifyEmailDomainStep.emailCode.resendButton')}
          />
        </Col>
      </Step.Section>

      <Step.Footer>
        <Step.Footer.Previous
          onClick={() => goPrev()}
          isDisabled={!!primaryEmailAddress}
        />
        <Step.Footer.Continue
          onClick={() => goNext()}
          isLoading={otp.isLoading || card.isLoading}
          isDisabled={!isVerified}
        />
      </Step.Footer>
    </>
  );
};

const EmailAlreadyVerified = ({ emailAddress }: { emailAddress: string }): JSX.Element => {
  const { t } = useLocalizations();

  return (
    <Col
      elementDescriptor={descriptors.configureSSOEmailVerificationForm}
      elementId={descriptors.configureSSOEmailVerificationForm.setId('verified')}
      gap={3}
      sx={{ alignItems: 'center' }}
    >
      <Icon
        elementDescriptor={descriptors.configureSSOEmailVerificationIcon}
        elementId={descriptors.configureSSOEmailVerificationIcon.setId('verified')}
        icon={DuotoneAtSymbol}
        sx={t => ({
          width: t.sizes.$8,
          height: t.sizes.$8,
          color: t.colors.$neutralAlpha600,
        })}
      />
      <Col
        gap={2}
        sx={t => ({ textAlign: 'center', maxWidth: t.sizes.$66 })}
      >
        <Heading
          elementDescriptor={descriptors.configureSSOEmailVerificationTitle}
          elementId={descriptors.configureSSOEmailVerificationTitle.setId('verified')}
          textVariant='h1'
          sx={t => ({ fontSize: t.fontSizes.$lg, fontWeight: t.fontWeights.$bold })}
          localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.emailCode.verified.title')}
        />
        <Col
          gap={3}
          sx={{ flex: 1 }}
        >
          <Text
            elementDescriptor={descriptors.configureSSOEmailVerificationSubtitle}
            elementId={descriptors.configureSSOEmailVerificationSubtitle.setId('verified')}
            as='p'
            variant='body'
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.emailCode.verified.subtitle')}
          />
        </Col>
        <Input
          elementDescriptor={descriptors.configureSSOEmailVerificationInput}
          elementId={descriptors.configureSSOEmailVerificationInput.setId('verified')}
          type='email'
          value={emailAddress}
          readOnly
          aria-label={t(localizationKeys('configureSSO.verifyEmailDomainStep.emailCode.verified.inputLabel'))}
          sx={t => ({ backgroundColor: t.colors.$neutralAlpha50 })}
        />
      </Col>
    </Col>
  );
};
