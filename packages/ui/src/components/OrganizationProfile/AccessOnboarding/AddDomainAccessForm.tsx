import React, { useRef, useState } from 'react';

import { useFieldOTP } from '@/ui/elements/CodeControl';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer, FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { Select, SelectButton, SelectOptionList } from '@/ui/elements/Select';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useWizard, Wizard } from '../../../common';
import { Button, Col, descriptors, Flex, Span, Text } from '../../../customizables';
import { EnrollmentOptions } from './EnrollmentOptions';
import type { ProtoEnrollment, ProtoProvider } from './prototypeState';
import {
  APP_SESSION_LIFETIME_HOURS,
  ENROLLMENT_LABELS,
  enrollmentChoicesFor,
  formatSessionLifetime,
  protoFieldId,
  protoKey,
  PROVIDER_LABELS,
  recommendedEnrollmentFor,
  SESSION_LIFETIME_OPTIONS,
  simulateRequest,
  useAccessOnboarding,
} from './prototypeState';

const DOMAIN_REGEX = /^[a-z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,}$/i;

type AddDomainAccessFormProps = {
  onClose: () => void;
};

/*
 * The self-serve add-domain flow in the dashboard wizard's question shape,
 * built from the house form controls (VerifiedDomainForm's patterns):
 * domain → affiliation proof → sign-in (two-step as a checkbox under
 * default, re-verification as the step's second question) → enrollment →
 * review. The wizard captures decisions only — ownership verification,
 * the IdP handshake, and SCIM live on the saved row's setup checklist.
 */
