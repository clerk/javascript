import { describe, expect, it } from 'vitest';

import { signInMessages } from '../../sign-in/sign-in.messages';
import {
  codeCopy,
  codeIdentity,
  codeNotice,
  codeSecondaryAction,
  emailLinkStatusCopy,
  httpsUrl,
} from '../auth-flow.utils';

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

  it('shows the identifier on its own line, with an edit button, when resetting a password', () => {
    const step = { kind: 'code', purpose: 'reset-password', channel: 'email', identifier: 'jane@acme.com' } as const;

    expect(codeIdentity(step, m).identifier).toBe('jane@acme.com');
    expect(codeCopy(step, m, 'Acme').description).toBe('First, enter the code sent to your email address');
  });

  it('formats a phone number named in the description', () => {
    const step = { kind: 'code', purpose: 'second-factor', channel: 'phone', identifier: '+15555550123' } as const;

    expect(codeCopy(step, m, 'Acme').description).toBe('Enter the verification code sent to +1 (555) 555-0123');
  });

  it('leaves a masked phone number as FAPI sent it', () => {
    const step = { kind: 'code', purpose: 'reset-password', channel: 'phone', identifier: '+1******0123' } as const;

    expect(codeIdentity(step, m).identifier).toBe('+1******0123');
  });

  it('says why a second factor is asked for while resetting a password', () => {
    const step = { kind: 'code', purpose: 'second-factor', channel: 'phone', resetting: true } as const;

    expect(codeCopy(step, m, 'Acme').description).toBe(
      'We need to verify your identity before resetting your password.',
    );
    expect(codeCopy({ ...step, channel: 'totp' }, m, 'Acme').description).toBe(
      'We need to verify your identity before resetting your password.',
    );
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
