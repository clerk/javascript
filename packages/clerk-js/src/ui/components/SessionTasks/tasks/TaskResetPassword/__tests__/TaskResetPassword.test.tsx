import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { TaskResetPassword } from '..';

const { createFixtures } = bindCreateFixtures('TaskResetPassword');

describe('TaskResetPassword', () => {
  it('does not render component without existing session task', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
      });
    });

    const { queryByText, queryByRole } = render(<TaskResetPassword />, { wrapper });

    expect(queryByText('New password')).not.toBeInTheDocument();
    expect(queryByText('Confirm password')).not.toBeInTheDocument();
    expect(queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
  });
});
