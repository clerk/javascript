import type { OrganizationJSON } from '@clerk/shared/types';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { openDialog } from '../../__tests__/feature/dialog';
import { type FakeFapiSeed, holdRequests, serveFapi } from '../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnvironment,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiUser,
} from '../../__tests__/feature/fapi';
import { renderWithClerk } from '../../__tests__/feature/render';
import { MosaicProvider } from '../../mosaic-provider';
import { OrganizationProfileProvider } from './organization-profile.provider';
import { OrganizationProfileDangerSection } from './organization-profile-danger-section/organization-profile-danger-section';
import { OrganizationProfileGeneralPanel } from './organization-profile-general-panel';
import { OrganizationProfileProfileSection } from './organization-profile-profile-section/organization-profile-profile-section';

const acme = fapiOrganization({ id: 'org_1', name: 'Acme', slug: 'acme' });

function signedIn({
  organizations = [acme],
  permissions = ['org:sys_profile:manage'],
  activeOrganizationId = organizations[0]?.id ?? null,
  slugDisabled = false,
}: {
  organizations?: OrganizationJSON[];
  permissions?: string[];
  activeOrganizationId?: string | null;
  slugDisabled?: boolean;
} = {}) {
  const memberships = organizations.map(organization => fapiMembership(organization, { permissions }));
  const user = fapiUser({ id: 'user_1', first_name: 'Alice', organization_memberships: memberships });
  return {
    environment: fapiEnvironment({ organization_settings: { slug: { disabled: slugDisabled } } }),
    client: fapiClient([fapiSession({ id: 'sess_1', user, last_active_organization_id: activeOrganizationId })]),
    memberships,
  } satisfies FakeFapiSeed;
}

async function renderPanel(seed: FakeFapiSeed = signedIn()) {
  const fapi = serveFapi(seed);
  const view = await renderWithClerk(<OrganizationProfileGeneralPanel />);
  return { ...view, fapi };
}

