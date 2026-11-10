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
import type { MosaicProfile } from '../../profile-pages/use-mosaic-profile';
import { UserButton } from '../../user-button/user-button';
import { UserProfile } from '../../user-profile/user-profile';
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
    { name: 'combined by default', profile: undefined, expected: allTabs },
    { name: 'combined when asked', profile: { combined: true }, expected: allTabs },
    { name: 'separate when opted out', profile: separate, expected: accountTabs },
  ])('a user-only button opens the account pages first: $name', async ({ profile, expected }) => {
    await renderWithProfile(<UserButton />, profile);

    await clickSettings(buttonTrigger);

    expect(await selectedTab('Account')).toBeInTheDocument();
    expect(tabs()).toEqual(expected);
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

  it('a lone switcher lands on the organization pages of the combined profile', async () => {
    await renderWithProfile(<OrganizationSwitcher />);

    await clickSettings(switcherTrigger);

    expect(await selectedTab('General')).toBeInTheDocument();
    expect(tabs()).toEqual(allTabs);
  });

  it('a lone switcher opens the standalone organization profile when opted out', async () => {
    await renderWithProfile(<OrganizationSwitcher />, separate);

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
    expect(tabs()).toEqual(allTabs);
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

  it.each([
    { name: 'separate', combined: false, expected: ['General'] },
    { name: 'combined', combined: true, expected: ['Account', 'Security', 'General'] },
  ])("hides the organization's API keys from the profile a switcher opens: $name", async ({ combined, expected }) => {
    await renderWithProfile(
      <OrganizationSwitcher />,
      { combined, organizationProfileProps: { apiKeysProps: { hide: true } } },
      withOrganizationApiKeys,
    );

    await clickSettings(switcherTrigger);

    expect(await selectedTab('General')).toBeInTheDocument();
    expect(tabs()).toEqual(expected);
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
    await renderWithProfile(<OrganizationSwitcher />, {
      organizationProfileProps: { customPages: [terms], pageOrder: ['terms'] },
    });

    await clickSettings(switcherTrigger);

    expect(await selectedTab('Terms')).toBeInTheDocument();
  });

  it('skips a page this organization does not have when opening a combined profile', async () => {
    await renderWithProfile(<OrganizationSwitcher />, {
      organizationProfileProps: { pageOrder: ['apiKeys', 'members'] },
    });

    await clickSettings(switcherTrigger);

    expect(await selectedTab('Members')).toBeInTheDocument();
  });

  it.each([
    { name: 'the button', ui: <UserButton />, trigger: buttonTrigger },
    { name: 'the switcher', ui: <OrganizationSwitcher />, trigger: switcherTrigger },
  ])('applies the custom pages and order set on the provider when $name opens it', async ({ ui, trigger }) => {
    await renderWithProfile(ui, {
      userProfileProps: { customPages: [terms], pageOrder: ['account', 'terms'] },
      organizationProfileProps: { customPages: [{ ...terms, label: 'Audit', path: 'audit' }], pageOrder: ['audit'] },
    });

    await clickSettings(trigger);

    await waitFor(() => expect(tabs()).toEqual(['Account', 'Terms', 'Security', 'Audit', 'General', 'Members']));
  });

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

describe('a user profile modal opened by the routing state', () => {
  it("renders with the provider's options", async () => {
    await renderWithProfile(<OpenByRouting base='/modal/user' />, { userProfileProps: { customPages: [terms] } });

    await userEvent.setup().click(screen.getByRole('button', { name: 'Open by routing' }));
    const dialog = await screen.findByRole('dialog');

    expect(await within(dialog).findByRole('tab', { name: 'Terms' })).toBeInTheDocument();
  });
});

describe('a mounted UserProfile under a provider profile', () => {
  it("routes its pages under the provider's path", async () => {
    await renderWithProfile(
      <>
        <UserProfile />
        <Entry base='/account' />
      </>,
      { userProfileProps: { path: '/account' } },
    );

    await userEvent.setup().click(await screen.findByRole('tab', { name: 'Security' }));
    expect(JSON.parse(screen.getByTestId('entry').textContent ?? 'null')).toEqual(['security']);
  });

  it('fills in what its own organizationProfileProps leave out from the provider', async () => {
    await renderWithProfile(<UserProfile organizationProfileProps={{ pageOrder: ['members'] }} />, {
      organizationProfileProps: { customPages: [{ ...terms, label: 'Audit', path: 'audit' }], pageOrder: ['general'] },
    });

    await waitFor(() => expect(tabs()).toEqual(['Account', 'Security', 'Members', 'General', 'Audit']));
  });

  it('lands where the provider says after leaving the organization', async () => {
    const { navigate } = await renderWithProfile(<UserProfile />, {
      organizationProfileProps: { afterLeaveOrganizationUrl: '/left' },
    });
    await userEvent.setup().click(await screen.findByRole('tab', { name: 'General', description: 'Organization' }));
    await leaveOrganization();

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/left'));
  });

  it.each([
    { name: 'follows the provider', profile: separate, combined: undefined, expected: accountTabs },
    { name: 'defaults to combined', profile: undefined, combined: undefined, expected: allTabs },
    { name: 'wins over the provider when combined', profile: separate, combined: true, expected: allTabs },
    { name: 'wins over the provider when not', profile: { combined: true }, combined: false, expected: accountTabs },
  ])('$name', async ({ profile, combined, expected }) => {
    await renderWithProfile(<UserProfile combined={combined} />, profile);

    await waitFor(() => expect(tabs()).toEqual(expected));
  });

  it("uses the provider's profile props", async () => {
    await renderWithProfile(<UserProfile />, {
      userProfileProps: { customPages: [terms] },
      organizationProfileProps: { customPages: [{ ...terms, label: 'Audit', path: 'audit' }] },
    });

    await waitFor(() => expect(tabs()).toEqual(['Account', 'Security', 'Terms', 'General', 'Members', 'Audit']));
  });

  it('lets its own props win over the provider', async () => {
    await renderWithProfile(<UserProfile customPages={[{ ...terms, label: 'Own', path: 'own' }]} />, {
      userProfileProps: { customPages: [terms] },
    });

    await waitFor(() => expect(tabs()).toEqual(['Account', 'Security', 'Own', 'General', 'Members']));
  });
});
