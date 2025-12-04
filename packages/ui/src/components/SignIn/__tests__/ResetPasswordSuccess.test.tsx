import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { ResetPasswordSuccess } from '../ResetPasswordSuccess';

const { createFixtures: createFixturesWithQuery } = bindCreateFixtures('SignIn', {
  router: {
    queryString: '?createdSessionId=1234_session_id',
  },
});

const { createFixtures } = bindCreateFixtures('SignIn');

describe('ResetPasswordSuccess', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures();

    render(<ResetPasswordSuccess />, { wrapper });
    screen.getByRole('heading', { name: /Set new password/i });
    screen.getByText(/Your password was successfully changed. Signing you in, please wait a moment/i);
  });

  it('sets active session after 2000 ms', async () => {
    const { wrapper, fixtures } = await createFixturesWithQuery();
    vi.useFakeTimers();
    try {
      render(<ResetPasswordSuccess />, { wrapper });
      vi.advanceTimersByTime(1000);
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1000);
      expect(fixtures.clerk.setActive).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not set a session if createdSessionId is missing', async () => {
    const { wrapper, fixtures } = await createFixtures();
    vi.useFakeTimers();
    try {
      render(<ResetPasswordSuccess />, { wrapper });
      vi.advanceTimersByTime(2000);
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
