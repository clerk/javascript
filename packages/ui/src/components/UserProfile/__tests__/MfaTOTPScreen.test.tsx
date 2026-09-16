import type { TOTPResource } from '@clerk/shared/types';
import { act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';
import { ActionRoot } from '@/ui/elements/Action/ActionRoot';

import { MfaTOTPScreen } from '../MfaTOTPScreen';

const { createFixtures } = bindCreateFixtures('UserProfile');

const totp = {
  uri: 'otpauth://totp/Test:test@clerk.com?secret=TESTSECRET&issuer=Test',
  secret: 'TESTSECRET',
} as TOTPResource;

describe('MfaTOTPScreen', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('keeps the same TOTP secret when navigating back from the verification step', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withAuthenticatorApp();
      f.withUser({ two_factor_enabled: true });
    });

    fixtures.clerk.user?.createTOTP.mockResolvedValue(totp);

    const { findByText, findByRole, getByRole, userEvent } = render(
      <ActionRoot>
        <MfaTOTPScreen
          onSuccess={vi.fn()}
          onReset={vi.fn()}
        />
      </ActionRoot>,
      { wrapper },
    );

    await findByText(/scan the following QR code/i);
    expect(fixtures.clerk.user?.createTOTP).toHaveBeenCalledTimes(1);

    await act(async () => {
      await userEvent.click(getByRole('button', { name: /continue/i }));
    });

    await act(async () => {
      await userEvent.click(await findByRole('button', { name: /^back$/i }));
    });

    // Back returns to the QR step without minting a new secret, so the code the
    // user already scanned stays valid.
    await findByText(/scan the following QR code/i);
    expect(fixtures.clerk.user?.createTOTP).toHaveBeenCalledTimes(1);
  });
});
