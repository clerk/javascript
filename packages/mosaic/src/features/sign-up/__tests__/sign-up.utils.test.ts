import { describe, expect, it } from 'vitest';

import { signUpMessages } from '../sign-up.messages';
import type { SignUpDetails, SignUpStep } from '../sign-up.types';
import type { SignUpStepKey } from '../sign-up.utils';
import {
  legalConsentLabel,
  signUpCodeCopy,
  signUpCodeIdentity,
  signUpCodeSecondaryAction,
  signUpDetailsHeading,
  signUpFieldNames,
  signUpStepIds,
  signUpStepKey,
} from '../sign-up.utils';

const provider = { id: 'whatsapp', name: 'WhatsApp', iconUrl: 'https://img.clerk.com/static/whatsapp.svg' };

const stepsByKey: Record<SignUpStepKey, SignUpStep> = {
  'details:start': { kind: 'details', purpose: 'start', fields: { emailAddress: { required: true } } },
  'details:continue': { kind: 'details', purpose: 'continue', fields: { username: { required: true } } },
  'alternative-phone': { kind: 'alternative-phone', channel: provider },
  'code:verify-email': { kind: 'code', purpose: 'verify-email', identifier: 'new@acme.com' },
  'code:verify-phone': { kind: 'code', purpose: 'verify-phone', identifier: '+15555550123' },
  'choice:enterprise-connections': { kind: 'choice', purpose: 'enterprise-connections', options: [] },
  'choice:wallets': { kind: 'choice', purpose: 'wallets', options: [] },
  'notice:verify-email-link': { kind: 'notice', purpose: 'verify-email-link', identifier: 'new@acme.com' },
  'notice:email-link-status': { kind: 'notice', purpose: 'email-link-status', status: 'expired' },
  'notice:restricted': { kind: 'notice', purpose: 'restricted' },
  'notice:waitlist': { kind: 'notice', purpose: 'waitlist' },
  'notice:loading': { kind: 'notice', purpose: 'loading' },
  'notice:start-over': { kind: 'notice', purpose: 'start-over' },
  'notice:protect-check': { kind: 'notice', purpose: 'protect-check', challenge: false },
  'notice:action-blocked': { kind: 'notice', purpose: 'action-blocked' },
};

describe('signUpStepKey', () => {
  it('keys each step by its kind and purpose', () => {
    const steps = Object.entries(stepsByKey);

    expect(steps.map(([, step]) => signUpStepKey(step))).toEqual(steps.map(([key]) => key));
  });

  it('gives every step a key the view lists in a flow step, and lists no key a step cannot produce', () => {
    const listed = Object.values(signUpStepIds).flat();
    const produced = Object.values(stepsByKey).map(step => signUpStepKey(step));

    expect([...listed].sort()).toEqual([...produced].sort());
  });
});

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
  const email = { kind: 'code', purpose: 'verify-email', identifier: 'new@acme.com' } as const;
  const phone = { kind: 'code', purpose: 'verify-phone', identifier: '+15555550123' } as const;
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
