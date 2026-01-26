import type { OrganizationResource } from '@clerk/shared/types';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';
import {
  createFakeUserOrganizationMembership,
  createFakeUserOrganizationSuggestion,
} from '@/ui/components/OrganizationSwitcher/__tests__/test-utils';
import { clearFetchCache } from '@/ui/hooks';

import { TaskChooseOrganization } from '..';

type FakeOrganizationParams = {
  id: string;
  createdAt?: Date;
  imageUrl?: string;
  slug: string;
  name: string;
  membersCount: number;
  pendingInvitationsCount: number;
  adminDeleteEnabled: boolean;
  maxAllowedMemberships: number;
};

const createFakeOrganization = (params: FakeOrganizationParams): OrganizationResource => {
  return {
    pathRoot: '',
    id: params.id,
    name: params.name,
    slug: params.slug,
    hasImage: !!params.imageUrl,
    imageUrl: params.imageUrl || '',
    membersCount: params.membersCount,
    pendingInvitationsCount: params.pendingInvitationsCount,
    publicMetadata: {},
    adminDeleteEnabled: params.adminDeleteEnabled,
    maxAllowedMemberships: params?.maxAllowedMemberships,
    createdAt: params?.createdAt || new Date(),
    updatedAt: new Date(),
    update: vi.fn() as any,
    getMemberships: vi.fn() as any,
    getInvitations: vi.fn() as any,
    getRoles: vi.fn() as any,
    addMember: vi.fn() as any,
    inviteMember: vi.fn() as any,
    inviteMembers: vi.fn() as any,
    updateMember: vi.fn() as any,
    removeMember: vi.fn() as any,
    createDomain: vi.fn() as any,
    getDomain: vi.fn() as any,
    getDomains: vi.fn() as any,
    getMembershipRequests: vi.fn() as any,
    destroy: vi.fn() as any,
    setLogo: vi.fn() as any,
    reload: vi.fn() as any,
    __internal_toSnapshot: vi.fn() as any,
    initializePaymentMethod: vi.fn() as any,
  } as OrganizationResource;
};

const { createFixtures } = bindCreateFixtures('TaskChooseOrganization');

