import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { ConfigureSSO } from '../ConfigureSSO';

const { createFixtures } = bindCreateFixtures('ConfigureSSO');

describe('ConfigureSSO', () => {
  it('does not render when the self_serve_sso feature is disabled', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    fixtures.environment.userSettings.enterpriseSSO = {
      enabled: false,
      self_serve_sso: false,
    };

    const { queryByText } = render(<ConfigureSSO />, { wrapper });

    expect(queryByText(/Configure Single Sign-On/i)).not.toBeInTheDocument();
  });
});
