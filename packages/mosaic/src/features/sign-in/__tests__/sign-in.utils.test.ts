import { describe, expect, it } from 'vitest';

import { signInMessages } from '../sign-in.messages';
import type { SignInStep } from '../sign-in.types';
import type { SignInStepKey } from '../sign-in.utils';
import {
  codeCopy,
  codeIdentity,
  codeNotice,
  codeSecondaryAction,
  emailLinkStatusCopy,
  httpsUrl,
  identifierFieldCopy,
  splitLastUsedProvider,
  startPrompt,
  stepIds,
  stepKey,
} from '../sign-in.utils';

const provider = { id: 'whatsapp', name: 'WhatsApp', iconUrl: 'https://img.clerk.com/static/whatsapp.svg' };

const stepsByKey: Record<SignInStepKey, SignInStep> = {
  identifier: { kind: 'identifier', field: 'email' },
  'identifier:channel': { kind: 'identifier', field: 'phone', channel: provider },
  'credential:password': { kind: 'credential', credential: 'password', identifier: 'jane@acme.com' },
  'credential:backup-code': { kind: 'credential', credential: 'backup-code', identifier: 'jane@acme.com' },
  'credential:passkey': { kind: 'credential', credential: 'passkey', identifier: 'jane@acme.com' },
  'code:first-factor': { kind: 'code', purpose: 'first-factor', channel: 'email', identifier: 'jane@acme.com' },
  'code:second-factor': { kind: 'code', purpose: 'second-factor', channel: 'totp' },
  'code:client-trust': { kind: 'code', purpose: 'client-trust', channel: 'email' },
  'code:sso-bypass': { kind: 'code', purpose: 'sso-bypass', channel: 'email' },
  'code:reset-password': { kind: 'code', purpose: 'reset-password', channel: 'email', identifier: 'jane@acme.com' },
  'code:verify-email': { kind: 'code', purpose: 'verify-email', channel: 'email', identifier: 'new@acme.com' },
  'code:verify-phone': { kind: 'code', purpose: 'verify-phone', channel: 'phone' },
  'choice:methods': { kind: 'choice', purpose: 'methods', options: [] },
  'choice:reset-methods': { kind: 'choice', purpose: 'reset-methods', options: [] },
  'choice:enterprise-connections': { kind: 'choice', purpose: 'enterprise-connections', options: [] },
  'choice:accounts': { kind: 'choice', purpose: 'accounts', options: [] },
  'choice:wallets': { kind: 'choice', purpose: 'wallets', options: [] },
  'notice:help': { kind: 'notice', purpose: 'help' },
  'notice:forgot-password': { kind: 'notice', purpose: 'forgot-password', identifier: 'jane@acme.com' },
  'notice:no-methods': { kind: 'notice', purpose: 'no-methods' },
  'notice:action-blocked': { kind: 'notice', purpose: 'action-blocked' },
  'notice:password-compromised': { kind: 'notice', purpose: 'password-compromised' },
  'notice:enterprise-sso': { kind: 'notice', purpose: 'enterprise-sso' },
  'notice:email-link': { kind: 'notice', purpose: 'email-link', identifier: 'jane@acme.com' },
  'notice:email-link-status': { kind: 'notice', purpose: 'email-link-status', status: 'expired', flow: 'sign-in' },
  'notice:verify-email-link': { kind: 'notice', purpose: 'verify-email-link', identifier: 'new@acme.com' },
  'notice:start-over': { kind: 'notice', purpose: 'start-over' },
  'notice:loading': { kind: 'notice', purpose: 'loading' },
  'notice:protect-check': { kind: 'notice', purpose: 'protect-check', challenge: false },
  'new-password:forgot': { kind: 'new-password', reason: 'forgot' },
  'new-password:required': { kind: 'new-password', reason: 'required' },
  'sign-up': { kind: 'sign-up', fields: {} },
};

describe('stepKey', () => {
  it('keys each step by its kind and the variant that changes its copy', () => {
    const steps = Object.entries(stepsByKey);

    expect(steps.map(([, step]) => stepKey(step))).toEqual(steps.map(([key]) => key));
  });

  it('gives every step a key the view lists in a flow step, and lists no key a step cannot produce', () => {
    const listed = Object.values(stepIds).flat();
    const produced = Object.values(stepsByKey).map(step => stepKey(step));

    expect([...listed].sort()).toEqual([...produced].sort());
  });
});