describe('TaskChooseOrganization', () => {
  beforeEach(() => {
    clearFetchCache();
  });

  it('does not render component without existing session task', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
      });
    });

    const { queryByText, queryByRole } = render(<TaskChooseOrganization />, { wrapper });

    expect(queryByText('Setup your organization')).not.toBeInTheDocument();
    expect(queryByText('Enter your organization details to continue')).not.toBeInTheDocument();
    expect(queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
  });

  it('renders component when session task exists', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    const { findByText, findByRole } = render(<TaskChooseOrganization />, { wrapper });

    expect(await findByText('Setup your organization')).toBeInTheDocument();
    expect(await findByText('Enter your organization details to continue')).toBeInTheDocument();
    expect(await findByRole('link', { name: /sign out/i })).toBeInTheDocument();
  });

  it('shows create organization screen when user has no existing resources', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    const { findByRole, findByText } = render(<TaskChooseOrganization />, { wrapper });

    expect(await findByRole('textbox', { name: /name/i })).toBeInTheDocument();
    expect(await findByText('Continue')).toBeInTheDocument();
  });

  it('shows choose organization screen when user has existing organizations', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    fixtures.clerk.user?.getOrganizationMemberships.mockReturnValueOnce(
      Promise.resolve({
        data: [
          createFakeUserOrganizationMembership({
            id: '1',
            organization: {
              id: '1',
              name: 'Existing Org',
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

    const { findByText, queryByRole } = render(<TaskChooseOrganization />, { wrapper });

    expect(await findByText('Existing Org')).toBeInTheDocument();
    expect(await findByText('Create new organization')).toBeInTheDocument();
    expect(queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
  });

  it('allows switching between choose and create organization screens', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    fixtures.clerk.user?.getOrganizationMemberships.mockReturnValueOnce(
      Promise.resolve({
        data: [
          createFakeUserOrganizationMembership({
            id: '1',
            organization: {
              id: '1',
              name: 'Existing Org',
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

    const { findByText, findByRole, queryByRole, queryByText } = render(<TaskChooseOrganization />, { wrapper });

    expect(await findByText('Existing Org')).toBeInTheDocument();
    expect(await findByText('Create new organization')).toBeInTheDocument();
    expect(queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();

    const createButton = await findByText('Create new organization');
    await userEvent.click(createButton);

    expect(await findByRole('textbox', { name: /name/i })).toBeInTheDocument();
    expect(await findByRole('button', { name: /continue/i })).toBeInTheDocument();
    expect(await findByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(queryByText('Existing Org')).not.toBeInTheDocument();

    const cancelButton = await findByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(await findByText('Existing Org')).toBeInTheDocument();
    expect(await findByText('Create new organization')).toBeInTheDocument();
    expect(queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
  });

  it('displays user identifier in sign out section', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['user@test.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    const { findByText } = render(<TaskChooseOrganization />, { wrapper });

    expect(await findByText(/user@test\.com/)).toBeInTheDocument();
    expect(await findByText('Sign out')).toBeInTheDocument();
  });

  it('handles sign out correctly', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    const { findByRole } = render(<TaskChooseOrganization />, { wrapper });
    const signOutButton = await findByRole('link', { name: /sign out/i });

    await userEvent.click(signOutButton);

    expect(fixtures.clerk.signOut).toHaveBeenCalled();
  });

  it('renders with username when email is not available', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        username: 'testuser',
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    const { findByText } = render(<TaskChooseOrganization />, { wrapper });

    expect(await findByText(/testuser/)).toBeInTheDocument();
  });

  describe('on create organization form', () => {
    it("does not display slug field if it's disabled on environment", async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withOrganizationSlug(false);
        f.withForceOrganizationSelection();
        f.withUser({
          create_organization_enabled: true,
          tasks: [{ key: 'choose-organization' }],
        });
      });

      const { findByRole, queryByLabelText } = render(<TaskChooseOrganization />, { wrapper });

      expect(await findByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(queryByLabelText(/Slug/i)).not.toBeInTheDocument();
    });

    it("display slug field if it's enabled on environment", async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withOrganizationSlug(true);
        f.withForceOrganizationSelection();
        f.withUser({
          create_organization_enabled: true,
          tasks: [{ key: 'choose-organization' }],
        });
      });

      const { findByRole, queryByLabelText } = render(<TaskChooseOrganization />, { wrapper });

      expect(await findByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(queryByLabelText(/Slug/i)).toBeInTheDocument();
    });
  });

  describe('when users are not allowed to create organizations', () => {
    it('does not display create organization screen', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withForceOrganizationSelection();
        f.withUser({
          create_organization_enabled: false,
          tasks: [{ key: 'choose-organization' }],
        });
      });

      const { findByText, queryByText } = render(<TaskChooseOrganization />, { wrapper });

      expect(await findByText(/you must belong to an organization/i)).toBeInTheDocument();
      expect(await findByText(/contact your organization admin for an invitation/i)).toBeInTheDocument();
      expect(queryByText(/create new organization/i)).not.toBeInTheDocument();
    });

    it('with existing memberships or suggestions, displays create organization screen', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withForceOrganizationSelection();
        f.withUser({
          create_organization_enabled: false,
          tasks: [{ key: 'choose-organization' }],
        });
      });

      fixtures.clerk.user?.getOrganizationMemberships.mockReturnValueOnce(
        Promise.resolve({
          data: [
            createFakeUserOrganizationMembership({
              id: '1',
              organization: {
                id: '1',
                name: 'Existing Org',
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

      fixtures.clerk.user?.getOrganizationSuggestions.mockReturnValueOnce(
        Promise.resolve({
          data: [
            createFakeUserOrganizationSuggestion({
              id: '2',
              emailAddress: 'two@clerk.com',
              publicOrganizationData: {
                name: 'OrgTwoSuggestion',
              },
            }),
          ],
          total_count: 1,
        }),
      );

      const { findByText, queryByText } = render(<TaskChooseOrganization />, { wrapper });

      expect(await findByText('Join an existing organization')).toBeInTheDocument();
      expect(await queryByText('Create new organization')).not.toBeInTheDocument();
      expect(await findByText('Existing Org')).toBeInTheDocument();
    });
  });

  describe('with organization creation defaults', () => {
    describe('when enabled on environment', () => {
      it('displays warning when organization already exists for user email domain', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withOrganizations();
          f.withForceOrganizationSelection();
          f.withOrganizationCreationDefaults(true);
          f.withUser({
            email_addresses: ['test@clerk.com'],
            create_organization_enabled: true,
            tasks: [{ key: 'choose-organization' }],
          });
        });

        fixtures.clerk.user?.getOrganizationCreationDefaults.mockReturnValueOnce(
          Promise.resolve({
            advisory: {
              code: 'organization_already_exists',
              severity: 'warning',
              meta: { organization_domain: 'test@clerk.com', organization_name: 'Clerk' },
            },
          }),
        );

        const { findByText } = render(<TaskChooseOrganization />, { wrapper });

        expect(
          await findByText(
            /an organization already exists for the detected company name \(Clerk\) and test@clerk\.com/i,
          ),
        ).toBeInTheDocument();
      });

      it('prefills create organization form with defaults', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withOrganizations();
          f.withOrganizationSlug(true);
          f.withForceOrganizationSelection();
          f.withOrganizationCreationDefaults(true);
          f.withUser({
            email_addresses: ['test@clerk.com'],
            create_organization_enabled: true,
            tasks: [{ key: 'choose-organization' }],
          });
        });

        fixtures.clerk.user?.getOrganizationCreationDefaults.mockReturnValueOnce(
          Promise.resolve({
            form: {
              name: 'Test Org',
              slug: 'test-org',
              logo: null,
            },
          }),
        );

        const { findByRole } = render(<TaskChooseOrganization />, { wrapper });

        expect(await findByRole('textbox', { name: /name/i })).toHaveValue('Test Org');
        expect(await findByRole('textbox', { name: /slug/i })).toHaveValue('test-org');
      });
    });

    describe('when disabled on environment', () => {
      it('does not fetch for creation defaults', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withOrganizations();
          f.withForceOrganizationSelection();
          f.withOrganizationCreationDefaults(false);
          f.withUser({
            email_addresses: ['test@clerk.com'],
            create_organization_enabled: true,
            tasks: [{ key: 'choose-organization' }],
          });
        });

        render(<TaskChooseOrganization />, { wrapper });

        expect(fixtures.clerk.user?.getOrganizationCreationDefaults).not.toHaveBeenCalled();
      });
    });
  });

  describe('on create organization submit', () => {
    it('calls setActive even when logo upload fails', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withForceOrganizationSelection();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          create_organization_enabled: true,
          tasks: [{ key: 'choose-organization' }],
        });
      });

      const createdOrg = createFakeOrganization({
        id: '1',
        adminDeleteEnabled: false,
        maxAllowedMemberships: 1,
        membersCount: 1,
        name: 'new org',
        pendingInvitationsCount: 0,
        slug: 'new-org',
      });

      // Mock setLogo to reject with an error
      createdOrg.setLogo = vi.fn().mockRejectedValue(new Error('Logo upload failed'));

      fixtures.clerk.createOrganization.mockReturnValue(Promise.resolve(createdOrg));

      const { findByRole, findByLabelText } = render(<TaskChooseOrganization />, { wrapper });

      const nameInput = await findByLabelText(/name/i);
      await userEvent.type(nameInput, 'new org');

      const submitButton = await findByRole('button', { name: /continue/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(fixtures.clerk.setActive).toHaveBeenCalledWith(
          expect.objectContaining({
            organization: createdOrg,
          }),
        );
      });
    });
  });
});
