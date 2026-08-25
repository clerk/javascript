import { iconImageUrl } from '@clerk/shared/constants';
import React, { useRef, useState } from 'react';

import { useFieldOTP } from '@/ui/elements/CodeControl';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer, FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { Select, SelectButton, SelectOptionList } from '@/ui/elements/Select';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useWizard, Wizard } from '../../../common';
import { Box, Button, CheckboxInput, Col, descriptors, Flex, RadioInput, Span, Text } from '../../../customizables';
import { common } from '../../../styledSystem';
import { EnrollmentOptions } from './EnrollmentOptions';
import type { ProtoEnrollment, ProtoNonDirectoryFallback, ProtoProvider } from './prototypeState';
import {
  APP_SESSION_LIFETIME_HOURS,
  ENROLLMENT_LABELS,
  formatSessionLifetime,
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
 * The self-serve add-domain flow, restructured to the dashboard wizard's
 * question shape (Aug 24 direction): domain → sign-in (with two-step as a
 * checkbox under default sign-in and re-verification as the step's second
 * question) → enrollment → review. The C2-specific difference is proof:
 * affiliation (email round-trip) is folded into the domain step, and
 * choosing SSO leaves the rule "Setting up" — ownership verification and
 * the IdP handshake continue from the row afterwards.
 */
export const AddDomainAccessForm = withCardStateProvider(({ onClose }: AddDomainAccessFormProps) => {
  const { domains, dispatch } = useAccessOnboarding();
  const wizard = useWizard();
  const [domainName, setDomainName] = useState('');
  const [signInMode, setSignInMode] = useState<'default' | 'sso'>('default');
  const [provider, setProvider] = useState<ProtoProvider>('saml_okta');
  const [twoStepRequired, setTwoStepRequired] = useState(false);
  const [sessionLifetimeHours, setSessionLifetimeHours] = useState(APP_SESSION_LIFETIME_HOURS);
  const [enrollment, setEnrollment] = useState<ProtoEnrollment>('request_access');
  const [nonDirectoryFallback] = useState<ProtoNonDirectoryFallback>('block');
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

  const domain = domains.find(d => d.name === domainName);

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

  const onPickSignIn = (mode: 'default' | 'sso') => {
    setSignInMode(mode);
    if (mode === 'sso') {
      setTwoStepRequired(false);
    }
    /*
      The recommendation tracks who is vouching (dashboard parity): a value
      equal to the old recommendation is a default, not a decision, so it
      follows the flip.
    */
    if (mode === 'sso' && enrollment === 'request_access') {
      setEnrollment('join_automatically');
    }
    if (mode === 'default' && (enrollment === 'join_automatically' || enrollment === 'directory_synced')) {
      setEnrollment('request_access');
    }
  };

  const onSubmitSignIn = () => {
    /*
      The recommended enrollment may still be proof-locked (join
      automatically needs ownership, which a just-added domain lacks) —
      the enrollment step shows it locked with the reason and preselects
      the best unlocked option.
    */
    if (domain && recommendedEnrollmentFor(signInMode) === 'join_automatically' && domain.ownership === 'unverified') {
      setEnrollment('request_access');
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
        enrollment,
        twoStepRequired,
        sessionLifetimeHours,
        nonDirectoryFallback,
        ssoProvider: signInMode === 'sso' ? provider : null,
      });
      setIsSaving(false);
      onClose();
    });
  };

  const verifiedDomain = domain ? { ...domain, affiliationVerified: true } : undefined;

  const signInAnswer =
    signInMode === 'sso'
      ? PROVIDER_LABELS[provider].label
      : twoStepRequired
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
        <Col sx={t => ({ gap: t.space.$2 })}>
          <SignInOptionCard
            label='Default sign-in'
            description='Whatever this application already offers: email, password, social providers.'
            isChecked={signInMode === 'default'}
            onSelect={() => onPickSignIn('default')}
          >
            {signInMode === 'default' ? (
              <Box
                as='label'
                sx={t => ({
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: t.space.$2,
                  marginTop: t.space.$2,
                  cursor: 'pointer',
                })}
              >
                <CheckboxInput
                  checked={twoStepRequired}
                  onChange={() => setTwoStepRequired(current => !current)}
                  sx={t => ({ marginTop: t.space.$0x5 })}
                />
                <Col sx={t => ({ gap: t.space.$0x5 })}>
                  <Text
                    as='span'
                    variant='subtitle'
                  >
                    Require two-step verification
                  </Text>
                  <Text
                    as='span'
                    colorScheme='secondary'
                    sx={t => ({ fontSize: t.fontSizes.$sm })}
                  >
                    Everyone must also verify with a second factor.
                  </Text>
                </Col>
              </Box>
            ) : null}
          </SignInOptionCard>

          <SignInOptionCard
            label='Single sign-on'
            description='An identity provider signs people in. You will verify domain ownership and finish the connection after this rule is saved.'
            isChecked={signInMode === 'sso'}
            onSelect={() => onPickSignIn('sso')}
          >
            {signInMode === 'sso' ? (
              <Col sx={t => ({ gap: t.space.$1, marginTop: t.space.$2 })}>
                {(Object.keys(PROVIDER_LABELS) as ProtoProvider[]).map(key => (
                  <Box
                    key={key}
                    as='label'
                    sx={t => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.space.$2,
                      cursor: 'pointer',
                    })}
                  >
                    <RadioInput
                      name='protoSsoProvider'
                      value={key}
                      checked={provider === key}
                      onChange={() => setProvider(key)}
                    />
                    <img
                      alt={PROVIDER_LABELS[key].label}
                      src={iconImageUrl(PROVIDER_LABELS[key].iconId)}
                      width={16}
                      height={16}
                    />
                    <Text as='span'>{PROVIDER_LABELS[key].label}</Text>
                  </Box>
                ))}
              </Col>
            ) : null}
          </SignInOptionCard>
        </Col>

        <Col sx={t => ({ gap: t.space.$1, marginTop: t.space.$3 })}>
          <Text
            as='span'
            variant='subtitle'
          >
            Re-verification
          </Text>
          <Text
            as='span'
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
            value={enrollment}
            onChange={setEnrollment}
            signInMode={signInMode}
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
            value={ENROLLMENT_LABELS[enrollment].label}
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

const SignInOptionCard = ({
  label,
  description,
  isChecked,
  onSelect,
  children,
}: {
  label: string;
  description: string;
  isChecked: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
}) => (
  <Box
    isActive={isChecked}
    sx={t => ({
      padding: t.space.$3,
      ...common.borderVariants(t).normal,
      '&:has(input:checked)': {
        backgroundColor: t.colors.$neutralAlpha50,
      },
    })}
  >
    <Box
      as='label'
      sx={t => ({
        display: 'flex',
        alignItems: 'flex-start',
        gap: t.space.$3,
        cursor: 'pointer',
      })}
    >
      <RadioInput
        name='protoSignIn'
        value={label}
        checked={isChecked}
        onChange={onSelect}
        sx={t => ({ marginTop: t.space.$0x5 })}
      />
      <Col sx={t => ({ gap: t.space.$0x5, minWidth: 0 })}>
        <Text
          as='span'
          variant='subtitle'
        >
          {label}
        </Text>
        <Text
          as='span'
          colorScheme='secondary'
          sx={t => ({ fontSize: t.fontSizes.$sm })}
        >
          {description}
        </Text>
      </Col>
    </Box>
    {children ? <Box sx={t => ({ paddingInlineStart: t.space.$7 })}>{children}</Box> : null}
  </Box>
);

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
