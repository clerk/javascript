import { fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { OrganizationProfile } from '..';
import { AccessOnboardingPage } from '../AccessOnboarding/AccessOnboardingPage';
import type { ScenarioKey } from '../AccessOnboarding/prototypeState';
import { useAccessPrototype } from '../AccessOnboarding/prototypeState';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');
const { createFixtures: createAddPolicyFixtures } = bindCreateFixtures('OrganizationProfile', {
  router: { queryParams: { policy: 'new' } },
});

const withPageFixtures = (f: Parameters<Parameters<typeof createFixtures>[0]>[0]) => {
  f.withOrganizations();
  f.withUser({
    email_addresses: ['test@clerk.com'],
    organization_memberships: [{ name: 'Org1', permissions: ['org:sys_domains:manage'] }],
  });
};

describe('AccessOnboardingPage', () => {
  it('shows the navbar tab only when __internal_accessOnboarding is set', async () => {
    const { wrapper, props } = await createFixtures(withPageFixtures);

    props.setProps({ __internal_accessOnboarding: true });
    const { unmount } = render(<OrganizationProfile />, { wrapper });
    expect(await screen.findByText('Access')).toBeInTheDocument();
    unmount();

    props.setProps({ __internal_accessOnboarding: undefined });
    render(<OrganizationProfile />, { wrapper });
    await waitFor(() => expect(screen.getByText('General')).toBeInTheDocument());
    expect(screen.queryByText('Access')).not.toBeInTheDocument();
  });

  it('starts with the catch-all alone: everyone, invitation only, default sign-in', async () => {
    const { wrapper } = await createFixtures(withPageFixtures);

    render(<AccessOnboardingPage />, { wrapper });

    await waitFor(() => expect(screen.getByText('Everyone')).toBeInTheDocument());
    expect(screen.getByText('Invitation only')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add policy' })).toBeInTheDocument();
  });

  it('adds a policy for the member’s own domain and activates it', async () => {
    const { wrapper: formWrapper } = await createAddPolicyFixtures(withPageFixtures);
    const form = render(<AccessOnboardingPage />, { wrapper: formWrapper });

    expect(await screen.findByText('Add policy')).toBeInTheDocument();
    expect(screen.getByText('acmedev.org')).toBeInTheDocument();
    expect(screen.getByText('Domain association verified')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Activate policy' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Activate policy' })).toBeDisabled());
    form.unmount();

    const { wrapper } = await createFixtures(withPageFixtures);
    render(<AccessOnboardingPage />, { wrapper });
    await waitFor(() => expect(screen.getByText('Everyone else')).toBeInTheDocument());
    expect(screen.getByText('acmedev.org')).toBeInTheDocument();
  });

  it.each([
    [{ tab: 'connections' }, 'Okta Directory'],
    [{ policy: 'pol_acmedev_org' }, 'Manage policy'],
    [{ policy: 'pol_catch_all' }, 'Manage default'],
    [{ setup: 'sso', policy: 'pol_acmedev_org' }, 'Configure your identity provider'],
    [{ setup: 'directory', policy: 'pol_acmedev_org' }, 'SCIM endpoint URL'],
    [{ connection: 'con_okta_engineering' }, 'Manage SSO connection'],
    [{ connection: 'dir_okta' }, 'Manage Directory Sync'],
  ])('renders the configured org at %o', async (queryParams, text) => {
    const { createFixtures: createViewFixtures } = bindCreateFixtures('OrganizationProfile', {
      router: { queryParams },
    });
    const { wrapper } = await createViewFixtures(withPageFixtures);
    const Configured = () => {
      const { scenario, setScenario } = useAccessPrototype();
      if (scenario !== 'configured') {
        setScenario('configured');
        return null;
      }
      return <AccessOnboardingPage />;
    };

    render(<Configured />, { wrapper });

    expect(await screen.findByText(text)).toBeInTheDocument();
  });

  it('adds and removes people who can bypass SSO on a connection', async () => {
    const { createFixtures: createViewFixtures } = bindCreateFixtures('OrganizationProfile', {
      router: { queryParams: { connection: 'con_okta_engineering' } },
    });
    const { wrapper } = await createViewFixtures(withPageFixtures);
    const Configured = () => {
      const { scenario, setScenario } = useAccessPrototype();
      if (scenario !== 'configured') {
        setScenario('configured');
        return null;
      }
      return <AccessOnboardingPage />;
    };

    render(<Configured />, { wrapper });

    expect(await screen.findByText('it-admin@acmedev.org')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'ops@acmedev.org' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(await screen.findByText('ops@acmedev.org')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove it-admin@acmedev.org' }));
    await waitFor(() => expect(screen.queryByText('it-admin@acmedev.org')).not.toBeInTheDocument());
  });

  const renderScenario = async (key: ScenarioKey, queryParams: Record<string, string> = {}) => {
    const { createFixtures: createViewFixtures } = bindCreateFixtures('OrganizationProfile', {
      router: { queryParams },
    });
    const { wrapper } = await createViewFixtures(withPageFixtures);
    const View = () => {
      const { scenario, setScenario } = useAccessPrototype();
      if (scenario !== key) {
        setScenario(key);
        return null;
      }
      return <AccessOnboardingPage />;
    };
    return render(<View />, { wrapper });
  };

  it('claims an owned domain after reviewing who joins', async () => {
    await renderScenario('configured', { policy: 'pol_acmedev_org' });

    fireEvent.click(await screen.findByRole('button', { name: 'Claim domain' }));
    expect(await screen.findByText('Claim acmedev.org')).toBeInTheDocument();
    expect(screen.getByText('sam.ortiz@acmedev.org')).toBeInTheDocument();
    expect(screen.getByText('They join when Okta Directory syncs them.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Start notice period' }));
    expect(await screen.findByText('Notice period')).toBeInTheDocument();
  });

  it('asks for ownership before claiming, and hides claiming when the app does not allow it', async () => {
    const draft = await renderScenario('configured', { policy: 'pol_example_com' });
    expect(await screen.findByText('Prove ownership to claim this domain')).toBeInTheDocument();
    draft.unmount();

    await renderScenario('claims_off', { policy: 'pol_acmedev_org' });
    expect(await screen.findByText('Manage policy')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Claim domain' })).not.toBeInTheDocument();
  });

  it('shows a parent its sub-organizations, policy scope and routing', async () => {
    const list = await renderScenario('parent');
    expect(await screen.findByText('Parent organization')).toBeInTheDocument();
    expect(screen.getByText('Houston Clinic, El Paso Clinic')).toBeInTheDocument();
    list.unmount();

    const tab = await renderScenario('parent', { tab: 'sub-organizations' });
    expect(await screen.findByText('How people join a sub-organization')).toBeInTheDocument();
    expect(screen.getByText('Austin Clinic')).toBeInTheDocument();
    tab.unmount();

    await renderScenario('parent', { policy: 'pol_meridianvet' });
    expect(await screen.findByText('Nobody joins Meridian Vet Group by domain.')).toBeInTheDocument();
    expect(screen.getByText('Skip for people who sign in with SSO')).toBeInTheDocument();
    expect(screen.getByText('All sub-organizations')).toBeInTheDocument();
  });

  it('shows a sub-organization the rules it inherits', async () => {
    await renderScenario('child');
    expect(await screen.findByText('From Meridian Vet Group')).toBeInTheDocument();
    expect(screen.getByText('Required, skipped after SSO')).toBeInTheDocument();
  });
});
