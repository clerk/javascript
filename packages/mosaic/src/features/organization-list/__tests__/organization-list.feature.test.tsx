import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { type FakeFapiSeed, holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnvironment,
  fapiInvitation,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiSuggestion,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import type { OrganizationListProps } from '../organization-list';
import { OrganizationList } from '../organization-list';

const acme = fapiOrganization({ id: 'org_1', name: 'Acme', slug: 'acme' });
const other = fapiOrganization({ id: 'org_2', name: 'Other', slug: 'other' });
const gamma = fapiOrganization({ id: 'org_3', name: 'Gamma', slug: 'gamma' });
const beta = fapiOrganization({ id: 'org_4', name: 'Beta', slug: 'beta' });

function signedIn({
  createOrganizationEnabled = true,
  ...overrides
}: FakeFapiSeed & { createOrganizationEnabled?: boolean } = {}): FakeFapiSeed {
  const alice = fapiUser({ id: 'user_1', first_name: 'Alice', create_organization_enabled: createOrganizationEnabled });
  return {
    environment: fapiEnvironment({ display_config: { after_create_organization_url: '/dashboard' } }),
    client: fapiClient([fapiSession({ id: 'sess_1', user: alice, last_active_organization_id: 'org_1' })]),
    memberships: [fapiMembership(acme), fapiMembership(other)],
    invitations: [fapiInvitation('inv_1', gamma)],
    suggestions: [fapiSuggestion('sug_1', beta)],
    ...overrides,
  };
}

async function renderOrganizationList(seed: FakeFapiSeed = signedIn(), props: OrganizationListProps = {}) {
  const fapi = serveFapi(seed);
  const view = await renderWithClerk(<OrganizationList {...props} />);
  await waitFor(() => expect(screen.queryByText('Loading organizations…')).toBeNull());
  return { ...view, fapi };
}

const activeOrganizationId = (fapi: ReturnType<typeof serveFapi>) =>
  fapi.client.sessions.find(session => session.id === 'sess_1')?.last_active_organization_id ?? null;

async function enabledButton(name: string) {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).not.toHaveAttribute('aria-disabled', 'true'));
  return button;
}