describe('emailLinkStatusCopy', () => {
  const m = signInMessages;

  it('tells the tab the link opened in to go back to the original tab', () => {
    expect(emailLinkStatusCopy({ status: 'signed-in', flow: 'sign-in' }, m)).toEqual({
      title: 'Successfully signed in',
      description: 'Return to original tab to continue',
    });
    expect(emailLinkStatusCopy({ status: 'transferable', flow: 'sign-in' }, m).title).toBe('Email verified');
  });

  it('tells the original tab to go to the newly opened one', () => {
    expect(emailLinkStatusCopy({ status: 'signed-in-other-tab', flow: 'sign-in' }, m)).toEqual({
      title: 'Signed in on other tab',
      description: 'Return to the newly opened tab to continue',
    });
  });

  it('uses the sign-up wording where it differs, and the sign-in wording elsewhere', () => {
    expect(emailLinkStatusCopy({ status: 'loading', flow: 'sign-up' }, m).title).toBe('Signing up...');
    expect(emailLinkStatusCopy({ status: 'signed-in', flow: 'sign-up' }, m).title).toBe('Successfully signed up');
    expect(emailLinkStatusCopy({ status: 'signed-in-other-tab', flow: 'sign-up' }, m)).toEqual({
      title: 'Successfully verified email',
      description: 'Return to previous tab to continue',
    });
    expect(emailLinkStatusCopy({ status: 'client-mismatch', flow: 'sign-up' }, m).description).toContain('sign-up');
    expect(emailLinkStatusCopy({ status: 'expired', flow: 'sign-up' }, m)).toEqual(
      emailLinkStatusCopy({ status: 'expired', flow: 'sign-in' }, m),
    );
  });

  it('names what went wrong with the link', () => {
    expect(emailLinkStatusCopy({ status: 'expired', flow: 'sign-in' }, m).title).toBe(
      'This verification link has expired',
    );
    expect(emailLinkStatusCopy({ status: 'failed', flow: 'sign-in' }, m).title).toBe(
      'This verification link is invalid',
    );
    expect(emailLinkStatusCopy({ status: 'client-mismatch', flow: 'sign-in' }, m).title).toBe(
      'Verification link is invalid for this device',
    );
  });
});

describe('httpsUrl', () => {
  it('keeps an https link and drops any other scheme or an unparsable value', () => {
    expect(httpsUrl('https://acme.com/support')).toBe('https://acme.com/support');
    expect(httpsUrl('javascript:alert(1)')).toBeUndefined();
    expect(httpsUrl('http://acme.com/support')).toBeUndefined();
    expect(httpsUrl('data:text/html,hi')).toBeUndefined();
    expect(httpsUrl('/support')).toBeUndefined();
    expect(httpsUrl(undefined)).toBeUndefined();
  });
});

