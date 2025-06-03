import type { DeletedObjectResource } from '@clerk/types';
import { describe, it } from '@jest/globals';
import { waitFor } from '@testing-library/react';

import { CardStateProvider } from '@/ui/elements/contexts';

import { render } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { LeaveOrganizationForm } from '../ActionConfirmationPage';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

describe('LeaveOrganizationPage', () => {
  it('unable to leave the organization when confirmation has not passed', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
      });
    });

    fixtures.clerk.user?.leaveOrganization.mockResolvedValueOnce({} as DeletedObjectResource);

    const { getByRole, userEvent, getByLabelText } = render(
      <CardStateProvider>
        <LeaveOrganizationForm
          onSuccess={jest.fn()}
          onReset={jest.fn()}
        />
      </CardStateProvider>,
      { wrapper },
    );

    await userEvent.type(getByLabelText(/below to continue/i), 'Org2');
    expect(getByRole('button', { name: 'Leave organization' })).toBeDisabled();
  });

  it('leaves the organization when user clicks "Leave organization"', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
      });
    });

    fixtures.clerk.user?.leaveOrganization.mockResolvedValueOnce({} as DeletedObjectResource);

    const { getByRole, userEvent, getByLabelText, findByRole } = render(
      <CardStateProvider>
        <LeaveOrganizationForm
          onSuccess={jest.fn()}
          onReset={jest.fn()}
        />
      </CardStateProvider>,
      { wrapper },
    );

    await userEvent.type(getByLabelText(/below to continue/i), 'Org1');
    await waitFor(async () => expect(await findByRole('button', { name: 'Leave organization' })).not.toBeDisabled());
    await waitFor(async () => {
      await userEvent.click(getByRole('button', { name: 'Leave organization' }));
    });
    expect(fixtures.clerk.user?.leaveOrganization).toHaveBeenCalledWith('Org1');
  });
});
