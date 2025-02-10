import { describe, it } from '@jest/globals';

import { render, screen } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { runFakeTimers } from '../../../utils/test/runFakeTimers';
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
    runFakeTimers(timers => {
      render(<ResetPasswordSuccess />, { wrapper });
      timers.advanceTimersByTime(1000);
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
      timers.advanceTimersByTime(1000);
      expect(fixtures.clerk.setActive).toHaveBeenCalled();
    });
  });

  it('does not set a session if createdSessionId is missing', async () => {
    const { wrapper, fixtures } = await createFixtures();
    runFakeTimers(timers => {
      render(<ResetPasswordSuccess />, { wrapper });
      timers.advanceTimersByTime(2000);
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    });
  });
});