describe('code step copy', () => {
  const m = signInMessages;

  it('names the alternative phone channel in the title and offers SMS instead', () => {
    const step = { kind: 'code', purpose: 'first-factor', channel: 'phone', provider: 'WhatsApp' } as const;

    expect(codeCopy(step, m, 'Acme').title).toBe('Check your WhatsApp');
    expect(codeSecondaryAction(step, m, { onCancel: () => undefined, onBack: () => undefined }).label).toBe(
      'Send code via SMS instead',
    );
  });

  it('shows an editable identifier on its own line before the second factor', () => {
    const step = { kind: 'code', purpose: 'first-factor', channel: 'phone', identifier: '+1******0123' } as const;

    expect(codeIdentity(step, m)).toEqual({ identifier: '+1******0123', editLabel: 'Edit phone number' });
    expect(codeCopy(step, m, 'Acme').description).toBe('Enter the verification code to continue to Acme');
  });

  it('names the identifier in the description when it cannot be edited', () => {
    const step = { kind: 'code', purpose: 'second-factor', channel: 'email', identifier: 'jane@acme.com' } as const;

    expect(codeIdentity(step, m).identifier).toBeUndefined();
    expect(codeCopy(step, m, 'Acme').description).toBe('Enter the verification code sent to jane@acme.com');
  });

  it('keeps the identifier in the description where the copy already names it', () => {
    const step = { kind: 'code', purpose: 'reset-password', channel: 'email', identifier: 'jane@acme.com' } as const;

    expect(codeIdentity(step, m).identifier).toBeUndefined();
    expect(codeCopy(step, m, 'Acme').description).toContain('jane@acme.com');
  });

  it('formats a phone number named in the description', () => {
    const step = { kind: 'code', purpose: 'second-factor', channel: 'phone', identifier: '+15555550123' } as const;

    expect(codeCopy(step, m, 'Acme').description).toBe('Enter the verification code sent to +1 (555) 555-0123');
  });

  it('leaves a masked phone number as FAPI sent it', () => {
    const step = { kind: 'code', purpose: 'reset-password', channel: 'phone', identifier: '+1******0123' } as const;

    expect(codeCopy(step, m, 'Acme').description).toBe('First, enter the code sent to your phone +1******0123');
  });

  it('warns on a new device and on an SSO bypass', () => {
    expect(codeNotice({ kind: 'code', purpose: 'client-trust', channel: 'email' }, m)).toBe(m.clientTrust.notice);
    expect(codeNotice({ kind: 'code', purpose: 'sso-bypass', channel: 'email' }, m)).toBe(m.ssoBypass.notice);
    expect(codeNotice({ kind: 'code', purpose: 'first-factor', channel: 'email' }, m)).toBeUndefined();
  });

  it('lets a phone being verified be edited and offers no other method', () => {
    const step = { kind: 'code', purpose: 'verify-phone', channel: 'phone', identifier: '+1 555 555 0123' } as const;

    expect(codeCopy(step, m, 'Acme').title).toBe('Verify your phone');
    expect(codeIdentity(step, m).identifier).toBe('+1 (555) 555-0123');
    expect(
      codeSecondaryAction(step, m, { onCancel: () => undefined, onBack: () => undefined }).onClick,
    ).toBeUndefined();
  });

  it('goes back from a second factor when there is no other method', () => {
    const onBack = () => undefined;
    const onCancel = () => undefined;
    const step = { kind: 'code', purpose: 'second-factor', channel: 'phone' } as const;

    expect(codeSecondaryAction(step, m, { onBack })).toEqual({ label: 'Back', onClick: onBack });
    expect(codeSecondaryAction(step, m, { onCancel, onBack })).toEqual({
      label: 'Use another method',
      onClick: onCancel,
    });
  });
});

describe('identifierFieldCopy', () => {
  it('labels each identifier field and the link that switches to it', () => {
    const m = signInMessages;
    expect(identifierFieldCopy('email', m)).toEqual({
      label: 'Email address',
      placeholder: 'Enter your email address',
      switchLabel: 'Use email',
    });
    expect(identifierFieldCopy('email-or-username', m)).toEqual({
      label: 'Email address or username',
      placeholder: 'Enter email or username',
      switchLabel: 'Use email or username',
    });
    expect(identifierFieldCopy('username', m)).toEqual({
      label: 'Username',
      placeholder: 'Enter your username',
      switchLabel: 'Use username',
    });
    expect(identifierFieldCopy('phone', m)).toEqual({
      label: 'Phone number',
      placeholder: 'Enter your phone number',
      switchLabel: 'Use phone',
    });
  });
});

describe('startPrompt', () => {
  it('offers the waitlist over sign-up, and nothing without either', () => {
    const onSignUp = () => undefined;
    const onJoinWaitlist = () => undefined;
    expect(startPrompt(signInMessages, { onSignUp })).toEqual({
      text: 'Don’t have an account?',
      link: 'Sign up',
      onClick: onSignUp,
    });
    expect(startPrompt(signInMessages, { onSignUp, onJoinWaitlist })).toEqual({
      text: 'Want early access?',
      link: 'Join waitlist',
      onClick: onJoinWaitlist,
    });
    expect(startPrompt(signInMessages, {})).toBeUndefined();
  });
});

describe('splitLastUsedProvider', () => {
  const google = { id: 'oauth_google', name: 'Google', iconUrl: 'google.svg' };
  const github = { id: 'oauth_github', name: 'GitHub', iconUrl: 'github.svg' };
  const x = { id: 'oauth_x', name: 'X', iconUrl: 'x.svg' };

  it('takes the last used provider out of the others, keeping their order', () => {
    expect(splitLastUsedProvider([google, github, x], 'oauth_github')).toEqual({
      lastUsed: github,
      others: [google, x],
    });
  });

  it('leaves every provider in the others when none was used last or it is not offered', () => {
    expect(splitLastUsedProvider([google, github], undefined)).toEqual({
      lastUsed: undefined,
      others: [google, github],
    });
    expect(splitLastUsedProvider([google, github], 'oauth_apple')).toEqual({
      lastUsed: undefined,
      others: [google, github],
    });
  });
});
