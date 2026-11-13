import { describe, expect, it } from 'vitest';

import { signUpMessages } from '../sign-up.messages';
import type { SignUpDetails, SignUpStep } from '../sign-up.types';
import type { SignUpStepKey } from '../sign-up.utils';
import {
  legalConsentLabel,
  signUpCodeStep,
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

describe('signUpCodeStep', () => {
  it('sends an email code for the email and a phone code, with its provider, for the phone', () => {
    expect(signUpCodeStep({ kind: 'code', purpose: 'verify-email', identifier: 'new@acme.com' }).channel).toBe('email');
    expect(
      signUpCodeStep({ kind: 'code', purpose: 'verify-phone', identifier: '+15555550123', provider: 'WhatsApp' }),
    ).toMatchObject({ channel: 'phone', provider: 'WhatsApp' });
  });
});
