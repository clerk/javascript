import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import { VerifyWithCode } from '../VerifyWithCode';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('Code verification with supplied commands', () => {
  it('prepares and completes verification without an identification resource', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    const prepareVerification = vi.fn().mockResolvedValue(undefined);
    const attemptVerification = vi.fn().mockResolvedValue(undefined);
    const nextStep = vi.fn();
    const { getByLabelText, userEvent } = render(
      <CardStateProvider>
        <VerifyWithCode
          identifier='test@clerk.com'
          prepareVerification={prepareVerification}
          attemptVerification={attemptVerification}
          nextStep={nextStep}
          onReset={vi.fn()}
        />
      </CardStateProvider>,
      { wrapper },
    );

    await waitFor(() => expect(prepareVerification).toHaveBeenCalledOnce());
    await userEvent.type(getByLabelText('Enter verification code'), '123456');
    await waitFor(() => expect(nextStep).toHaveBeenCalledOnce());

    expect(attemptVerification).toHaveBeenCalledExactlyOnceWith('123456');
    expect(fixtures.clerk.user?.emailAddresses[0].attemptVerification).not.toHaveBeenCalled();
  });
});
