import type { OrganizationJSON } from '@clerk/shared/types';
import { act, screen, waitFor, within } from '@testing-library/react';
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
import { MosaicProvider } from '../../../mosaic-provider';
import { OrganizationProfileGeneralPanel } from '../organization-profile-general-panel';

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
  it('hides without an active organization', async () => {
    const { container } = await renderPanel(signedIn({ activeOrganizationId: null }));
    expect(container).toBeEmptyDOMElement();
  });

  it('shows details and danger but omits mutation controls without manage permission', async () => {
    await renderPanel(signedIn({ permissions: [] }));
    expect(await screen.findByRole('heading', { name: 'Organization details' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Danger zone' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Edit name' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Edit slug' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Upload' })).toBeNull();
  });

  it('hides slug when disabled and allows an enabled empty slug to be edited', async () => {
    await renderPanel(signedIn({ organizations: [fapiOrganization({ id: 'org_1', name: 'Acme', slug: '' })] }));
    expect(await screen.findByRole('button', { name: 'Edit slug' })).toBeVisible();
  });

  it('omits the slug row when disabled', async () => {
    await renderPanel(signedIn({ slugDisabled: true }));
    expect(await screen.findByRole('heading', { name: 'Organization details' })).toBeVisible();
    expect(screen.queryByText('Slug')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Edit slug' })).toBeNull();
  });

  it('updates only the changed name and shows the refreshed value', async () => {
    const { fapi } = await renderPanel();
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Edit name' }));
    const dialog = screen.getByRole('dialog');
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
    await user.click(await screen.findByRole('button', { name: 'Edit name' }));
    await user.type(within(screen.getByRole('dialog')).getByRole('textbox', { name: 'Name' }), ' changed');
    await act(() => clerk.setActive({ organization: other.id }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await user.click(await screen.findByRole('button', { name: 'Edit name' }));
    expect(within(screen.getByRole('dialog')).getByRole('textbox', { name: 'Name' })).toHaveValue('Other');
  });

  it('clears the slug while preserving the current name', async () => {
    const { fapi } = await renderPanel();
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Edit slug' }));
    const dialog = screen.getByRole('dialog');
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

  it('keeps a failed name draft and a field error, then resets after cancel', async () => {
    await renderPanel();
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Edit name' }));
    const dialog = screen.getByRole('dialog');
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
    await user.click(screen.getByRole('button', { name: 'Edit name' }));
    expect(within(screen.getByRole('dialog')).getByRole('textbox', { name: 'Name' })).toHaveValue('Acme');
    await user.clear(within(screen.getByRole('dialog')).getByRole('textbox', { name: 'Name' }));
    await user.type(within(screen.getByRole('dialog')).getByRole('textbox', { name: 'Name' }), 'Acme retry');
    const retry = serveFapi(signedIn());
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(retry.memberships[0]?.organization.name).toBe('Acme retry'));
  });

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
    expect(screen.getByRole('button', { name: 'Manage logo' })).toBeDisabled();
    upload.release();
    await waitFor(() => expect(fapi.memberships[0]?.organization.has_image).toBe(true));
    const manage = await screen.findByRole('button', { name: 'Manage logo' });
    await user.click(manage);
    const remove = holdRequests('post', '/v1/organizations/:organizationId/logo');
    await user.click(await screen.findByRole('menuitem', { name: 'Remove logo' }));
    await waitFor(() => expect(remove.requests).toHaveLength(1));
    expect(manage).toBeDisabled();
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
    const upload = holdRequests('post', '/v1/organizations/:organizationId/logo');
    await user.upload(input, new File(['image'], 'logo.png', { type: 'image/png' }));
    await waitFor(() => expect(upload.requests).toHaveLength(1));
    upload.fail('image_invalid', 'Server rejected logo');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Upload' })).toBeVisible());
    await waitFor(() => expect(screen.getByText('Server rejected logo')).toBeVisible());
    const retry = serveFapi(signedIn());
    await user.upload(input, new File(['image2'], 'second.png', { type: 'image/png' }));
    await waitFor(() => expect(retry.memberships[0]?.organization.has_image).toBe(true));
    expect(await screen.findByRole('button', { name: 'Manage logo' })).toBeVisible();
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
    await user.click(await screen.findByRole('button', { name: 'Edit slug' }));
    const dialog = screen.getByRole('dialog');
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

  it.todo('shows verified domains when enabled and the member can read them');
});
