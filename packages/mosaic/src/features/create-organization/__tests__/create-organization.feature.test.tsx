import type { RoleJSON } from '@clerk/shared/types';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { type FakeFapiSeed, holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnvironment,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import type { CreateOrganizationProps } from '../create-organization';
import { CreateOrganization } from '../create-organization';

const adminRole: RoleJSON = {
  object: 'role',
  id: 'role_admin',
  key: 'org:admin',
  name: 'Admin',
  description: '',
  permissions: [],
  created_at: 0,
  updated_at: 0,
};
const memberRole: RoleJSON = { ...adminRole, id: 'role_member', key: 'org:member', name: 'Member' };

type User = ReturnType<typeof userEvent.setup>;
type EnvironmentOverrides = Parameters<typeof fapiEnvironment>[0];

function signedIn(environment: EnvironmentOverrides = {}): FakeFapiSeed {
  const alice = fapiUser({ id: 'user_1', first_name: 'Alice' });
  return {
    environment: fapiEnvironment({
      display_config: { after_create_organization_url: '/dashboard' },
      ...environment,
    }),
    client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]),
    roles: [adminRole, memberRole],
  };
}

async function renderCreateOrganization(seed: FakeFapiSeed = signedIn(), props: CreateOrganizationProps = {}) {
  const fapi = serveFapi(seed);
  const view = await renderWithClerk(<CreateOrganization {...props} />);
  return { ...view, fapi };
}

async function create(user: User, name: string) {
  await user.type(await screen.findByRole('textbox', { name: 'Name' }), name);
  await user.click(screen.getByRole('button', { name: 'Create organization' }));
}

const activeOrganizationId = (fapi: ReturnType<typeof serveFapi>) =>
  fapi.client.sessions.find(session => session.id === 'sess_1')?.last_active_organization_id;

