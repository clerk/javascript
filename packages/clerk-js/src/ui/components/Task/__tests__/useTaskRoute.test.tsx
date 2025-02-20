import { render, waitFor } from '../../../../testUtils';
import { HashRouter, Route, Switch } from '../../../../ui/router';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { createFakeUserOrganizationMembership } from '../../OrganizationSwitcher/__tests__/utlis';
import { useTaskRoute } from '../useTaskRoute';

const oldWindowLocation = window.location;
const setWindowOrigin = (origin: string) => {
  // @ts-ignore
  delete window.location;
  // the URL interface is very similar to window.location
  // we use it to easily mock the location methods in tests
  (window.location as any) = new URL(origin);
};

const MockRoute = (): JSX.Element => {
  const taskRoute = useTaskRoute();

  return (
    <HashRouter>
      <Switch>
        <Route path={taskRoute?.path}>{taskRoute?.children}</Route>
      </Switch>
    </HashRouter>
  );
};

describe('useTaskRoute', () => {
  describe.each(['SignIn', 'SignUp'] satisfies Array<Parameters<typeof bindCreateFixtures>[0]>)(
    'after %s flow',
    flow => {
      afterEach(() => {
        jest.clearAllMocks();
      });

      afterAll(() => {
        window.location = oldWindowLocation;
      });

      const { createFixtures } = bindCreateFixtures(flow);

      describe('with task', () => {
        it('renders the component', async () => {
          setWindowOrigin('http://dashboard.example.com/#/select-organization');

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

          const { queryByRole } = render(<MockRoute />, { wrapper });
          await waitFor(() => {
            expect(queryByRole('heading', { name: /choose an organization/i })).toBeInTheDocument();
          });
        });
      });

      describe('without task', () => {
        it('does not render the component', async () => {
          setWindowOrigin('http://dashboard.example.com/#/select-organization');

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

          const { queryByRole } = render(<MockRoute />, { wrapper });
          await waitFor(() => {
            expect(queryByRole('heading', { name: /choose an organization/i })).not.toBeInTheDocument();
          });
        });
      });

      describe('with invalid key', () => {
        it('does not render the component', async () => {
          setWindowOrigin('http://dashboard.example.com/#/select-organization');

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

          const { queryByRole } = render(<MockRoute />, { wrapper });
          await waitFor(() => {
            expect(queryByRole('heading', { name: /choose an organization/i })).not.toBeInTheDocument();
          });
        });
      });
    },
  );
});