describe('OrganizationList', () => {
  describe('availability', () => {
    it('renders nothing when nobody is signed in', async () => {
      serveFapi(signedIn({ client: fapiClient() }));
      const { container } = await renderWithClerk(<OrganizationList />);

      await waitFor(() => expect(container).toBeEmptyDOMElement());
    });

    it('renders the fallback until Clerk loads', async () => {
      serveFapi(signedIn());
      const view = renderWithClerk(<OrganizationList fallback={<p>Loading…</p>} />);

      expect(await screen.findByText('Loading…')).toBeVisible();
      await view;
      expect(await screen.findByRole('heading', { name: 'Choose an account' })).toBeVisible();
      expect(screen.queryByText('Loading…')).toBeNull();
    });

    it('holds the rows in place until the first page of every list lands', async () => {
      serveFapi(signedIn());
      const memberships = holdRequests('get', '/v1/me/organization_memberships');
      await renderWithClerk(<OrganizationList />);

      await waitFor(() => expect(memberships.requests).toHaveLength(1));
      expect(screen.getByRole('status')).toHaveTextContent('Loading organizations…');
      expect(screen.queryByRole('button', { name: 'Acme' })).toBeNull();

      memberships.release();
      expect(await screen.findByRole('button', { name: 'Acme' })).toBeVisible();
    });
  });

  describe('listing', () => {
    it('lists the personal account, memberships, invitations and suggestions', async () => {
      await renderOrganizationList();

      expect(screen.getByRole('heading', { name: 'Choose an account' })).toBeVisible();
      expect(screen.getByText('to continue to Acme')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Personal account' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Acme' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Other' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Join' })).toHaveAccessibleDescription('Gamma');
      expect(screen.getByRole('button', { name: 'Request to join' })).toHaveAccessibleDescription('Beta');
    });

    it('leaves the personal account out with hidePersonal', async () => {
      await renderOrganizationList(signedIn(), { hidePersonal: true });

      expect(screen.getByRole('heading', { name: 'Choose an organization' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Acme' })).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Personal account' })).toBeNull();
    });

    it('leaves the personal account out when the instance forces an organization', async () => {
      const seed = signedIn();
      seed.environment = fapiEnvironment({ organization_settings: { force_organization_selection: true } });
      await renderOrganizationList(seed);

      expect(screen.getByRole('heading', { name: 'Choose an organization' })).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Personal account' })).toBeNull();
    });
  });

  describe('selecting an account', () => {
    it('makes the organization active and goes to afterSelectOrganizationUrl', async () => {
      const { fapi, navigate } = await renderOrganizationList(signedIn(), {
        afterSelectOrganizationUrl: '/orgs/:slug',
      });
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: 'Other' }));

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/orgs/other'));
      expect(activeOrganizationId(fapi)).toBe('org_2');
    });

    it('leaves the active organization for the personal account and goes to afterSelectPersonalUrl', async () => {
      const { fapi, navigate } = await renderOrganizationList(signedIn(), { afterSelectPersonalUrl: '/users/:id' });
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: 'Personal account' }));

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/users/user_1'));
      expect(activeOrganizationId(fapi)).toBeNull();
    });

    it('explains an organization the user can no longer reach, and offers to create one', async () => {
      await renderOrganizationList();
      const touch = holdRequests('post', '/v1/client/sessions/:id/touch');
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: 'Other' }));
      await waitFor(() => expect(touch.requests).toHaveLength(1));
      touch.fail('organization_not_found_or_unauthorized');

      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent(
          'You are no longer a member of this organization. Please choose or create another one.',
        ),
      );
    });

    it('explains an organization the user can no longer reach, without offering to create one', async () => {
      await renderOrganizationList(signedIn({ createOrganizationEnabled: false }));
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
  });

  describe('joining an organization', () => {
    it('accepts an invitation in place, after which the organization can be selected', async () => {
      const { fapi, navigate } = await renderOrganizationList(signedIn(), {
        afterSelectOrganizationUrl: '/orgs/:slug',
      });
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: 'Join' }));
      await user.click(await enabledButton('Gamma'));

      expect(fapi.invitations[0]?.status).toBe('accepted');
      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/orgs/gamma'));
    });

    it('requests to join a suggested organization, then waits on approval', async () => {
      const { fapi } = await renderOrganizationList();
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: 'Request to join' }));

      expect(await screen.findByText('Pending approval')).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Request to join' })).toBeNull();
      expect(fapi.suggestions[0]?.status).toBe('accepted');
    });

    it('stands the other rows down while one action runs, and shows why it failed', async () => {
      await renderOrganizationList();
      const accept = holdRequests('post', '/v1/me/organization_invitations/:id/accept');
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: 'Join' }));
      await waitFor(() => expect(accept.requests).toHaveLength(1));
      expect(screen.getByRole('button', { name: 'Acme' })).toHaveAttribute('aria-disabled', 'true');
      expect(screen.getByRole('button', { name: 'Request to join' })).toHaveAttribute('aria-disabled', 'true');

      accept.fail('organization_invitation_not_pending');

      await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('This invitation is no longer pending.'));
      expect(await enabledButton('Acme')).toBeVisible();
    });
  });

  describe('creating an organization', () => {
    it('opens the create form in place of the list, and returns to it on cancel', async () => {
      await renderOrganizationList();
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: 'Create organization' }));
      expect(await screen.findByRole('heading', { name: 'Create organization' })).toBeVisible();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(await screen.findByRole('heading', { name: 'Choose an account' })).toBeVisible();
    });

    it('creates the organization, goes to afterCreateOrganizationUrl and lists it', async () => {
      const { fapi, navigate } = await renderOrganizationList(signedIn(), { skipInvitationScreen: true });
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: 'Create organization' }));
      await user.type(await screen.findByRole('textbox', { name: 'Name' }), 'Initech');
      await user.click(screen.getByRole('button', { name: 'Create organization' }));

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard'));
      expect(await screen.findByRole('button', { name: 'Initech' })).toBeVisible();
      expect(activeOrganizationId(fapi)).toBe(fapi.memberships.at(-1)?.organization.id);
    });

    it('starts on the create form, with no way back, when there is nothing to list', async () => {
      await renderOrganizationList(signedIn({ memberships: [], invitations: [], suggestions: [] }), {
        hidePersonal: true,
      });

      expect(await screen.findByRole('heading', { name: 'Create organization' })).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
    });

    it('offers no create button when the user cannot create organizations', async () => {
      await renderOrganizationList(signedIn({ createOrganizationEnabled: false }));

      expect(screen.getByRole('button', { name: 'Acme' })).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Create organization' })).toBeNull();
    });
  });
});
