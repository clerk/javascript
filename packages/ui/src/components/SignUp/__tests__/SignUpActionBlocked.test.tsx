import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIErrorJSON } from '@clerk/shared/types';
import { afterEach, describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { SignUpStart } from '../SignUpStart';

const { createFixtures } = bindCreateFixtures('SignUp');

const blockedError = (meta?: ClerkAPIErrorJSON['meta']) =>
  new ClerkAPIResponseError('Error', {
    data: [{ code: 'action_blocked', message: 'Action blocked', long_message: 'Blocked.', meta }],
    status: 403,
  });

describe('a blocked sign-up', () => {
  const originalClerk = window.Clerk;
  afterEach(() => {
    window.Clerk = originalClerk;
  });

  it('replaces the start form with the blocked screen', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
      f.withPassword({ required: true });
    });
    fixtures.signUp.create.mockRejectedValueOnce(blockedError({ trace_id: '7Q8ikxgt' }));

    const { userEvent } = render(<SignUpStart />, { wrapper });
    await userEvent.type(screen.getByLabelText(/email address/i), 'hello@clerk.com');
    await userEvent.type(screen.getByLabelText('Password'), 'a-long-enough-password');
    await userEvent.click(screen.getByText('Continue'));

    await screen.findByText('7Q8ikxgt');
    expect(screen.queryByLabelText(/email address/i)).not.toBeInTheDocument();
  });

  it('shows the blocked screen rather than the restricted-access screen', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withRestrictedMode();
    });
    let lastError: unknown = blockedError({ trace_id: '7Q8ikxgt' }).errors[0];
    window.Clerk = {
      get __internal_last_error() {
        const value = lastError;
        lastError = null;
        return value;
      },
    } as typeof window.Clerk;

    render(<SignUpStart />, { wrapper });

    await screen.findByText('7Q8ikxgt');
    expect(screen.queryByText('Access restricted')).not.toBeInTheDocument();
  });
});
