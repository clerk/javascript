import { render, waitFor } from '../../../../testUtils';
import { createFakeUserOrganizationMembership } from '../../../../ui/components/OrganizationSwitcher/__tests__/utlis';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { Task } from '../Task';

describe('Task', () => {
  describe.each(['SignIn', 'SignUp'] satisfies Array<Parameters<typeof bindCreateFixtures>[0]>)(
    'after %s flow',
    flow => {
      const { createFixtures } = bindCreateFixtures(flow);

      describe('with session task', () => {
        it('renders the component', async () => {
          const { wrapper, fixtures } = await createFixtures(f => {
            f.withOrganizations();
            f.withUser({
              email_addresses: ['test@clerk.com'],
              create_organization_enabled: true,
              session: {
                status: 'pending',
                tasks: [{ key: 'org' }],
              },
            });
          });

          fixtures.clerk.user?.getOrganizationMemberships.mockReturnValueOnce(
            Promise.resolve({
              data: [
                createFakeUserOrganizationMembership({
                  id: '1',
                  organization: {
                    id: '1',
                    name: 'Org1',
                    slug: 'org1',
                    membersCount: 1,
                    adminDeleteEnabled: false,
                    maxAllowedMemberships: 1,
                    pendingInvitationsCount: 1,
                  },
                }),
              ],
              total_count: 1,
            }),
          );

          const { queryByRole } = render(<Task />, { wrapper });
          await waitFor(() => {
            expect(queryByRole('heading', { name: /choose an organization/i })).toBeInTheDocument();
          });
        });
      });

      describe('without session task', () => {
        it('does not render the component', async () => {
          const { wrapper, fixtures } = await createFixtures(f => {
            f.withOrganizations();
            f.withUser({
              email_addresses: ['test@clerk.com'],
              create_organization_enabled: true,
              session: {
                status: 'active',
              },
            });
          });

          fixtures.clerk.user?.getOrganizationMemberships.mockReturnValueOnce(
            Promise.resolve({
              data: [
                createFakeUserOrganizationMembership({
                  id: '1',
                  organization: {
                    id: '1',
                    name: 'Org1',
                    slug: 'org1',
                    membersCount: 1,
                    adminDeleteEnabled: false,
                    maxAllowedMemberships: 1,
                    pendingInvitationsCount: 1,
                  },
                }),
              ],
              total_count: 1,
            }),
          );

          const { queryByRole } = render(<Task />, { wrapper });
          await waitFor(() => {
            expect(queryByRole('heading', { name: /choose an organization/i })).not.toBeInTheDocument();
          });
        });
      });

      describe('with invalid session key', () => {
        it('does not render the component', async () => {
          const { wrapper, fixtures } = await createFixtures(f => {
            f.withOrganizations();
            f.withUser({
              email_addresses: ['test@clerk.com'],
              create_organization_enabled: true,
              session: {
                status: 'pending',
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                tasks: [{ key: 'invalid' }],
              },
            });
          });

          fixtures.clerk.user?.getOrganizationMemberships.mockReturnValueOnce(
            Promise.resolve({
              data: [
                createFakeUserOrganizationMembership({
                  id: '1',
                  organization: {
                    id: '1',
                    name: 'Org1',
                    slug: 'org1',
                    membersCount: 1,
                    adminDeleteEnabled: false,
                    maxAllowedMemberships: 1,
                    pendingInvitationsCount: 1,
                  },
                }),
              ],
              total_count: 1,
            }),
          );

          const { queryByRole } = render(<Task />, { wrapper });
          await waitFor(() => {
            expect(queryByRole('heading', { name: /choose an organization/i })).not.toBeInTheDocument();
          });
        });
      });
    },
  );
});
