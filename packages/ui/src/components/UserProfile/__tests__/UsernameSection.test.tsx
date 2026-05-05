import type { UserResource } from '@clerk/shared/types';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { UsernameSection } from '../UsernameSection';

const { createFixtures } = bindCreateFixtures('UsernameSection');

const initConfig = createFixtures.config(f => {
  f.withUser({ username: 'georgeclerk' });
});

describe('UsernameScreen', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(initConfig);

    render(<UsernameSection />, { wrapper });
  });

  it('shows the title', async () => {
    const { wrapper } = await createFixtures(initConfig);

    const { userEvent } = render(<UsernameSection />, { wrapper });

    await userEvent.click(screen.getByText(/update username/i));
    await waitFor(() => {
      screen.getByLabelText(/username/i);
    });

    screen.getByRole('heading', { name: /Update username/i });
  });

  describe('Immutable username', () => {
    it('displays username as read-only when immutable and user has a username', async () => {
      const { wrapper } = await createFixtures(initConfig);

      const { queryByRole } = render(<UsernameSection isImmutable />, { wrapper });

      screen.getByText('georgeclerk');
      expect(queryByRole('button', { name: /update username/i })).not.toBeInTheDocument();
      expect(queryByRole('button', { name: /set username/i })).not.toBeInTheDocument();
    });

    it('hides the section when immutable and user has no username', async () => {
      const { wrapper } = await createFixtures(
        createFixtures.config(f => {
          f.withUser({ username: '' });
        }),
      );

      const { container } = render(<UsernameSection isImmutable />, { wrapper });

      expect(container.innerHTML).toBe('');
    });
  });

  describe('Actions', () => {
    it('calls the appropriate function upon pressing save', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      fixtures.clerk.user?.update.mockResolvedValue({} as UserResource);
      const { userEvent } = render(<UsernameSection />, { wrapper });

      await userEvent.click(screen.getByText(/update username/i));
      await waitFor(() => {
        screen.getByLabelText(/username/i);
      });

      await userEvent.type(screen.getByLabelText(/username/i), 'test');
      await userEvent.click(screen.getByRole('button', { name: /save/i }));
      expect(fixtures.clerk.user?.update).toHaveBeenCalledWith({ username: 'georgeclerktest' });
    });

    it('shows the previous content upon pressing cancel', async () => {
      const { wrapper } = await createFixtures(initConfig);

      const { userEvent } = render(<UsernameSection />, { wrapper });

      await userEvent.click(screen.getByText(/update username/i));
      await waitFor(() => {
        screen.getByLabelText(/username/i);
      });

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      await waitFor(() => {
        screen.getByRole('button', {
          name: /update username/i,
        });
      });
    });
  });
});