export const AddDomainAccessForm = withCardStateProvider(({ onClose }: AddDomainAccessFormProps) => {
  const { domains, dispatch } = useAccessOnboarding();
  const wizard = useWizard();
  const [domainName, setDomainName] = useState('');
  const [sessionLifetimeHours, setSessionLifetimeHours] = useState(APP_SESSION_LIFETIME_HOURS);
  const [isSaving, setIsSaving] = useState(false);
  const emailRef = useRef('');
  const lifetimeButtonRef = useRef<HTMLButtonElement>(null);

  const nameField = useFormControl('name', '', {
    type: 'text',
    label: protoKey('Domain'),
    placeholder: protoKey('acme.com'),
    isRequired: true,
  });

  const emailField = useFormControl('affiliationEmailAddress', '', {
    type: 'text',
    label: protoKey('Email address'),
    placeholder: protoKey('you'),
    infoText: protoKey('An email address at this domain, used to confirm you work there.'),
    isRequired: true,
  });

  const signInField = useFormControl(protoFieldId('signInMode'), 'default', {
    type: 'radio',
    radioOptions: [
      {
        value: 'default',
        label: 'Default sign-in',
        description: 'Whatever this application already offers: email, password, social providers.',
      },
      {
        value: 'sso',
        label: 'Single sign-on',
        description: 'An identity provider signs people in. You will verify ownership and connect it after saving.',
      },
    ],
  });

  const twoStepField = useFormControl(protoFieldId('twoStepRequired'), '', {
    type: 'checkbox',
    label: protoKey('Require two-step verification'),
  });

  const providerField = useFormControl(protoFieldId('ssoProvider'), 'saml_okta', {
    type: 'radio',
    radioOptions: (Object.keys(PROVIDER_LABELS) as ProtoProvider[]).map(key => ({
      value: key,
      label: PROVIDER_LABELS[key].label,
    })),
  });

  const enrollmentField = useFormControl(protoFieldId('enrollment'), 'request_access', {
    type: 'radio',
    radioOptions: [],
  });

  const domain = domains.find(d => d.name === domainName);
  const signInMode = signInField.value === 'sso' ? ('sso' as const) : ('default' as const);

  const otp = useFieldOTP({
    onCodeEntryFinished: (_code, resolve) => {
      // Prototype: any code verifies after a beat.
      setTimeout(() => {
        void resolve().then(() => {
          if (domain) {
            dispatch({ type: 'markAffiliationVerified', id: domain.id });
          }
          wizard.nextStep();
        });
      }, 450);
    },
    onResendCodeClicked: () => undefined,
  });

  const canSubmitName = DOMAIN_REGEX.test(nameField.value.trim());

  const onSubmitName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitName) {
      return;
    }
    const name = nameField.value.trim().toLowerCase();
    return simulateRequest().then(() => {
      dispatch({ type: 'addDomain', name });
      setDomainName(name);
      wizard.nextStep();
    });
  };

  const onSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    emailRef.current = `${emailField.value}@${domainName}`;
    return simulateRequest().then(wizard.nextStep);
  };

  const verifiedDomain = domain ? { ...domain, affiliationVerified: true } : undefined;

  const onSubmitSignIn = () => {
    if (verifiedDomain) {
      const { options } = enrollmentChoicesFor(verifiedDomain, signInMode);
      const recommended = recommendedEnrollmentFor(signInMode);
      const preferred = options.some(option => option.value === recommended) ? recommended : 'request_access';
      if (!options.some(option => option.value === enrollmentField.value)) {
        enrollmentField.setValue(preferred);
      }
    }
    wizard.nextStep();
  };

  const onSave = () => {
    if (!domain) {
      return;
    }
    setIsSaving(true);
    void simulateRequest().then(() => {
      dispatch({
        type: 'configureRule',
        id: domain.id,
        enrollment: enrollmentField.value as ProtoEnrollment,
        twoStepRequired: Boolean(twoStepField.checked),
        sessionLifetimeHours,
        nonDirectoryFallback: 'block',
        ssoProvider: signInMode === 'sso' ? (providerField.value as ProtoProvider) : null,
      });
      setIsSaving(false);
      onClose();
    });
  };

  const signInAnswer =
    signInMode === 'sso'
      ? PROVIDER_LABELS[providerField.value as ProtoProvider].label
      : twoStepField.checked
        ? 'Default sign-in with two-step verification'
        : 'Default sign-in';

  return (
    <Wizard {...wizard.props}>
      <FormContainer
        headerTitle={protoKey('Add a domain')}
        headerSubtitle={protoKey(
          'The email domain your team signs in with. You will confirm you work there in the next step.',
        )}
      >
        <Form.Root onSubmit={onSubmitName}>
          <Form.ControlRow elementId={nameField.id}>
            <Form.PlainInput
              {...nameField.props}
              autoFocus
              ignorePasswordManager
            />
          </Form.ControlRow>
          <FormButtons
            isDisabled={!canSubmitName}
            onReset={onClose}
          />
        </Form.Root>
      </FormContainer>

      <FormContainer
        headerTitle={protoKey('Verify the domain')}
        headerSubtitle={protoKey(`${domainName} needs to be verified via an email at that domain.`)}
      >
        <Form.Root onSubmit={onSubmitEmail}>
          <Form.ControlRow elementId={emailField.id}>
            <Form.InputGroup
              {...emailField.props}
              autoFocus
              groupSuffix={`@${domainName}`}
              ignorePasswordManager
            />
          </Form.ControlRow>
          <FormButtons
            isDisabled={emailField.value.trim() === ''}
            onReset={onClose}
          />
        </Form.Root>
      </FormContainer>

      <FormContainer
        headerTitle={protoKey('Verify the domain')}
        headerSubtitle={protoKey(`Enter the code sent to ${emailRef.current || 'your email address'}.`)}
      >
        <Form.OTPInput
          {...otp}
          label={protoKey('Verification code')}
          description={protoKey('Any 6-digit code works in this prototype.')}
          resendButton={protoKey("Didn't receive a code? Resend")}
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
            localizationKey={protoKey('Back')}
          />
        </FormButtonContainer>
      </FormContainer>

      <FormContainer
        headerTitle={protoKey('How do people sign in?')}
        headerSubtitle={protoKey(`How people with an @${domainName} email sign in, and how often they re-verify.`)}
      >
        <Col sx={t => ({ gap: t.space.$3 })}>
          <Form.RadioGroup {...signInField.props} />
          {signInMode === 'default' ? (
            <Form.Checkbox
              {...twoStepField.props}
              description={protoKey('Everyone must also verify with a second factor.')}
            />
          ) : (
            <Col sx={t => ({ gap: t.space.$1 })}>
              <Text
                colorScheme='secondary'
                sx={t => ({ fontSize: t.fontSizes.$sm })}
              >
                Which identity provider signs people in.
              </Text>
              <Form.RadioGroup {...providerField.props} />
            </Col>
          )}
          <Col sx={t => ({ gap: t.space.$1 })}>
            <Text variant='subtitle'>Re-verification</Text>
            <Text
              colorScheme='secondary'
              sx={t => ({ fontSize: t.fontSizes.$sm })}
            >
              How often people must verify again to keep their session.
            </Text>
            <Select
              options={SESSION_LIFETIME_OPTIONS.map(hours => ({
                value: String(hours),
                label:
                  hours === APP_SESSION_LIFETIME_HOURS
                    ? `Every ${formatSessionLifetime(hours)} (application setting)`
                    : `Every ${formatSessionLifetime(hours)}`,
              }))}
              value={String(sessionLifetimeHours)}
              onChange={option => setSessionLifetimeHours(Number(option.value))}
              referenceElement={lifetimeButtonRef}
            >
              <SelectButton
                ref={lifetimeButtonRef}
                sx={t => ({ justifyContent: 'space-between', backgroundColor: t.colors.$colorBackground })}
              />
              <SelectOptionList />
            </Select>
          </Col>
        </Col>
        <FormButtonContainer>
          <Button
            block={false}
            onClick={onSubmitSignIn}
            localizationKey={protoKey('Continue')}
          />
          <Button
            block={false}
            variant='ghost'
            textVariant='buttonSmall'
            onClick={onClose}
            localizationKey={protoKey('Cancel')}
          />
        </FormButtonContainer>
      </FormContainer>

      <FormContainer
        headerTitle={protoKey('How do people become members?')}
        headerSubtitle={protoKey(`Who lets someone with an @${domainName} email in: the person or an admin.`)}
      >
        {verifiedDomain ? (
          <EnrollmentOptions
            domain={verifiedDomain}
            signInMode={signInMode}
            field={enrollmentField}
          />
        ) : null}
        <FormButtonContainer>
          <Button
            block={false}
            onClick={wizard.nextStep}
            localizationKey={protoKey('Continue')}
          />
          <Button
            block={false}
            variant='ghost'
            textVariant='buttonSmall'
            onClick={() => wizard.prevStep()}
            localizationKey={protoKey('Back')}
          />
        </FormButtonContainer>
      </FormContainer>

      <FormContainer
        headerTitle={protoKey('Review')}
        headerSubtitle={protoKey(`Everything @${domainName} gets, and what still needs setup.`)}
      >
        <Col sx={t => ({ gap: t.space.$2 })}>
          <ReviewRow
            label='Domain'
            value={domainName}
          />
          <ReviewRow
            label='Sign-in'
            value={signInAnswer}
            hint={
              signInMode === 'sso' ? 'Setting up until ownership is verified and the provider connects.' : undefined
            }
          />
          <ReviewRow
            label='Re-verification'
            value={`Every ${formatSessionLifetime(sessionLifetimeHours)}`}
            hint={
              sessionLifetimeHours !== APP_SESSION_LIFETIME_HOURS
                ? `Application setting: every ${formatSessionLifetime(APP_SESSION_LIFETIME_HOURS)}`
                : undefined
            }
          />
          <ReviewRow
            label='Enrollment'
            value={ENROLLMENT_LABELS[enrollmentField.value as ProtoEnrollment].label}
          />
        </Col>
        <Text
          colorScheme='secondary'
          sx={t => ({ fontSize: t.fontSizes.$sm, marginTop: t.space.$2 })}
        >
          Set on the previous steps. Go back to change one, or adjust any of it on the domain afterwards.
        </Text>
        <FormButtonContainer>
          <Button
            block={false}
            isLoading={isSaving}
            onClick={onSave}
            localizationKey={protoKey('Add rule')}
          />
          <Button
            block={false}
            variant='ghost'
            textVariant='buttonSmall'
            onClick={() => wizard.prevStep()}
            localizationKey={protoKey('Back')}
          />
        </FormButtonContainer>
      </FormContainer>
    </Wizard>
  );
});

const ReviewRow = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <Flex
    justify='between'
    align='start'
    sx={t => ({ gap: t.space.$4 })}
  >
    <Text
      as='span'
      colorScheme='secondary'
      sx={t => ({ fontSize: t.fontSizes.$sm })}
    >
      {label}
    </Text>
    <Col sx={{ alignItems: 'flex-end', minWidth: 0 }}>
      <Span sx={t => ({ fontSize: t.fontSizes.$sm, fontWeight: t.fontWeights.$medium, textAlign: 'end' })}>
        {value}
      </Span>
      {hint ? (
        <Text
          as='span'
          colorScheme='secondary'
          sx={t => ({ fontSize: t.fontSizes.$xs, textAlign: 'end' })}
        >
          {hint}
        </Text>
      ) : null}
    </Col>
  </Flex>
);
