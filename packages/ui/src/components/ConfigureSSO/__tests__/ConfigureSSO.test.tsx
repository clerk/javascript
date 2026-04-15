import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { ConfigureSSO } from '../';

const { createFixtures } = bindCreateFixtures('ConfigureSSO');

describe('ConfigureSSO', () => {
  it('opens the enterprise connection drawer when the Configure SSO action is clicked', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    const { userEvent, findByRole, findByText } = render(<ConfigureSSO />, { wrapper });

    const configureButton = await findByRole('button', { name: /configure enterprise connection/i });
    await userEvent.click(configureButton);

    expect(await findByText(/select your identity provider/i)).toBeVisible();
  });

  it('shows the step to verify domain when the primary email is not verified', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({
        email_addresses: [
          {
            email_address: 'unverified@clerk.com',
            verification: {
              status: 'unverified',
              strategy: 'email_link',
              attempts: null,
              expire_at: null,
            },
          },
        ],
      });
    });

    render(<ConfigureSSO />, { wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /verify the domain for your enterprise connection/i })).toBeVisible();
    });

    expect(screen.getByText(/verify the domain you want to enable the enterprise connection on/i)).toBeVisible();
  });
});
