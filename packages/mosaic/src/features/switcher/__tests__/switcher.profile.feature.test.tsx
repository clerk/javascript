import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import { page } from 'vitest/browser';

import { openDialog } from '../../../__tests__/feature/dialog';
import { type FakeFapiSeed, serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEmailAddress,
  fapiEnvironment,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { openMenu } from '../../../__tests__/feature/menu';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { useVirtualEntries, useVirtualWrite } from '../../../routing/virtual-store';
import { OrganizationProfile } from '../../organization-profile/organization-profile';
import { OrganizationSwitcher } from '../../organization-switcher/organization-switcher';
import { Profile } from '../../profile/profile';
import type { MosaicProfile } from '../../profile-pages/use-mosaic-profile';
import { UserButton } from '../../user-button/user-button';
import { Switcher } from '../switcher';

const acme = fapiOrganization({ id: 'org_1', name: 'Acme', members_count: 3 });
const memberships = [fapiMembership(acme, { permissions: ['org:sys_memberships:manage'] })];
const alice = fapiUser({
  id: 'user_1',
  first_name: 'Alice',
  last_name: 'Smith',
  email_addresses: [fapiEmailAddress({ id: 'idn_alice', email_address: 'alice@example.com' })],
  organization_memberships: memberships,
});

const inOrganization: FakeFapiSeed = {
  client: fapiClient([fapiSession({ id: 'sess_1', user: alice, last_active_organization_id: 'org_1' })]),
  memberships,
};
const inPersonalAccount: FakeFapiSeed = {
  client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]),
  memberships,
};

const keysMemberships = [fapiMembership(acme, { permissions: ['org:sys_api_keys:read'] })];
const withOrganizationApiKeys: FakeFapiSeed = {
  environment: fapiEnvironment({
    api_keys_settings: { user_api_keys_enabled: false, orgs_api_keys_enabled: true },
  }),
  client: fapiClient([
    fapiSession({
      id: 'sess_1',
      user: { ...alice, organization_memberships: keysMemberships },
      last_active_organization_id: 'org_1',
    }),
  ]),
  memberships: keysMemberships,
};

const terms = { label: 'Terms', path: 'terms', content: <p>Terms body</p> };
const accountTabs = ['Account', 'Security'];
const organizationTabs = ['General', 'Members'];
const allTabs = [...accountTabs, ...organizationTabs];
const separate: MosaicProfile = { combined: false };

async function renderWithProfile(
  ui: ReactElement,
  profile?: MosaicProfile,
  seed: FakeFapiSeed = inOrganization,
  experimental: { newProfiles?: boolean } = { newProfiles: true },
) {
  serveFapi(seed);
  return renderWithClerk(ui, undefined, undefined, experimental, profile);
}

const buttonTrigger = () => screen.getByRole('button', { name: /Open account menu/ });
const switcherTrigger = () => screen.getByRole('button', { name: /Open organization menu/ });
const settings = () => screen.getByRole('button', { name: 'Settings' });
const tabs = () => screen.getAllByRole('tab').map(tab => tab.textContent);
const selectedTab = (name: string) => screen.findByRole('tab', { name, selected: true });

async function clickSettings(trigger: () => HTMLElement) {
  const user = userEvent.setup();
  await user.click(trigger());
  await user.click(settings());
  return user;
}

async function chooseSetting(trigger: () => HTMLElement, label: string) {
  const user = userEvent.setup();
  await user.click(trigger());
  await openMenu(user, settings());
  await user.click(screen.getByRole('menuitem', { name: label }));
}

async function leaveOrganization() {
  const user = userEvent.setup();
  const dialog = await openDialog(user, await screen.findByRole('button', { name: 'Leave organization' }), {
    role: 'alertdialog',
  });
  await user.type(within(dialog).getByRole('textbox'), 'Acme');
  await user.click(within(dialog).getByRole('button', { name: 'Leave organization' }));
}

beforeEach(async () => {
  await page.viewport(1280, 800);
  onTestFinished(() => page.viewport(414, 896));
});

