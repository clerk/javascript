import React, { useRef, useState } from 'react';

import { useFieldOTP } from '@/ui/elements/CodeControl';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer, FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useWizard, Wizard } from '../../../common';
import { Button, descriptors } from '../../../customizables';
import { EnrollmentOptions } from './EnrollmentOptions';
import type { ProtoEnrollment } from './prototypeState';
import { protoKey, simulateRequest, useAccessOnboarding } from './prototypeState';

const DOMAIN_REGEX = /^[a-z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,}$/i;

type AddDomainAccessFormProps = {
  onClose: () => void;
};

/*
 * The self-serve add-domain flow: name the domain, prove affiliation with an
 * email round-trip, then pick enrollment from the options that proof unlocks.
 * All mutations are prototype-local; the OTP accepts any 6-digit code.
 */
export const AddDomainAccessForm = withCardStateProvider(({ onClose }: AddDomainAccessFormProps) => {
  const { domains, dispatch } = useAccessOnboarding();
  const wizard = useWizard();
  const [domainName, setDomainName] = useState('');
  const [enrollment, setEnrollment] = useState<ProtoEnrollment>('request_access');
  const [isSaving, setIsSaving] = useState(false);
  const emailRef = useRef('');

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

  const onSaveEnrollment = () => {
    if (!domain) {
      return;
    }
    setIsSaving(true);
    void simulateRequest().then(() => {
      dispatch({ type: 'setEnrollment', id: domain.id, enrollment });
      setIsSaving(false);
      onClose();
    });
  };

  const verifiedDomain = domain ? { ...domain, affiliationVerified: true } : undefined;

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
        headerTitle={protoKey('How do people join?')}
        headerSubtitle={protoKey(
          `${domainName} is verified. Choose how people with an email at this domain join the organization.`,
        )}
      >
        {verifiedDomain ? (
          <EnrollmentOptions
            domain={verifiedDomain}
            value={enrollment}
            onChange={setEnrollment}
          />
        ) : null}
        <FormButtonContainer>
          <Button
            block={false}
            isLoading={isSaving}
            onClick={onSaveEnrollment}
            localizationKey={protoKey('Save')}
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
    </Wizard>
  );
});
