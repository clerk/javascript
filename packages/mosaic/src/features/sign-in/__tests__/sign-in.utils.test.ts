import { describe, expect, it } from 'vitest';

import type { SignInStep } from '../sign-in.types';
import { stepKey } from '../sign-in.utils';

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
