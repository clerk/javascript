import type { SignUpField } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { signUpMessages } from '../sign-up.messages';
import type { SignUpDetails } from '../sign-up.types';
import {
  continueCanSatisfy,
  continueFields,
  legalConsentLabel,
  missesEitherIdentifier,
  signUpCodeCopy,
  signUpCodeIdentity,
  signUpCodeSecondaryAction,
  signUpDetailsHeading,
  signUpFieldNames,
} from '../sign-up.utils';

describe('signUpDetailsHeading', () => {
  const heading = (step: SignUpDetails) => signUpDetailsHeading(step, signUpMessages);

  it('welcomes a new sign-up on start and asks for what is missing on continue', () => {
    expect(heading({ purpose: 'start', fields: { emailAddress: { required: true } } }).title).toBe(
      'Create your account',
    );
    expect(heading({ purpose: 'continue', fields: { username: { required: true } } }).title).toBe(
      'Fill in missing fields',
    );
  });

  it('titles the step for consent when consent is all that is missing', () => {
    expect(heading({ purpose: 'continue', fields: {}, legalConsent: {} }).title).toBe('Legal consent');
    expect(heading({ purpose: 'start', fields: {} }).title).toBe('Create your account');
    expect(heading({ fields: { password: { required: true } }, legalConsent: {} }).title).toBe('Create your account');
  });
});

describe('signUpFieldNames', () => {
  it('lists the fields the sign-up asks for in the order the form shows them', () => {
    expect(
      signUpFieldNames({
        password: { required: true },
        username: { required: false },
        firstName: { required: true },
        phoneNumber: { required: false },
      }),
    ).toEqual(['firstName', 'username', 'phoneNumber', 'password']);
    expect(signUpFieldNames({})).toEqual([]);
  });
});

describe('legalConsentLabel', () => {
  const m = signUpMessages;

  it('names only the pages the instance links to', () => {
    expect(legalConsentLabel({ termsUrl: 'https://acme.com/terms' }, m)).toBe(m.legalConsent.termsOnly);
    expect(legalConsentLabel({ privacyPolicyUrl: 'https://acme.com/privacy' }, m)).toBe(m.legalConsent.privacyOnly);
    expect(
      legalConsentLabel({ termsUrl: 'https://acme.com/terms', privacyPolicyUrl: 'https://acme.com/privacy' }, m),
    ).toBe(m.legalConsent.termsAndPrivacy);
  });
});

describe('code step copy', () => {
  const m = signUpMessages;
  const onCancel = () => undefined;
  const email = { purpose: 'verify-email', identifier: 'new@acme.com' } as const;
  const phone = { purpose: 'verify-phone', identifier: '+15555550123' } as const;
  const whatsApp = { ...phone, provider: 'WhatsApp' } as const;

  it('asks for the email code and lets the address be edited or another method be used', () => {
    expect(signUpCodeCopy(email, m).title).toBe('Verify your email');
    expect(signUpCodeIdentity(email, m)).toEqual({ identifier: 'new@acme.com', editLabel: 'Edit email address' });
    expect(signUpCodeSecondaryAction(email, m, onCancel)).toEqual({ label: 'Use another method', onClick: onCancel });
  });

  it('formats a phone being verified and offers no other method', () => {
    expect(signUpCodeCopy(phone, m).title).toBe('Verify your phone');
    expect(signUpCodeIdentity(phone, m)).toEqual({ identifier: '+1 (555) 555-0123', editLabel: 'Edit phone number' });
    expect(signUpCodeSecondaryAction(phone, m, onCancel).onClick).toBeUndefined();
  });

  it('names the alternative phone channel and offers SMS instead', () => {
    expect(signUpCodeCopy(whatsApp, m)).toMatchObject({
      title: 'Verify your WhatsApp',
      description: 'Enter the verification code sent to your WhatsApp',
    });
    expect(signUpCodeSecondaryAction(whatsApp, m, onCancel)).toEqual({
      label: 'Send code via SMS instead',
      onClick: onCancel,
    });
  });
});

describe('continue screen rules', () => {
  const required = { required: true };
  const lists = (missingFields: SignUpField[], optionalFields: SignUpField[] = []) => ({
    missingFields,
    optionalFields,
  });

  it.each([
    {
      name: 'asks for each missing required field',
      signUp: lists(['username', 'password']),
      asks: { username: required, password: required },
      asksOnPhone: { username: required, password: required },
      canSwitch: false,
      canSatisfy: true,
    },
    {
      name: 'asks for an email or a phone, not a username, when every identifier is optional and none was given',
      signUp: lists(['email_address', 'phone_number', 'username'], ['email_address', 'phone_number', 'username']),
      asks: { emailAddress: required },
      asksOnPhone: { phoneNumber: required },
      canSwitch: true,
      canSatisfy: true,
    },
    {
      name: 'asks for an email or a phone beside the other missing fields on an instance that combines them',
      signUp: lists(['email_address_or_phone_number', 'password']),
      asks: { password: required, emailAddress: required },
      asksOnPhone: { password: required, phoneNumber: required },
      canSwitch: true,
      canSatisfy: true,
    },
    {
      name: 'asks for a username when it is the only identifier to choose',
      signUp: lists(['username'], ['username']),
      asks: { username: required },
      asksOnPhone: { username: required },
      canSwitch: false,
      canSatisfy: true,
    },
    {
      name: 'asks for the email alone when the choice is an email or a username',
      signUp: lists(['email_address', 'username'], ['email_address', 'username']),
      asks: { emailAddress: required },
      asksOnPhone: { emailAddress: required },
      canSwitch: false,
      canSatisfy: true,
    },
    {
      name: 'asks for the identifier when an optional provider is listed beside it',
      signUp: lists(['email_address', 'oauth_google'], ['email_address', 'oauth_google']),
      asks: { emailAddress: required },
      asksOnPhone: { emailAddress: required },
      canSwitch: false,
      canSatisfy: true,
    },
    {
      name: 'asks for no field when only legal consent is missing',
      signUp: lists(['legal_accepted']),
      asks: {},
      asksOnPhone: {},
      canSwitch: false,
      canSatisfy: true,
    },
    {
      name: 'cannot finish a sign-up that needs a required provider',
      signUp: lists(['username', 'oauth_google']),
      asks: { username: required },
      asksOnPhone: { username: required },
      canSwitch: false,
      canSatisfy: false,
    },
    {
      name: 'cannot finish a sign-up whose only identifier is an optional provider',
      signUp: lists(['oauth_google'], ['oauth_google']),
      asks: {},
      asksOnPhone: {},
      canSwitch: false,
      canSatisfy: false,
    },
  ])('$name', ({ signUp, asks, asksOnPhone, canSwitch, canSatisfy }) => {
    expect(continueFields(signUp, 'emailAddress')).toEqual(asks);
    expect(continueFields(signUp, 'phoneNumber')).toEqual(asksOnPhone);
    expect(missesEitherIdentifier(signUp)).toBe(canSwitch);
    expect(continueCanSatisfy(signUp)).toBe(canSatisfy);
  });
});