describe('the profile the switchers open', () => {
  it.each([
    { name: 'by default', profile: undefined },
    { name: 'with a combined provider', profile: { combined: true } },
    { name: 'with separate profiles', profile: separate },
  ])('a user-only button opens only the account pages: $name', async ({ profile }) => {
    await renderWithProfile(<UserButton />, profile);

    await clickSettings(buttonTrigger);

    expect(await selectedTab('Account')).toBeInTheDocument();
    expect(tabs()).toEqual(accountTabs);
  });

  it('a combined button opens one profile straight from Settings', async () => {
    await renderWithProfile(<Switcher />);

    await clickSettings(buttonTrigger);

    expect(await selectedTab('Account')).toBeInTheDocument();
    expect(tabs()).toEqual(allTabs);
  });

  it('a combined button offers two targets over separate profiles', async () => {
    await renderWithProfile(<Switcher />, separate);

    await chooseSetting(buttonTrigger, 'Manage organization');

    expect(await selectedTab('General')).toBeInTheDocument();
    expect(tabs()).toEqual(organizationTabs);
  });

  it.each([
    { name: 'by default', profile: undefined },
    { name: 'with separate profiles', profile: separate },
  ])('a lone switcher opens only the organization pages: $name', async ({ profile }) => {
    await renderWithProfile(<OrganizationSwitcher />, profile);

    await clickSettings(switcherTrigger);

    expect(await selectedTab('General')).toBeInTheDocument();
    expect(tabs()).toEqual(organizationTabs);
  });

  it.each([
    { name: 'a user-only button', button: <UserButton /> },
    { name: 'a combined button', button: <Switcher /> },
  ])('a switcher beside $name keeps its Settings row', async ({ button }) => {
    await renderWithProfile(
      <>
        <OrganizationSwitcher />
        {button}
      </>,
    );

    await clickSettings(switcherTrigger);

    expect(await selectedTab('General')).toBeInTheDocument();
    expect(tabs()).toEqual(organizationTabs);
  });

  it('leaves the organization pages out of the combined profile on a personal account', async () => {
    await renderWithProfile(<UserButton />, undefined, inPersonalAccount);

    await clickSettings(buttonTrigger);

    expect(await selectedTab('Account')).toBeInTheDocument();
    expect(tabs()).toEqual(accountTabs);
  });

  it('routes both profiles with URLs from the provider', async () => {
    const { navigate } = await renderWithProfile(<OrganizationSwitcher />, {
      userProfileUrl: '/account',
      organizationProfileUrl: '/org',
    });

    await clickSettings(switcherTrigger);

    expect(navigate).toHaveBeenCalledWith('/org');
  });

  it("hides the organization's API keys from the profile a switcher opens", async () => {
    await renderWithProfile(
      <OrganizationSwitcher />,
      { organizationProfileProps: { apiKeysProps: { hide: true } } },
      withOrganizationApiKeys,
    );

    await clickSettings(switcherTrigger);

    expect(await selectedTab('General')).toBeInTheDocument();
    expect(tabs()).toEqual(['General']);
  });

  it("hands the provider's organization options to Clerk's modal without newProfiles", async () => {
    const organizationProfileProps = { afterLeaveOrganizationUrl: '/left', apiKeysProps: { hide: true } };
    const { clerk } = await renderWithProfile(
      <OrganizationSwitcher />,
      { organizationProfileProps },
      withOrganizationApiKeys,
      {},
    );
    const openOrganizationProfile = vi.spyOn(clerk, 'openOrganizationProfile').mockImplementation(() => {});

    await clickSettings(switcherTrigger);

    expect(openOrganizationProfile).toHaveBeenCalledWith(expect.objectContaining(organizationProfileProps));
  });

  it('routes the one profile with a URL, and opens the other as a modal', async () => {
    const { navigate } = await renderWithProfile(<Switcher />, { userProfileUrl: '/account' });

    await chooseSetting(buttonTrigger, 'Manage profile');
    expect(navigate).toHaveBeenCalledWith('/account');

    await chooseSetting(buttonTrigger, 'Manage organization');
    expect(await selectedTab('General')).toBeInTheDocument();
  });

  it('opens a combined profile on the first organization page in the configured order', async () => {
    await renderWithProfile(<Switcher />, {
      userProfileUrl: '/account',
      organizationProfileProps: { customPages: [terms], pageOrder: ['terms'] },
    });

    await chooseSetting(buttonTrigger, 'Manage organization');

    expect(await selectedTab('Terms')).toBeInTheDocument();
  });

  it('skips a page this organization does not have when opening a combined profile', async () => {
    await renderWithProfile(<Switcher />, {
      userProfileUrl: '/account',
      organizationProfileProps: { pageOrder: ['apiKeys', 'members'] },
    });

    await chooseSetting(buttonTrigger, 'Manage organization');

    expect(await selectedTab('Members')).toBeInTheDocument();
  });

  it.each([
    {
      name: 'the button',
      ui: <UserButton />,
      trigger: buttonTrigger,
      expected: ['Account', 'Terms', 'Security'],
    },
    {
      name: 'the switcher',
      ui: <OrganizationSwitcher />,
      trigger: switcherTrigger,
      expected: ['Audit', 'General', 'Members'],
    },
  ])(
    'applies the custom pages and order set on the provider when $name opens it',
    async ({ ui, trigger, expected }) => {
      await renderWithProfile(ui, {
        userProfileProps: { customPages: [terms], pageOrder: ['account', 'terms'] },
        organizationProfileProps: { customPages: [{ ...terms, label: 'Audit', path: 'audit' }], pageOrder: ['audit'] },
      });

      await clickSettings(trigger);

      await waitFor(() => expect(tabs()).toEqual(expected));
    },
  );

  it("hands the provider's custom pages to Clerk's modals without newProfiles", async () => {
    const { clerk } = await renderWithProfile(
      <UserButton />,
      { userProfileProps: { customPages: [terms] } },
      inOrganization,
      {},
    );
    const openUserProfile = vi.spyOn(clerk, 'openUserProfile').mockImplementation(() => {});

    await clickSettings(buttonTrigger);

    const customPages = openUserProfile.mock.calls[0]?.[0]?.customPages ?? [];
    expect(customPages[0]).toMatchObject({ label: 'Terms', url: 'terms' });

    const el = document.body.appendChild(document.createElement('div'));
    onTestFinished(() => el.remove());
    act(() => {
      customPages[0]?.mount?.(el);
    });
    expect(within(el).getByText('Terms body')).toBeInTheDocument();
  });
});

