import type { WaitlistResource } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { Waitlist } from '../';

const { createFixtures } = bindCreateFixtures('Waitlist');

describe('Waitlist', () => {
  it('should render the waitlist', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withWaitlistMode();
    });
    render(<Waitlist />, { wrapper });

    screen.getByText('Enter your email address and we’ll let you know when your spot is ready');
    screen.getByRole('button', { name: 'Join the waitlist' });
  });

  it('should go to success step', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withWaitlistMode();
    });
    fixtures.clerk.joinWaitlist.mockResolvedValueOnce({ id: 'wle_2lEkeknQndRH0q3ImmFdJI4PbXh' } as WaitlistResource);
    const { userEvent } = render(<Waitlist />, { wrapper });
    await userEvent.type(screen.getByLabelText(/email address/i), 'hello@clerk.com');
    await userEvent.click(screen.getByRole('button', { name: 'Join the waitlist' }));

    expect(fixtures.clerk.joinWaitlist).toHaveBeenCalled();

    screen.getByText('Thanks for joining the waitlist!');
  });

  it('should have the correct sign-in url', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withWaitlistMode();
    });
    fixtures.clerk.joinWaitlist.mockResolvedValueOnce({ id: 'wle_2lEkeknQndRH0q3ImmFdJI4PbXh' } as WaitlistResource);
    render(<Waitlist />, { wrapper });

    const signInLink = screen.getByText(/Already have access/i).nextElementSibling;
    expect(signInLink?.textContent).toBe('Sign in');
    expect(signInLink?.tagName.toUpperCase()).toBe('A');
    expect(signInLink?.getAttribute('href')).toMatch(fixtures.environment.displayConfig.signInUrl);
  });
});
