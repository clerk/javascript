import { useReverification, useSession, useUser } from '@clerk/shared/react';
import type { EmailAddressResource } from '@clerk/shared/types';
import { useCallback, useEffect, useRef, useState } from 'react';

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

export const VerifyDomainStep = (): JSX.Element => {
  const { user } = useUser();
  const { session } = useSession();
  const { enterpriseConnection } = useConfigureSSO();
  const { t } = useLocalizations();
  const { goNext: outerGoNext } = useWizard();

  const emailToVerify =
    user?.primaryEmailAddress ?? user?.emailAddresses?.find(e => e.verification.status !== 'verified');
  const isVerified = emailToVerify?.verification.status === 'verified';

  // The user's domain is already wired to an enterprise connection that
  // doesn't belong to the org they're currently configuring
  const activeOrganizationId = session?.lastActiveOrganizationId ?? null;
  const isDomainTakenByOtherOrg = Boolean(
    isVerified && enterpriseConnection && enterpriseConnection.organizationId !== activeOrganizationId,
  );

  const wasVerifiedOnMountRef = useRef(isVerified);

  if (isDomainTakenByOtherOrg) {
    const conflictingDomain = enterpriseConnection?.domains[0] as string;

    return (
      <Flow.Part part='verifyDomain'>
        <Step>
          <Col
            justify='center'
            align='center'
            sx={t => ({ gap: t.space.$3, alignItems: 'center', flex: 1 })}
          >
            <Icon
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
                textVariant='h1'
                sx={t => ({ fontSize: t.fontSizes.$lg, textWrap: 'balance' })}
                localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.domainTaken.title', {
                  domain: conflictingDomain,
                })}
              />
              <Text
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
            <Step.Footer.Continue onClick={() => outerGoNext()} />
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
        <Wizard>
          <Step.Header
            title={t(localizationKeys('configureSSO.verifyEmailDomainStep.title'))}
            description={t(localizationKeys('configureSSO.verifyEmailDomainStep.subtitle'))}
          >
            <InnerStepCounter />
          </Step.Header>

          <Step.Body>
            <Wizard.Step id='provide-email'>
              <ProvideEmailStep />
            </Wizard.Step>

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

const isEmail = (str: string) => /^\S+@\S+\.\S+$/.test(str);

export const ProvideEmailStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep } = useWizard();
  const { user } = useUser();
  const card = useCardState();
  const { t } = useLocalizations();
  const [email, setEmail] = useState('');
  const createEmailAddress = useReverification((value: string) => user?.createEmailAddress({ email: value }));

  const canSubmit = isEmail(email) && !card.isLoading;
  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      return;
    }

    card.setError(undefined);
    card.setLoading();

    try {
      await createEmailAddress(email);
      await goNext();
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  }, [canSubmit, email, createEmailAddress, card, goNext]);

  return (
    <>
      <Step.Section
        sx={{ flex: 1 }}
        align='center'
        justify='center'
      >
        <Form.Root
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
            icon={DuotoneAtSymbol}
            sx={t => ({
              width: t.sizes.$8,
              height: t.sizes.$8,
              color: t.colors.$neutralAlpha600,
            })}
          />
          <Col gap={1}>
            <Heading
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
              as='p'
              variant='body'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.addEmailAddress.formSubtitle')}
            />
            <Input
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
          isDisabled={isFirstStep}
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
  emailToVerify,
}: {
  emailToVerify?: EmailAddressResource;
}): JSX.Element | null => {
  const { user } = useUser();
  const { provider, createEnterpriseConnection } = useConfigureSSO();
  const card = useCardState();
  const { goNext, goPrev, isFirstStep } = useWizard();

  const isVerified = emailToVerify?.verification.status === 'verified';
  const isPrimary = emailToVerify?.id === user?.primaryEmailAddressId;

  const prepareEmailVerification = useReverification(() =>
    emailToVerify?.prepareVerification({ strategy: 'email_code' }),
  );
  const attemptEmailVerification = useReverification((code: string) => emailToVerify?.attemptVerification({ code }));
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
      if (emailToVerify && !isPrimary) {
        try {
          await setPrimaryEmailAddress(emailToVerify.id);
        } catch (err) {
          handleError(err as Error, [], card.setError);
          return;
        }
      }

      if (!provider) {
        void goNext();
        return;
      }

      try {
        await createEnterpriseConnection(provider);
      } catch (err) {
        handleError(err as Error, [], card.setError);
        return;
      }

      void goNext();
    },
  });

  useEffect(() => {
    if (emailToVerify && !isVerified) {
      void prepare();
    }
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
              textVariant='h1'
              sx={t => ({ fontSize: t.fontSizes.$sm })}
              localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.emailCode.formTitle')}
            />
            <Text
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
          isDisabled={isFirstStep}
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
      gap={3}
      sx={{ alignItems: 'center' }}
    >
      <Icon
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
          textVariant='h1'
          sx={t => ({ fontSize: t.fontSizes.$lg, fontWeight: t.fontWeights.$bold })}
          localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.emailCode.verified.title')}
        />
        <Col
          gap={3}
          sx={{ flex: 1 }}
        >
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
          sx={t => ({ backgroundColor: t.colors.$neutralAlpha50 })}
        />
      </Col>
    </Col>
  );
};
