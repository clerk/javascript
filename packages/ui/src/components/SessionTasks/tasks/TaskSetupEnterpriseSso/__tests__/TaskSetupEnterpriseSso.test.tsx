import type { EnterpriseConnectionResource, ExternalAccountResource } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';
import { SessionTasksContext } from '@/ui/contexts/components/SessionTasks';

import { TaskSetupEnterpriseSSO } from '..';

const { createFixtures } = bindCreateFixtures('SignIn');

const ssoConnection = {
  id: 'entc_uop',
  name: 'University of Phoenix',
  active: true,
  allowOrganizationAccountLinking: true,
  samlConnection: { id: 'samlc_uop' },
} as unknown as EnterpriseConnectionResource;

const renderTask = (wrapper: Parameters<typeof render>[1]['wrapper']) =>
  render(
    <SessionTasksContext.Provider value={{ redirectUrlComplete: '/', redirectOnActiveSession: { current: true } }}>
      <TaskSetupEnterpriseSSO />
    </SessionTasksContext.Provider>,
    { wrapper },
  );

const studentWithTask = {
  email_addresses: ['bart@gmail.com'],
  organization_memberships: [{ name: 'University of Phoenix', id: 'org_uop', role: 'basic_member' }],
};

describe('TaskSetupEnterpriseSSO', () => {
  it('does not render without the session task', async () => {
    const { wrapper } = await createFixtures(f => f.withUser(studentWithTask));

    const { queryByRole } = renderTask(wrapper);

    expect(queryByRole('button', { name: /continue with/i })).not.toBeInTheDocument();
  });

  it("starts SSO through the active organization's connection", async () => {
    const { wrapper, fixtures } = await createFixtures(f =>
      f.withUser({ ...studentWithTask, tasks: [{ key: 'setup-enterprise-sso' }] }),
    );
    const organization = fixtures.clerk.user?.organizationMemberships[0].organization;
    organization?.getEnterpriseConnections.mockResolvedValue([ssoConnection]);
    fixtures.clerk.user?.createExternalAccount.mockResolvedValue({} as ExternalAccountResource);

    const { findByRole, userEvent } = renderTask(wrapper);
    await userEvent.click(await findByRole('button', { name: 'Continue with University of Phoenix' }));

    await waitFor(() =>
      expect(fixtures.clerk.user?.createExternalAccount).toHaveBeenCalledWith({
        enterpriseConnectionId: 'entc_uop',
        redirectUrl: window.location.href,
      }),
    );
  });

  it('explains when the organization has no SSO connection to continue with', async () => {
    const { wrapper, fixtures } = await createFixtures(f =>
      f.withUser({ ...studentWithTask, tasks: [{ key: 'setup-enterprise-sso' }] }),
    );
    fixtures.clerk.user?.organizationMemberships[0].organization.getEnterpriseConnections.mockResolvedValue([
      { ...ssoConnection, allowOrganizationAccountLinking: false } as EnterpriseConnectionResource,
    ]);

    const { findByText, queryByRole } = renderTask(wrapper);

    expect(await findByText(/SSO connection isn't available/i)).toBeInTheDocument();
    expect(queryByRole('button', { name: /continue with/i })).not.toBeInTheDocument();
  });
});
