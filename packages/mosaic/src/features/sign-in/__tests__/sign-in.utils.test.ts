import { describe, expect, it } from 'vitest';

import { signInMessages } from '../sign-in.messages';
import type { SignInStep } from '../sign-in.types';
import { codeCopy, codeIdentity, codeSecondaryAction, httpsUrl, stepKey } from '../sign-in.utils';

describe('stepKey', () => {
  it('keys each step by its kind and the variant that changes its copy', () => {
    const steps: [SignInStep, string][] = [
      [{ kind: 'identifier' }, 'identifier'],
      [{ kind: 'credential', credential: 'password', identifier: 'jane@acme.com' }, 'credential:password'],
      [{ kind: 'credential', credential: 'backup-code', identifier: 'jane@acme.com' }, 'credential:backup-code'],
      [{ kind: 'credential', credential: 'passkey', identifier: 'jane@acme.com' }, 'credential:passkey'],
      [{ kind: 'code', purpose: 'first-factor', channel: 'email', identifier: 'jane@acme.com' }, 'code:first-factor'],
      [{ kind: 'code', purpose: 'second-factor', channel: 'totp' }, 'code:second-factor'],
      [{ kind: 'code', purpose: 'verify-email', channel: 'email', identifier: 'new@acme.com' }, 'code:verify-email'],
      [{ kind: 'choice', purpose: 'methods', options: [] }, 'choice:methods'],
      [{ kind: 'choice', purpose: 'reset-methods', options: [] }, 'choice:reset-methods'],
      [{ kind: 'notice', purpose: 'help' }, 'notice:help'],
      [
        { kind: 'code', purpose: 'reset-password', channel: 'email', identifier: 'jane@acme.com' },
        'code:reset-password',
      ],
      [{ kind: 'notice', purpose: 'forgot-password', identifier: 'jane@acme.com' }, 'notice:forgot-password'],
      [{ kind: 'notice', purpose: 'action-blocked' }, 'notice:action-blocked'],
      [{ kind: 'notice', purpose: 'email-link', identifier: 'jane@acme.com' }, 'notice:email-link'],
      [{ kind: 'new-password', reason: 'forgot' }, 'new-password:forgot'],
      [{ kind: 'sign-up' }, 'sign-up'],
    ];

    expect(steps.map(([step]) => stepKey(step))).toEqual(steps.map(([, key]) => key));
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

    expect(codeCopy(step, m).title).toBe('Check your WhatsApp');
    expect(codeSecondaryAction(step, m, { onCancel: () => undefined, onBack: () => undefined }).label).toBe(
      'Send code via SMS instead',
    );
  });

  it('shows the identifier on its own line, editable only before the second factor', () => {
    const first = codeIdentity(
      { kind: 'code', purpose: 'first-factor', channel: 'phone', identifier: '+1******0123' },
      m,
    );
    const second = codeIdentity(
      { kind: 'code', purpose: 'second-factor', channel: 'email', identifier: 'jane@acme.com' },
      m,
    );

    expect(first).toMatchObject({ identifier: '+1******0123', editable: true, editLabel: 'Edit phone number' });
    expect(second).toMatchObject({ identifier: 'jane@acme.com', editable: false });
  });

  it('keeps the identifier in the description where the copy already names it', () => {
    const step = { kind: 'code', purpose: 'reset-password', channel: 'email', identifier: 'jane@acme.com' } as const;

    expect(codeIdentity(step, m).identifier).toBeUndefined();
    expect(codeCopy(step, m).description).toContain('jane@acme.com');
  });

  it('warns on a new device and on an SSO bypass', () => {
    expect(codeIdentity({ kind: 'code', purpose: 'client-trust', channel: 'email' }, m).notice).toBe(
      m.clientTrust.notice,
    );
    expect(codeIdentity({ kind: 'code', purpose: 'sso-bypass', channel: 'email' }, m).notice).toBe(m.ssoBypass.notice);
    expect(codeIdentity({ kind: 'code', purpose: 'first-factor', channel: 'email' }, m).notice).toBeUndefined();
  });

  it('lets a phone being verified be edited and offers no other method', () => {
    const step = { kind: 'code', purpose: 'verify-phone', channel: 'phone', identifier: '+1 555 555 0123' } as const;

    expect(codeCopy(step, m).title).toBe('Verify your phone');
    expect(codeIdentity(step, m)).toMatchObject({ identifier: '+1 555 555 0123', editable: true });
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
