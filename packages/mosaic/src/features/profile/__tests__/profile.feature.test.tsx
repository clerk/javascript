import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { openDialog } from '../../../__tests__/feature/dialog';
import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnvironment,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { useModal } from '../../../modals/use-modal';
import { Profile } from '../profile';
import { profileModal } from '../profile.modal';

beforeAll(() => page.viewport(1280, 800));

function OpenProfile({ page }: { page: string }) {
  const profile = useModal(profileModal);
  return <button onClick={() => profile.open({ page })}>Open profile</button>;
}

function tabNames() {
  return screen.getAllByRole('tab').map(tab => tab.textContent);
}

describe('Profile with an active organization', () => {
  const acme = fapiOrganization({ id: 'org_1', name: 'Acme' });

  function serveWithOrganization({
    permissions = ['org:sys_memberships:read'],
    userAPIKeysEnabled = false,
    orgAPIKeysEnabled = false,
    activeOrganizationId = acme.id,
  }: {
    permissions?: string[];
    userAPIKeysEnabled?: boolean;
    orgAPIKeysEnabled?: boolean;
    activeOrganizationId?: string | null;
  } = {}) {
    const memberships = [fapiMembership(acme, { permissions })];
    const user = fapiUser({ id: 'user_1', organization_memberships: memberships });
    return serveFapi({
      environment: fapiEnvironment({
        api_keys_settings: { user_api_keys_enabled: userAPIKeysEnabled, orgs_api_keys_enabled: orgAPIKeysEnabled },
      }),
      client: fapiClient([fapiSession({ id: 'sess_1', user, last_active_organization_id: activeOrganizationId })]),
      memberships,
    });
  }

  function tabsDescribedBy(description: string) {
    return screen
      .getAllByRole('tab')
      .filter(tab => tab.getAttribute('aria-describedby') !== null)
      .filter(tab => document.getElementById(tab.getAttribute('aria-describedby') ?? '')?.textContent === description)
      .map(tab => tab.textContent);
  }

  it('lists the organization pages under Organization after the account pages', async () => {
    serveWithOrganization();
    await renderWithClerk(<Profile />);
    expect(tabsDescribedBy('Account')).toEqual(['Account', 'Security']);
    expect(tabsDescribedBy('Organization')).toEqual(['General', 'Members']);
  });

  it('lists only the organization pages the user may see', async () => {
    serveWithOrganization({ permissions: [] });
    await renderWithClerk(<Profile />);
    expect(tabsDescribedBy('Organization')).toEqual(['General']);
  });

  it.each([
    { hide: true, tabs: ['General'] },
    { hide: false, tabs: ['General', 'API Keys'] },
  ])('lists the organization API keys only when they are not hidden: $hide', async ({ hide, tabs }) => {
    serveWithOrganization({ orgAPIKeysEnabled: true, permissions: ['org:sys_api_keys:read'] });
    await renderWithClerk(<Profile organizationProfileProps={{ apiKeysProps: { hide } }} />);
    expect(tabsDescribedBy('Organization')).toEqual(tabs);
  });

  it('sends the user to afterLeaveOrganizationUrl after leaving the organization', async () => {
    const fapi = serveWithOrganization();
    const { navigate } = await renderWithClerk(
      <Profile organizationProfileProps={{ afterLeaveOrganizationUrl: '/organizations' }} />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('tab', { name: 'General', description: 'Organization' }));
    const dialog = await openDialog(user, await screen.findByRole('button', { name: 'Leave organization' }), {
      role: 'alertdialog',
    });

    await user.type(within(dialog).getByRole('textbox'), 'Acme');
    await user.click(within(dialog).getByRole('button', { name: 'Leave organization' }));

    await waitFor(() => expect(fapi.memberships).toHaveLength(0));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/organizations'));
  });

  it('lists only the account pages without an active organization', async () => {
    serveWithOrganization({ activeOrganizationId: null });
    await renderWithClerk(<Profile />);
    expect(tabNames()).toEqual(['Account', 'Security']);
  });

  it('switches to an organization page from the navigation', async () => {
    serveWithOrganization();
    await renderWithClerk(<Profile />);
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Members', description: 'Organization' }));
    expect(screen.getByRole('tab', { name: 'Members', description: 'Organization' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Members' })).toBeVisible();
  });

  it('opens as a modal on the first organization page when the requested organization page is unavailable', async () => {
    serveWithOrganization({ permissions: [] });
    await renderWithClerk(<OpenProfile page='organization/members' />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Open profile' }));
    const dialog = await screen.findByRole('dialog');

    expect(await within(dialog).findByRole('tab', { name: 'General', description: 'Organization' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('opens the organization page that shares an account page name', async () => {
    serveWithOrganization();
    await renderWithClerk(
      <Profile
        organizationProfileProps={{
          customPages: [{ path: 'security', label: 'Security', content: <p>Organization security</p> }],
        }}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: 'Security', description: 'Organization' }));
    expect(screen.getByText('Organization security')).toBeVisible();
  });

  it('skips an account page whose path is an organization page id', async () => {
    serveWithOrganization();
    await renderWithClerk(
      <Profile customPages={[{ path: 'organization/general', label: 'Imposter', content: <p>Imposter content</p> }]} />,
    );

    expect(tabNames()).toEqual(['Account', 'Security', 'General', 'Members']);
    await userEvent.setup().click(screen.getByRole('tab', { name: 'General', description: 'Organization' }));
    expect(screen.getByRole('tab', { name: 'General', description: 'Organization' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.queryByText('Imposter content')).not.toBeInTheDocument();
  });

  it('passes the organization options to its pages', async () => {
    serveWithOrganization();
    await renderWithClerk(
      <Profile
        organizationProfileProps={{
          customPages: [{ path: 'audit', label: 'Audit log', content: <p>Audit content</p> }],
          pageOrder: ['audit'],
        }}
      />,
    );
    expect(tabsDescribedBy('Organization')).toEqual(['Audit log', 'General', 'Members']);
  });

  it('stays in the organization group after the open organization page leaves the navigation', async () => {
    const globex = fapiOrganization({ id: 'org_2', name: 'Globex' });
    const memberships = [
      fapiMembership(acme, { permissions: ['org:sys_memberships:read'] }),
      fapiMembership(globex, { permissions: [] }),
    ];
    const user = fapiUser({ id: 'user_1', organization_memberships: memberships });
    serveFapi({
      environment: fapiEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user, last_active_organization_id: acme.id })]),
      memberships,
    });
    const { clerk } = await renderWithClerk(<Profile />);
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Members', description: 'Organization' }));

    await act(() => clerk.setActive({ organization: globex.id }));
    await waitFor(() => expect(tabsDescribedBy('Organization')).toEqual(['General']));
    await act(() => clerk.setActive({ organization: acme.id }));
    await waitFor(() => expect(tabsDescribedBy('Organization')).toEqual(['General', 'Members']));

    expect(screen.getByRole('tab', { name: 'General', description: 'Organization' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('stays on the organization page when the next organization lists it too', async () => {
    const globex = fapiOrganization({ id: 'org_2', name: 'Globex' });
    const memberships = [
      fapiMembership(acme, { permissions: ['org:sys_memberships:read'] }),
      fapiMembership(globex, { permissions: ['org:sys_memberships:read'] }),
    ];
    const user = fapiUser({ id: 'user_1', organization_memberships: memberships });
    serveFapi({
      environment: fapiEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user, last_active_organization_id: acme.id })]),
      memberships,
    });
    const { clerk } = await renderWithClerk(<Profile />);
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Members', description: 'Organization' }));

    await act(() => clerk.setActive({ organization: globex.id }));
    await waitFor(() => expect(clerk.organization?.id).toBe(globex.id));

    expect(screen.getByRole('tab', { name: 'Members', description: 'Organization' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it.each([
    { name: 'combined by default', profile: undefined, tabs: ['Account', 'Security', 'General', 'Members'] },
    {
      name: 'account only when the provider keeps profiles separate',
      profile: { combined: false },
      tabs: ['Account', 'Security'],
    },
  ])('without a mode, follows the provider: $name', async ({ profile, tabs }) => {
    serveWithOrganization();
    await renderWithClerk(<Profile />, undefined, undefined, undefined, profile);
    expect(tabNames()).toEqual(tabs);
  });

  it('lists the organization pages when the mode is combined, whatever the provider says', async () => {
    serveWithOrganization();
    await renderWithClerk(<Profile mode='combined' />, undefined, undefined, undefined, { combined: false });
    expect(tabsDescribedBy('Organization')).toEqual(['General', 'Members']);
  });

  it('lists only the account pages in user mode', async () => {
    serveWithOrganization();
    await renderWithClerk(<Profile mode='user' />);
    expect(tabNames()).toEqual(['Account', 'Security']);
  });

  it('lists only the organization pages in organization mode', async () => {
    serveWithOrganization();
    await renderWithClerk(<Profile mode='organization' />);
    expect(tabNames()).toEqual(['General', 'Members']);
  });

  it('leaves out the organization pages when the provider keeps profiles separate, even with organization options', async () => {
    serveWithOrganization();
    await renderWithClerk(
      <Profile organizationProfileProps={{ pageOrder: ['members'] }} />,
      undefined,
      undefined,
      undefined,
      { combined: false },
    );
    expect(tabNames()).toEqual(['Account', 'Security']);
  });

  it("adds the provider's pages to both groups", async () => {
    serveWithOrganization();
    await renderWithClerk(<Profile />, undefined, undefined, undefined, {
      userProfileProps: { customPages: [{ path: 'usage', label: 'Usage', content: <p>Usage</p> }] },
      organizationProfileProps: { customPages: [{ path: 'audit', label: 'Audit log', content: <p>Audit</p> }] },
    });
    expect(tabsDescribedBy('Account')).toEqual(['Account', 'Security', 'Usage']);
    expect(tabsDescribedBy('Organization')).toEqual(['General', 'Members', 'Audit log']);
  });
});
