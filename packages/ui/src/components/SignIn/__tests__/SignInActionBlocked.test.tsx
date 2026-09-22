import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIErrorJSON, SignInResource } from '@clerk/shared/types';
import { afterEach, describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { SignInFactorOne } from '../SignInFactorOne';
import { SignInStart } from '../SignInStart';

const { createFixtures } = bindCreateFixtures('SignIn');

const blockedError = (meta?: ClerkAPIErrorJSON['meta']) =>
  new ClerkAPIResponseError('Error', {
    data: [{ code: 'action_blocked', message: 'Action blocked', long_message: 'Blocked.', meta }],
    status: 403,
  });

const INLINE_ERROR = /This action couldn't be completed/i;

describe('a blocked sign-in', () => {
  const originalClerk = window.Clerk;
  afterEach(() => {
    window.Clerk = originalClerk;
  });

  it('replaces the start form with the blocked screen', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
    });
    fixtures.signIn.create.mockRejectedValueOnce(blockedError({ trace_id: '7Q8ikxgt' }));

    const { userEvent } = render(<SignInStart />, { wrapper });
    await userEvent.type(screen.getByLabelText(/email address/i), 'hello@clerk.com');
    await userEvent.click(screen.getByText('Continue'));

    await screen.findByText('7Q8ikxgt');
    screen.getByText("We couldn't complete this request");
    expect(screen.queryByLabelText(/email address/i)).not.toBeInTheDocument();
  });

  it('keeps the inline error when the block carries no details', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
    });
    fixtures.signIn.create.mockRejectedValueOnce(blockedError());

    const { userEvent } = render(<SignInStart />, { wrapper });
    await userEvent.type(screen.getByLabelText(/email address/i), 'hello@clerk.com');
    await userEvent.click(screen.getByText('Continue'));

    await screen.findByText(INLINE_ERROR);
    screen.getByLabelText(/email address/i);
  });

  it('shows the blocked screen for an error handed over from another card', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress();
    });
    // Like the real getter, this hands the error over once and then clears it.
    let lastError: unknown = blockedError({ trace_id: '7Q8ikxgt' }).errors[0];
    window.Clerk = {
      get __internal_last_error() {
        const value = lastError;
        lastError = null;
        return value;
      },
    } as typeof window.Clerk;

    render(<SignInStart />, { wrapper });

    await screen.findByText('7Q8ikxgt');
  });

  // Only the cards that render the blocked screen read the details. Any other card must keep
  // showing its inline error, or a block there would leave the user looking at a form with nothing
  // on it.
  it('leaves the inline error alone on a card that does not render the blocked screen', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.withPassword();
      f.withPreferredSignInStrategy({ strategy: 'password' });
      f.startSignInWithPhoneNumber({ supportPassword: true });
    });
    fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
    fixtures.signIn.attemptFirstFactor.mockRejectedValueOnce(blockedError({ trace_id: '7Q8ikxgt' }));

    const { userEvent } = render(<SignInFactorOne />, { wrapper });
    await userEvent.type(screen.getByLabelText('Password'), '123456');
    await userEvent.click(screen.getByText('Continue'));

    await screen.findByText(INLINE_ERROR);
    expect(screen.queryByText('7Q8ikxgt')).not.toBeInTheDocument();
    screen.getByLabelText('Password');
  });
});
