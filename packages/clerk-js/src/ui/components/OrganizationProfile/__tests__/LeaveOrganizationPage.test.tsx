import { describe, it } from '@jest/globals';
import React from 'react';

import { render } from '../../../../testUtils';
import { CardStateProvider } from '../../../elements';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { LeaveOrganizationPage } from '../ActionConfirmationPage';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

describe('LeaveOrganizationPage', () => {
  it.skip('leaves the organization when user clicks "Leave organization"', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.dev'],
        organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
      });
    });

    const { getByRole, userEvent } = render(
      <CardStateProvider>
        <LeaveOrganizationPage />
      </CardStateProvider>,
      { wrapper },
    );
    expect(getByRole('button', { name: 'Leave organization' })).toBeDefined();
    await userEvent.click(getByRole('button', { name: 'Leave organization' }));
  });
});