describe('a mounted OrganizationProfile under a provider profile', () => {
  const audit = { ...terms, label: 'Audit', path: 'audit' };

  it("uses the provider's profile props", async () => {
    await renderWithProfile(<OrganizationProfile />, {
      organizationProfileProps: {
        customPages: [audit],
        pageOrder: ['audit'],
      },
    });

    await waitFor(() => expect(tabs()).toEqual(['Audit', 'General', 'Members']));
  });

  it('lets its own props win over the provider', async () => {
    await renderWithProfile(<OrganizationProfile customPages={[{ ...terms, label: 'Own', path: 'own' }]} />, {
      organizationProfileProps: { customPages: [audit] },
    });

    await waitFor(() => expect(tabs()).toEqual(['General', 'Members', 'Own']));
  });

  it('lands where the provider says after leaving the organization', async () => {
    const { navigate } = await renderWithProfile(<OrganizationProfile />, {
      organizationProfileProps: { afterLeaveOrganizationUrl: '/left' },
    });
    await leaveOrganization();

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/left'));
  });
});

function Entry({ base }: { base: string }) {
  return <output data-testid='entry'>{JSON.stringify(useVirtualEntries().get(base) ?? null)}</output>;
}

function OpenByRouting({ base }: { base: string }) {
  const write = useVirtualWrite();
  return <button onClick={() => write(base, [])}>Open by routing</button>;
}

