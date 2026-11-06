import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { type FakeFapiSeed, holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEmailAddress,
  fapiEnvironment,
  fapiInvitation,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { TaskChooseOrganization } from '../task-choose-organization';

const acme = fapiOrganization({ id: 'org_1', name: 'Acme', slug: 'acme' });
const other = fapiOrganization({ id: 'org_2', name: 'Other', slug: 'other' });
const gamma = fapiOrganization({ id: 'org_3', name: 'Gamma', slug: 'gamma' });

const chooseOrganization = { key: 'choose-organization' } as const;

function pending({
  createOrganizationEnabled = true,
  tasks = [chooseOrganization],
  organizations = [acme, other],
  exclusive,
  ...overrides
}: FakeFapiSeed & {
  createOrganizationEnabled?: boolean;
  tasks?: Array<{ key: 'choose-organization' | 'reset-password' | 'setup-mfa' }>;
  organizations?: Array<typeof acme>;
  exclusive?: typeof acme;
} = {}): FakeFapiSeed {
  const memberships = exclusive
    ? [fapiMembership({ ...exclusive, exclusive_membership: true })]
    : organizations.map(organization => fapiMembership(organization));
  const alice = fapiUser({
    id: 'user_1',
    first_name: 'Alice',
    email_addresses: [fapiEmailAddress({ id: 'email_1', email_address: 'alice@example.com' })],
    create_organization_enabled: createOrganizationEnabled,
    organization_memberships: memberships,
  });
  return {
    environment: fapiEnvironment({ organization_settings: { force_organization_selection: true } }),
    client: fapiClient([fapiSession({ id: 'sess_1', user: alice, status: 'pending', tasks })]),
    memberships,
    ...overrides,
  };
}

async function renderTask(seed: FakeFapiSeed = pending()) {
  const fapi = serveFapi(seed);
  const view = await renderWithClerk(<TaskChooseOrganization redirectUrlComplete='/done' />);
  await waitFor(() => expect(screen.queryByText('Loading organizations…')).toBeNull());
  return { ...view, fapi };
}

const session = (fapi: ReturnType<typeof serveFapi>) => fapi.client.sessions.find(s => s.id === 'sess_1');

describe('TaskChooseOrganization', () => {
  describe('availability', () => {
    it('renders nothing when nobody is signed in', async () => {
      serveFapi(pending({ client: fapiClient() }));
      const { container } = await renderWithClerk(<TaskChooseOrganization redirectUrlComplete='/done' />);

      await waitFor(() => expect(container).toBeEmptyDOMElement());
    });

    it('sends the user on when the session has no organization to choose', async () => {
      const { navigate, container } = await renderTask(pending({ tasks: [] }));

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/done'));
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('choosing an organization', () => {
    it('makes the selected organization active and finishes the task', async () => {
      const { fapi, navigate } = await renderTask();
      const user = userEvent.setup();

      expect(screen.getByRole('heading', { name: 'Choose an organization' })).toBeVisible();
      expect(screen.getByText('Join an existing organization or create a new one')).toBeVisible();

      await user.click(screen.getByRole('button', { name: 'Other' }));

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/done'));
      expect(session(fapi)?.last_active_organization_id).toBe('org_2');
      expect(session(fapi)?.status).toBe('active');
    });

    it('goes on to the next task when one remains', async () => {
      const { navigate } = await renderTask(pending({ tasks: [chooseOrganization, { key: 'setup-mfa' }] }));
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: 'Acme' }));

      await waitFor(() => expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/tasks/setup-mfa')));
      expect(navigate).not.toHaveBeenCalledWith('/done');
    });

    it('holds the list still and disables the other rows while selecting', async () => {
      await renderTask();
      const touch = holdRequests('post', '/v1/client/sessions/:id/touch');
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: 'Other' }));
      await waitFor(() => expect(touch.requests).toHaveLength(1));

      expect(screen.getByRole('button', { name: /Other/ })).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByRole('button', { name: 'Acme' })).toHaveAttribute('aria-disabled', 'true');
      touch.release();
    });

    it('explains an organization the user can no longer reach', async () => {
      await renderTask(pending({ createOrganizationEnabled: false }));
      const touch = holdRequests('post', '/v1/client/sessions/:id/touch');
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: 'Other' }));
      await waitFor(() => expect(touch.requests).toHaveLength(1));
      touch.fail('organization_not_found_or_unauthorized');

      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent(
          'You are no longer a member of this organization. Please choose another one.',
        ),
      );
    });

    it('lists invitations to join', async () => {
      await renderTask(pending({ invitations: [fapiInvitation('inv_1', gamma)] }));

      expect(screen.getByText('Gamma')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Join' })).toBeVisible();
    });
  });

  describe('an exclusive member', () => {
    it('activates their organization without asking', async () => {
      const { fapi, navigate } = await renderTask(pending({ exclusive: acme }));

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/done'));
      expect(session(fapi)?.last_active_organization_id).toBe('org_1');
    });

    it('falls back to the list when activating fails', async () => {
      serveFapi(pending({ exclusive: acme }));
      const touch = holdRequests('post', '/v1/client/sessions/:id/touch');
      const { navigate } = await renderWithClerk(<TaskChooseOrganization redirectUrlComplete='/done' />);

      await waitFor(() => expect(touch.requests).toHaveLength(1));
      touch.fail('organization_not_found_or_unauthorized');

      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent(
          'You are no longer a member of this organization. Please choose or create another one.',
        ),
      );
      expect(screen.getByRole('button', { name: 'Acme' })).toBeVisible();
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('creating an organization', () => {
    it('switches to the create form and back', async () => {
      await renderTask();
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: 'Create new organization' }));
      expect(await screen.findByRole('heading', { name: 'Create organization' })).toBeVisible();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(await screen.findByRole('heading', { name: 'Choose an organization' })).toBeVisible();
    });

    it('starts on the create form, with no way back, when there is nothing to list', async () => {
      await renderTask(pending({ organizations: [] }));

      expect(await screen.findByRole('heading', { name: 'Create organization' })).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
    });

    it('makes the new organization active and finishes the task', async () => {
      const { fapi, navigate } = await renderTask(pending({ organizations: [] }));
      const user = userEvent.setup();

      await user.type(await screen.findByRole('textbox', { name: 'Name' }), 'Initech');
      await user.click(screen.getByRole('button', { name: 'Create organization' }));

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/done'));
      expect(session(fapi)?.last_active_organization_id).toBe(fapi.memberships.at(-1)?.organization.id);
      expect(fapi.memberships.at(-1)?.organization.name).toBe('Initech');
    });

    it('fills the form from the organization creation defaults and shows their advisory', async () => {
      await renderTask(
        pending({
          organizations: [],
          environment: fapiEnvironment({
            organization_settings: {
              force_organization_selection: true,
              organization_creation_defaults: { enabled: true },
            },
          }),
          organizationCreationDefaults: {
            object: 'organization_creation_defaults',
            id: '',
            advisory: {
              code: 'organization_already_exists',
              severity: 'warning',
              meta: { organization_name: 'Initech', organization_domain: 'initech.com' },
            },
            form: { name: 'Initech', slug: 'initech', logo: null, blur_hash: null },
          },
        }),
      );

      expect(await screen.findByRole('textbox', { name: 'Name' })).toHaveValue('Initech');
      expect(screen.getByRole('textbox', { name: 'Slug' })).toHaveValue('initech');
      expect(
        screen.getByText(
          'An organization already exists for the detected company name (Initech) and initech.com. Join by invitation.',
        ),
      ).toBeVisible();
    });

    it('offers no create button when the user cannot create organizations', async () => {
      await renderTask(pending({ createOrganizationEnabled: false }));

      expect(screen.getByText('Join an existing organization')).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Create new organization' })).toBeNull();
    });

    it('explains that an invitation is needed when there is nothing to list and nothing to create', async () => {
      await renderTask(pending({ createOrganizationEnabled: false, organizations: [] }));

      expect(await screen.findByRole('heading', { name: 'You must belong to an organization' })).toBeVisible();
      expect(screen.getByText('Contact your organization admin for an invitation.')).toBeVisible();
    });
  });

  describe('signing out', () => {
    it('names the signed-in user and signs them out', async () => {
      const { fapi, navigate } = await renderTask();
      const user = userEvent.setup();

      expect(screen.getByText('Signed in as alice@example.com')).toBeVisible();
      await user.click(screen.getByRole('button', { name: 'Sign out' }));

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/'));
      expect(fapi.client.sessions).toHaveLength(0);
    });
  });
});