describe('OrganizationProfileGeneralPanel', () => {
  describe('availability', () => {
    it('keeps the title and hides every section without an active organization', async () => {
      await renderPanel(signedIn({ activeOrganizationId: null }));
      expect(await screen.findByRole('heading', { name: 'General', level: 2 })).toBeVisible();
      expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
    });

    it('renders the given sections in order instead of the defaults', async () => {
      serveFapi(signedIn());
      await renderWithClerk(
        <OrganizationProfileGeneralPanel>
          <OrganizationProfileDangerSection />
          <OrganizationProfileProfileSection />
        </OrganizationProfileGeneralPanel>,
      );
      await screen.findByRole('heading', { name: 'Organization details' });
      expect(screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent)).toEqual([
        'Danger zone',
        'Organization details',
      ]);
    });

    it('shows the section fallback while the organization loads', async () => {
      serveFapi(signedIn());
      const loading = renderWithClerk(
        <OrganizationProfileGeneralPanel>
          <OrganizationProfileProfileSection fallback={<p>Loading details</p>} />
        </OrganizationProfileGeneralPanel>,
      );
      try {
        expect(screen.getByText('Loading details')).toBeInTheDocument();
      } finally {
        await loading;
      }
      expect(await screen.findByRole('heading', { name: 'Organization details' })).toBeVisible();
      expect(screen.queryByText('Loading details')).toBeNull();
    });

    it('shows details and danger but omits mutation controls without manage permission', async () => {
      await renderPanel(signedIn({ permissions: [] }));
      expect(await screen.findByRole('heading', { name: 'Organization details' })).toBeVisible();
      expect(screen.getByRole('heading', { name: 'Danger zone' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Copy slug' })).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Edit name' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Edit slug' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Upload' })).toBeNull();
    });

    it('allows an empty slug to be edited without offering to copy it', async () => {
      await renderPanel(signedIn({ organizations: [fapiOrganization({ id: 'org_1', name: 'Acme', slug: '' })] }));
      expect(await screen.findByRole('button', { name: 'Edit slug' })).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Copy slug' })).toBeNull();
    });

    it('omits the slug row when disabled', async () => {
      await renderPanel(signedIn({ slugDisabled: true }));
      expect(await screen.findByRole('heading', { name: 'Organization details' })).toBeVisible();
      expect(screen.queryByText('Slug')).toBeNull();
      expect(screen.queryByRole('button', { name: 'Edit slug' })).toBeNull();
    });

    it.todo('shows verified domains when enabled and the member can read them');
  });

  describe('leave', () => {
    it('sends the user to the provider url after leaving from the default sections', async () => {
      const fapi = serveFapi(signedIn());
      const { navigate } = await renderWithClerk(
        <OrganizationProfileProvider afterLeaveOrganizationUrl='/organizations'>
          <OrganizationProfileGeneralPanel />
        </OrganizationProfileProvider>,
      );
      const user = userEvent.setup();
      const dialog = await openDialog(user, await screen.findByRole('button', { name: 'Leave organization' }));

      await user.type(within(dialog).getByRole('textbox'), 'Acme');
      await user.click(within(dialog).getByRole('button', { name: 'Leave organization' }));

      await waitFor(() => expect(fapi.memberships).toHaveLength(0));
      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/organizations'));
    });
  });

  describe('edit name', () => {
    it('updates only the changed name and shows the refreshed value', async () => {
      const { fapi } = await renderPanel();
      const user = userEvent.setup();
      const dialog = await openDialog(user, await screen.findByRole('button', { name: 'Edit name' }));
      await user.clear(within(dialog).getByRole('textbox', { name: 'Name' }));
      await user.type(within(dialog).getByRole('textbox', { name: 'Name' }), 'Acme Inc');
      const update = holdRequests('post', '/v1/organizations/:organizationId');
      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
      await waitFor(() => expect(update.requests).toHaveLength(1));
      const body = new URLSearchParams(await update.requests[0]?.text());
      expect(body.get('name')).toBe('Acme Inc');
      expect(body.has('slug')).toBe(false);
      update.release();
      await waitFor(() => expect(fapi.memberships[0]?.organization.name).toBe('Acme Inc'));
      await waitFor(() => expect(screen.getByText('Acme Inc')).toBeVisible());
    });

    it('drops an open edit when the organization changes', async () => {
      const other = fapiOrganization({ id: 'org_2', name: 'Other' });
      const { clerk } = await renderPanel(signedIn({ organizations: [acme, other] }));
      const user = userEvent.setup();
      const dialog = await openDialog(user, await screen.findByRole('button', { name: 'Edit name' }));
      await user.type(within(dialog).getByRole('textbox', { name: 'Name' }), ' changed');
      await act(() => clerk.setActive({ organization: other.id }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await user.click(await screen.findByRole('button', { name: 'Edit name' }));
      expect(within(screen.getByRole('dialog')).getByRole('textbox', { name: 'Name' })).toHaveValue('Other');
    });

    it('keeps a failed name draft and a field error, then resets after cancel', async () => {
      await renderPanel();
      const user = userEvent.setup();
      const dialog = await openDialog(user, await screen.findByRole('button', { name: 'Edit name' }));
      const field = within(dialog).getByRole('textbox', { name: 'Name' });
      await user.clear(field);
      await user.type(field, 'Rejected');
      const update = holdRequests('post', '/v1/organizations/:organizationId');
      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
      await waitFor(() =>
        expect(within(dialog).getByRole('button', { name: 'Save changes' })).toHaveAttribute('aria-busy', 'true'),
      );
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      expect(dialog).toBeVisible();
      update.fail('form_param_invalid', 'Name is unavailable', 'name');
      await waitFor(() => expect(within(dialog).getByText('Name is unavailable')).toBeVisible());
      expect(field).toHaveValue('Rejected');
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      const reopened = await openDialog(user, screen.getByRole('button', { name: 'Edit name' }));
      expect(within(reopened).getByRole('textbox', { name: 'Name' })).toHaveValue('Acme');
      await user.clear(within(reopened).getByRole('textbox', { name: 'Name' }));
      await user.type(within(reopened).getByRole('textbox', { name: 'Name' }), 'Acme retry');
      const retry = serveFapi(signedIn());
      await user.click(within(reopened).getByRole('button', { name: 'Save changes' }));
      await waitFor(() => expect(retry.memberships[0]?.organization.name).toBe('Acme retry'));
    });

    it('keeps the name field accessible with a visually hidden label', async () => {
      await renderPanel();
      const user = userEvent.setup();
      const trigger = await screen.findByRole('button', { name: 'Edit name' });
      await user.click(trigger);
      const dialog = screen.getByRole('dialog', { name: 'Edit name' });
      const field = within(dialog).getByRole('textbox', { name: 'Name' });
      await waitFor(() => expect(field).toBeVisible());
      await waitFor(() => expect(field).toHaveFocus());
      expect(within(dialog).getByText('Name')).toHaveAttribute('data-visually-hidden', '');
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('requires a nonblank changed name before saving', async () => {
      await renderPanel();
      const user = userEvent.setup();
      const dialog = await openDialog(user, await screen.findByRole('button', { name: 'Edit name' }), {
        name: 'Edit name',
      });
      const field = within(dialog).getByRole('textbox', { name: 'Name' });
      await user.clear(field);
      await user.type(field, '   ');
      expect(within(dialog).getByRole('button', { name: 'Save changes' })).toHaveAttribute('aria-disabled', 'true');
    });

    it('shows the generic fallback for an unknown name error', async () => {
      await renderPanel();
      const user = userEvent.setup();
      const dialog = await openDialog(user, await screen.findByRole('button', { name: 'Edit name' }), {
        name: 'Edit name',
      });
      const field = within(dialog).getByRole('textbox', { name: 'Name' });
      await user.type(field, ' changed');
      const update = holdRequests('post', '/v1/organizations/:organizationId');
      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
      await waitFor(() => expect(update.requests).toHaveLength(1));
      update.fail('', '');
      await waitFor(() =>
        expect(within(dialog).getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.'),
      );
      expect(field).toBeValid();
    });
  });

  describe('edit slug', () => {
    it('clears the slug while preserving the current name', async () => {
      const { fapi } = await renderPanel();
      const user = userEvent.setup();
      const dialog = await openDialog(user, await screen.findByRole('button', { name: 'Edit slug' }));
      await user.clear(within(dialog).getByRole('textbox', { name: 'Slug' }));
      const update = holdRequests('post', '/v1/organizations/:organizationId');
      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
      await waitFor(() => expect(update.requests).toHaveLength(1));
      const body = new URLSearchParams(await update.requests[0]?.text());
      expect(body.get('slug')).toBe('');
      expect(body.get('name')).toBe('Acme');
      update.release();
      await waitFor(() => expect(fapi.memberships[0]?.organization.slug).toBe(''));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(fapi.memberships[0]?.organization.name).toBe('Acme');
    });

    it('keeps the slug field accessible with hidden label and explanatory copy', async () => {
      await renderPanel();
      const user = userEvent.setup();
      const trigger = await screen.findByRole('button', { name: 'Edit slug' });
      await user.click(trigger);
      const dialog = screen.getByRole('dialog', { name: 'Edit slug' });
      const field = within(dialog).getByRole('textbox', { name: 'Slug' });
      await waitFor(() => expect(field).toBeVisible());
      await waitFor(() => expect(field).toHaveFocus());
      expect(within(dialog).getByText('Slug')).toHaveAttribute('data-visually-hidden', '');
      expect(
        within(dialog).getByText(
          'A unique identifier used in organization URLs. Changing it may break existing links.',
        ),
      ).toBeVisible();
      await user.type(field, '-draft');
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await user.click(trigger);
      expect(within(screen.getByRole('dialog')).getByRole('textbox', { name: 'Slug' })).toHaveValue('acme');
    });

    it('shows a slug-specific FAPI error at the field and keeps the draft', async () => {
      await renderPanel();
      const user = userEvent.setup();
      const dialog = await openDialog(user, await screen.findByRole('button', { name: 'Edit slug' }), {
        name: 'Edit slug',
      });
      const field = within(dialog).getByRole('textbox', { name: 'Slug' });
      await user.type(field, '-new');
      const update = holdRequests('post', '/v1/organizations/:organizationId');
      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
      await waitFor(() => expect(update.requests).toHaveLength(1));
      update.fail('form_param_invalid', 'Slug is taken', 'slug');
      await waitFor(() => expect(within(dialog).getByText('Slug is taken')).toBeVisible());
      expect(field).toHaveValue('acme-new');
      expect(field).toBeInvalid();
    });

    it('localizes a global slug error and saves the retained draft on retry', async () => {
      serveFapi(signedIn());
      await renderWithClerk(
        <MosaicProvider
          localization={{ locale: 'fr-FR', overrides: { 'errors.slug_taken': 'Ce slug est indisponible.' } }}
        >
          <OrganizationProfileGeneralPanel />
        </MosaicProvider>,
      );
      const user = userEvent.setup();
      const dialog = await openDialog(user, await screen.findByRole('button', { name: 'Edit slug' }));
      const field = within(dialog).getByRole('textbox', { name: 'Slug' });
      await user.clear(field);
      await user.type(field, 'new-slug');
      const update = holdRequests('post', '/v1/organizations/:organizationId');
      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
      await waitFor(() => expect(update.requests).toHaveLength(1));
      update.fail('slug_taken', 'Server copy');
      await waitFor(() => expect(within(dialog).getByRole('alert')).toHaveTextContent('Ce slug est indisponible.'));
      expect(field).toHaveValue('new-slug');
      const retry = serveFapi(signedIn());
      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
      await waitFor(() => expect(retry.memberships[0]?.organization.slug).toBe('new-slug'));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });
  });

  describe('logo', () => {
    it('uploads and removes a logo while holding each pending action', async () => {
      const { container, fapi } = await renderPanel();
      const user = userEvent.setup();
      const input = container.querySelector('input[type="file"]');
      if (!input) {
        throw new Error('Logo upload input is missing');
      }
      const upload = holdRequests('post', '/v1/organizations/:organizationId/logo');
      await user.upload(input, new File(['image'], 'logo.png', { type: 'image/png' }));
      await waitFor(() => expect(upload.requests).toHaveLength(1));
      expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
      expect(screen.queryByRole('button', { name: 'Manage logo' })).toBeNull();
      expect(input).toBeDisabled();
      upload.release();
      await waitFor(() => expect(fapi.memberships[0]?.organization.has_image).toBe(true));
      const manage = await screen.findByRole('button', { name: 'Manage logo' });
      await user.click(manage);
      const remove = holdRequests('post', '/v1/organizations/:organizationId/logo');
      await user.click(await screen.findByRole('menuitem', { name: 'Remove logo' }));
      await waitFor(() => expect(remove.requests).toHaveLength(1));
      expect(manage).toBeEnabled();
      expect(input).toBeDisabled();
      await user.click(manage);
      await user.click(await screen.findByRole('menuitem', { name: 'Remove logo' }));
      expect(remove.requests).toHaveLength(1);
      remove.release();
      await waitFor(() => expect(fapi.memberships[0]?.organization.has_image).toBe(false));
      expect(await screen.findByRole('button', { name: 'Upload' })).toBeVisible();
    });

    it('localizes an oversized image rejection without sending a request', async () => {
      serveFapi(signedIn());
      const { container } = await renderWithClerk(
        <MosaicProvider
          localization={{ locale: 'fr-FR', overrides: { 'errors.avatar_file_size_exceeded': 'Image trop grande.' } }}
        >
          <OrganizationProfileGeneralPanel />
        </MosaicProvider>,
      );
      const user = userEvent.setup();
      const input = container.querySelector('input[type="file"]');
      if (!input) {
        throw new Error('Logo upload input is missing');
      }
      const upload = holdRequests('post', '/v1/organizations/:organizationId/logo');
      await user.upload(input, new File([new Uint8Array(10 * 1000 * 1000 + 1)], 'logo.png', { type: 'image/png' }));
      await waitFor(() => expect(screen.getByText('Image trop grande.')).toBeVisible());
      expect(upload.requests).toHaveLength(0);
      upload.release();
    });

    it('rolls back a rejected logo preview and permits another upload', async () => {
      const { container } = await renderPanel();
      const user = userEvent.setup();
      const input = container.querySelector('input[type="file"]');
      if (!input) {
        throw new Error('Logo upload input is missing');
      }
      expect(container.querySelector('img[alt="Acme"]')).toBeNull();
      const png = Uint8Array.from(
        atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/zXcAAAAASUVORK5CYII='),
        character => character.charCodeAt(0),
      );
      const upload = holdRequests('post', '/v1/organizations/:organizationId/logo');
      await user.upload(input, new File([png], 'logo.png', { type: 'image/png' }));
      await waitFor(() => expect(upload.requests).toHaveLength(1));
      await waitFor(() => expect(container.querySelector('img[alt="Acme"]')?.getAttribute('src')).toMatch(/^blob:/));
      upload.fail('image_invalid', 'Server rejected logo');
      await waitFor(() => expect(screen.getByRole('button', { name: 'Upload' })).toBeVisible());
      await waitFor(() => expect(screen.getByText('Server rejected logo')).toBeVisible());
      await waitFor(() => expect(container.querySelector('img[alt="Acme"]')).toBeNull());
      const retry = serveFapi(signedIn());
      await user.upload(input, new File(['image2'], 'second.png', { type: 'image/png' }));
      await waitFor(() => expect(retry.memberships[0]?.organization.has_image).toBe(true));
      expect(await screen.findByRole('button', { name: 'Manage logo' })).toBeVisible();
    });
  });
});