describe('a profile modal opened by the routing state', () => {
  it.each([
    { name: 'the account pages at /modal/user', base: '/modal/user', expected: [...accountTabs, 'Terms'] },
    {
      name: 'both groups at /modal/profile',
      base: '/modal/profile',
      expected: [...accountTabs, 'Terms', ...organizationTabs],
    },
  ])("renders $name with the provider's options", async ({ base, expected }) => {
    await renderWithProfile(<OpenByRouting base={base} />, { userProfileProps: { customPages: [terms] } });

    await userEvent.setup().click(screen.getByRole('button', { name: 'Open by routing' }));
    const dialog = await screen.findByRole('dialog');

    await within(dialog).findByRole('tab', { name: 'Terms' });
    expect(tabs()).toEqual(expected);
  });
});

describe('the route of the profile a switcher opens', () => {
  it.each([
    { name: 'a user-only button opens the account profile', ui: <UserButton />, base: '/modal/user' },
    { name: 'a combined button opens the combined profile', ui: <Switcher />, base: '/modal/profile' },
  ])('$name at $base', async ({ ui, base }) => {
    await renderWithProfile(
      <>
        {ui}
        <Entry base={base} />
      </>,
    );

    await clickSettings(buttonTrigger);

    await selectedTab('Account');
    expect(JSON.parse(screen.getByTestId('entry').textContent ?? 'null')).toEqual([]);
  });
});

describe('a mounted Profile under a provider profile', () => {
  it("routes its pages under the provider's path", async () => {
    await renderWithProfile(
      <>
        <Profile />
        <Entry base='/account' />
      </>,
      { userProfileProps: { path: '/account' } },
    );

    await userEvent.setup().click(await screen.findByRole('tab', { name: 'Security' }));
    expect(JSON.parse(screen.getByTestId('entry').textContent ?? 'null')).toEqual(['security']);
  });

  it('fills in what its own organizationProfileProps leave out from the provider', async () => {
    await renderWithProfile(<Profile organizationProfileProps={{ pageOrder: ['members'] }} />, {
      organizationProfileProps: { customPages: [{ ...terms, label: 'Audit', path: 'audit' }], pageOrder: ['general'] },
    });

    await waitFor(() => expect(tabs()).toEqual(['Account', 'Security', 'Members', 'General', 'Audit']));
  });

  it('lands where the provider says after leaving the organization', async () => {
    const { navigate } = await renderWithProfile(<Profile />, {
      organizationProfileProps: { afterLeaveOrganizationUrl: '/left' },
    });
    await userEvent.setup().click(await screen.findByRole('tab', { name: 'General', description: 'Organization' }));
    await leaveOrganization();

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/left'));
  });

  it.each([
    { name: 'follows the provider', profile: separate, mode: undefined, expected: accountTabs },
    { name: 'defaults to combined', profile: undefined, mode: undefined, expected: allTabs },
    { name: 'wins over the provider when combined', profile: separate, mode: 'combined' as const, expected: allTabs },
    {
      name: 'wins over the provider when user',
      profile: { combined: true },
      mode: 'user' as const,
      expected: accountTabs,
    },
  ])('$name', async ({ profile, mode, expected }) => {
    await renderWithProfile(<Profile mode={mode} />, profile);

    await waitFor(() => expect(tabs()).toEqual(expected));
  });

  it("uses the provider's profile props", async () => {
    await renderWithProfile(<Profile />, {
      userProfileProps: { customPages: [terms] },
      organizationProfileProps: { customPages: [{ ...terms, label: 'Audit', path: 'audit' }] },
    });

    await waitFor(() => expect(tabs()).toEqual(['Account', 'Security', 'Terms', 'General', 'Members', 'Audit']));
  });

  it('lets its own props win over the provider', async () => {
    await renderWithProfile(<Profile customPages={[{ ...terms, label: 'Own', path: 'own' }]} />, {
      userProfileProps: { customPages: [terms] },
    });

    await waitFor(() => expect(tabs()).toEqual(['Account', 'Security', 'Own', 'General', 'Members']));
  });
});