describe('CreateOrganization', () => {
  describe('availability', () => {
    it('renders nothing when nobody is signed in', async () => {
      const { container } = await renderCreateOrganization({ client: fapiClient() });

      await waitFor(() => expect(container).toBeEmptyDOMElement());
    });

    it('renders the fallback until Clerk loads', async () => {
      serveFapi(signedIn());
      const view = renderWithClerk(<CreateOrganization fallback={<p>Loading…</p>} />);

      expect(await screen.findByText('Loading…')).toBeVisible();
      await view;
      expect(await screen.findByRole('heading', { name: 'Create organization' })).toBeVisible();
      expect(screen.queryByText('Loading…')).toBeNull();
    });
  });

  describe('creating an organization', () => {
    it('creates the organization from the name and the slug it suggests, then makes it active', async () => {
      const { fapi } = await renderCreateOrganization();
      const user = userEvent.setup();

      await create(user, 'Acme Inc');

      expect(screen.getByRole('textbox', { name: 'Slug' })).toHaveValue('acme-inc');
      expect(await screen.findByRole('heading', { name: 'Invite new members' })).toBeVisible();
      const [membership] = fapi.memberships;
      expect(membership?.organization).toMatchObject({ name: 'Acme Inc', slug: 'acme-inc' });
      expect(activeOrganizationId(fapi)).toBe(membership?.organization.id);
    });

    it('keeps the submit button disabled until a name is entered', async () => {
      await renderCreateOrganization();

      expect(await screen.findByRole('button', { name: 'Create organization' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    it('leaves the slug out when the instance does not use slugs', async () => {
      const { fapi } = await renderCreateOrganization(
        signedIn({ organization_settings: { slug: { disabled: true } } }),
      );
      const user = userEvent.setup();

      await create(user, 'Acme Inc');

      expect(screen.queryByRole('textbox', { name: 'Slug' })).toBeNull();
      expect(await screen.findByRole('heading', { name: 'Invite new members' })).toBeVisible();
      expect(fapi.memberships[0]?.organization.slug).toBe('');
    });

    it('rejects a slug with characters a slug cannot hold', async () => {
      const { fapi } = await renderCreateOrganization();
      const user = userEvent.setup();

      await user.type(await screen.findByRole('textbox', { name: 'Name' }), 'Acme');
      const slug = screen.getByRole('textbox', { name: 'Slug' });
      await user.clear(slug);
      await user.type(slug, 'Acme Inc');
      await user.tab();

      expect(await screen.findByText('Use lowercase letters, numbers and hyphens only.')).toBeVisible();
      await user.click(screen.getByRole('button', { name: 'Create organization' }));
      expect(fapi.memberships).toEqual([]);
    });

    it('shows the server error on the slug and stays on the form', async () => {
      const seed = signedIn();
      seed.memberships = [fapiMembership(fapiOrganization({ id: 'org_taken', name: 'Taken', slug: 'acme' }))];
      await renderCreateOrganization(seed);
      const user = userEvent.setup();

      await create(user, 'Acme');

      expect(await screen.findByText('This slug is taken. Please try another.')).toBeVisible();
      expect(screen.getByRole('heading', { name: 'Create organization' })).toBeVisible();
    });

    it('holds the form while the organization is being created', async () => {
      await renderCreateOrganization();
      const user = userEvent.setup();
      const hold = holdRequests('post', '/v1/organizations');

      await create(user, 'Acme');

      await waitFor(() =>
        expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('aria-disabled', 'true'),
      );
      hold.release();
      expect(await screen.findByRole('heading', { name: 'Invite new members' })).toBeVisible();
    });

    it('shows an error that names no field above the form and keeps the values', async () => {
      const { fapi } = await renderCreateOrganization();
      const user = userEvent.setup();
      const hold = holdRequests('post', '/v1/organizations');

      await create(user, 'Acme');
      hold.fail('organization_quota_exceeded', 'You have reached your limit of organizations.');

      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('You have reached your limit of organizations.'),
      );
      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Acme');
      expect(fapi.memberships).toEqual([]);
    });

    it('uploads the chosen logo to the new organization', async () => {
      const { fapi } = await renderCreateOrganization();
      const user = userEvent.setup();
      const input = await waitFor(() => {
        const element = document.querySelector<HTMLInputElement>('input[type="file"]');
        expect(element).not.toBeNull();
        return element as HTMLInputElement;
      });

      await user.upload(input, new File(['logo'], 'logo.png', { type: 'image/png' }));
      expect(screen.getByRole('button', { name: 'Remove' })).toBeVisible();
      await create(user, 'Acme');

      expect(await screen.findByRole('heading', { name: 'Invite new members' })).toBeVisible();
      expect(fapi.memberships[0]?.organization.has_image).toBe(true);
    });
  });

  describe('finishing', () => {
    it('skips the invitations and follows afterCreateOrganizationUrl when skipInvitationScreen is set', async () => {
      const { navigate } = await renderCreateOrganization(signedIn(), {
        skipInvitationScreen: true,
        afterCreateOrganizationUrl: '/orgs/:slug',
      });
      const user = userEvent.setup();

      await create(user, 'Acme Inc');

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/orgs/acme-inc'));
      expect(screen.queryByRole('heading', { name: 'Invite new members' })).toBeNull();
    });

    it('skips the invitations when the organization holds a single member', async () => {
      const { navigate } = await renderCreateOrganization(
        signedIn({
          organization_settings: {
            enabled: true,
            max_allowed_memberships: 1,
            force_organization_selection: false,
            actions: { admin_delete: true },
            domains: { enabled: false, enrollment_modes: [], default_role: null },
            slug: { disabled: false },
            organization_creation_defaults: { enabled: false },
          },
        }),
      );
      const user = userEvent.setup();

      await create(user, 'Acme');

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard'));
    });

    it('goes to the instance after-create url when the invitations are skipped', async () => {
      const { fapi, navigate } = await renderCreateOrganization();
      const user = userEvent.setup();

      await create(user, 'Acme');
      await user.click(await screen.findByRole('button', { name: 'Skip' }));

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard'));
      expect(fapi.organizationInvitations).toEqual([]);
    });
  });

  describe('inviting members', () => {
    it('sends invitations to the new organization, then finishes', async () => {
      const { fapi, navigate } = await renderCreateOrganization();
      const user = userEvent.setup();

      await create(user, 'Acme');
      const email = await screen.findByRole('textbox', { name: 'Email' });
      await user.type(email, 'grace@example.com{Enter}');
      await user.click(screen.getByRole('combobox', { name: /Role/ }));
      await user.click(await screen.findByRole('option', { name: 'Member' }));
      await user.click(screen.getByRole('button', { name: 'Send invitations' }));

      expect(await screen.findByRole('heading', { name: 'Invitations sent' })).toBeVisible();
      expect(fapi.organizationInvitations.map(item => [item.email_address, item.role])).toEqual([
        ['grace@example.com', 'org:member'],
      ]);
      await user.click(screen.getByRole('button', { name: 'Finish' }));
      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard'));
    });

    it('starts on the instance default role', async () => {
      await renderCreateOrganization(
        signedIn({
          organization_settings: {
            enabled: true,
            max_allowed_memberships: 5,
            force_organization_selection: false,
            actions: { admin_delete: true },
            domains: { enabled: false, enrollment_modes: [], default_role: 'org:member' },
            slug: { disabled: false },
            organization_creation_defaults: { enabled: false },
          },
        }),
      );
      const user = userEvent.setup();

      await create(user, 'Acme');

      const role = await screen.findByRole('combobox', { name: /Role/ });
      await waitFor(() => expect(role).toHaveTextContent('Member'));
    });

    it('keeps the step open and reports a failed invitation', async () => {
      await renderCreateOrganization();
      const user = userEvent.setup();

      await create(user, 'Acme');
      await user.type(await screen.findByRole('textbox', { name: 'Email' }), 'grace@example.com{Enter}');
      await user.click(screen.getByRole('combobox', { name: /Role/ }));
      await user.click(await screen.findByRole('option', { name: 'Admin' }));
      const hold = holdRequests('post', '/v1/organizations/:organizationId/invitations/bulk');
      await user.click(screen.getByRole('button', { name: 'Send invitations' }));
      hold.fail('bulk_size_exceeded');

      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('You can invite up to 50 email addresses at a time.'),
      );
      expect(screen.getByRole('heading', { name: 'Invite new members' })).toBeVisible();
    });
  });
});
