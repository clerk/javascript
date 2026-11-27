import { fireEvent, within } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { OrganizationProfile } from '..';
import { AccessOnboardingPage } from '../AccessOnboarding/AccessOnboardingPage';
import { EnterpriseAccountSection } from '../AccessOnboarding/EnterpriseAccountSection';
import type { ScenarioKey } from '../AccessOnboarding/prototypeState';
import { useAccessPrototype } from '../AccessOnboarding/prototypeState';
import { UnmanagedUsersPanel } from '../AccessOnboarding/UnmanagedUsers';
import { OrganizationMembers } from '../OrganizationMembers';

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
      const { setScenario } = useAccessPrototype();
      const [ready, setReady] = useState(false);
      useEffect(() => {
        setScenario(key);
        setReady(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return ready ? <AccessOnboardingPage /> : null;
    };
    return render(<View />, { wrapper });
  };

  // Renders the Access page on the store as it stands, without resetting the scenario.
  const renderCurrent = async (queryParams: Record<string, string> = {}) => {
    const { createFixtures: createViewFixtures } = bindCreateFixtures('OrganizationProfile', {
      router: { queryParams },
    });
    const { wrapper } = await createViewFixtures(withPageFixtures);
    return render(<AccessOnboardingPage />, { wrapper });
  };

  // Members › Unmanaged users on the store as it stands, or after loading a scenario.
  const renderUnmanaged = async (key?: ScenarioKey) => {
    const { createFixtures: createViewFixtures } = bindCreateFixtures('OrganizationProfile');
    const { wrapper } = await createViewFixtures(withPageFixtures);
    const View = () => {
      const { setScenario } = useAccessPrototype();
      const [ready, setReady] = useState(!key);
      useEffect(() => {
        if (key) {
          setScenario(key);
          setReady(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return ready ? <UnmanagedUsersPanel /> : null;
    };
    return render(<View />, { wrapper });
  };

  // The whole Members page, with the Access prototype on or off.
  const renderMembers = async (
    key: ScenarioKey,
    {
      accessOnboarding = true,
      queryParams = {},
    }: { accessOnboarding?: boolean; queryParams?: Record<string, string> } = {},
  ) => {
    const { createFixtures: createViewFixtures } = bindCreateFixtures('OrganizationProfile', {
      router: { queryParams },
    });
    const { wrapper, fixtures, props } = await createViewFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [
          {
            name: 'Org1',
            permissions: ['org:sys_memberships:read', 'org:sys_memberships:manage', 'org:sys_domains:manage'],
          },
        ],
      });
    });
    props.setProps({ __internal_accessOnboarding: accessOnboarding || undefined });
    fixtures.clerk.organization?.getInvitations.mockRejectedValue(null);
    fixtures.clerk.organization?.getMemberships.mockRejectedValue(null);
    fixtures.clerk.organization?.getRoles.mockRejectedValue(null);
    const View = () => {
      const { setScenario } = useAccessPrototype();
      const [ready, setReady] = useState(false);
      useEffect(() => {
        setScenario(key);
        setReady(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return ready ? <OrganizationMembers /> : null;
    };
    return render(<View />, { wrapper });
  };

  it('says where people who join automatically find the organization', async () => {
    await renderScenario('configured', { policy: 'pol_acmedev_org' });
    expect(await screen.findByText('Manage policy')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Users at these domains join when they sign in. They’ll see this organization in their switcher.',
      ),
    ).toBeInTheDocument();
  });

  it('lists the organizations people are in below the choice, then manages them in bulk on the parent account', async () => {
    const form = await renderScenario('configured', { policy: 'new' });
    fireEvent.change(await screen.findByLabelText('Domain'), { target: { value: 'acme.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.queryByText('Users at acme.com are in 4 other organizations')).not.toBeInTheDocument();
    expect(screen.getByText('Users at these domains can be in other organizations too.')).toBeInTheDocument();
    expect(screen.queryByText('Manage these users with a parent account')).not.toBeInTheDocument();
    fireEvent.click((await screen.findAllByRole('button', { name: 'Verify' }))[0]);
    await screen.findByText('We found the record. You own this domain.', undefined, { timeout: 6000 });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(await screen.findByText('Users at acme.com are in 4 other organizations')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Users at these domains can be in other organizations too. Your sign-in rules apply to them there.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Manage these users with a parent account')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Manage which organizations users at these domains are in. Invite the 4 other organizations, migrate these users, or remove them.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('gus@acme.com')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show organizations' }));
    expect(screen.getByText('Gus’s workspace')).toBeInTheDocument();
    expect(screen.getByText('Northwind Partners')).toBeInTheDocument();
    expect(screen.getAllByText('1 user from acme.com')).toHaveLength(3);

    fireEvent.click(screen.getByRole('button', { name: 'Activate policy' }));
    await waitFor(() =>
      expect(screen.queryByText('Users at acme.com are in 4 other organizations')).not.toBeInTheDocument(),
    );
    form.unmount();

    const { createFixtures: createGeneralFixtures } = bindCreateFixtures('OrganizationProfile');
    const { wrapper } = await createGeneralFixtures(withPageFixtures);
    const general = render(<EnterpriseAccountSection />, { wrapper });
    fireEvent.click(await screen.findByRole('button', { name: 'Set up' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Create' }));
    expect(await screen.findByText('Acme Enterprise')).toBeInTheDocument();
    general.unmount();

    const list = await renderCurrent();
    expect(
      await screen.findByText('Acme Enterprise is ready. Decide what happens to unmanaged users on the Members page.'),
    ).toBeInTheDocument();
    list.unmount();

    await renderUnmanaged();
    expect(await screen.findByText('Unmanaged users')).toBeInTheDocument();
    expect(
      screen.getByText('Users at your domains who are in organizations outside Acme Enterprise.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Nothing changes for these users.')).toBeInTheDocument();
    expect(screen.getAllByText('No change')).toHaveLength(8);
    expect(screen.queryByText('Undecided')).not.toBeInTheDocument();
    expect(screen.queryByText(/Undecided users lose access/)).not.toBeInTheDocument();
    expect(screen.getByText('Acme Research, Acme Design')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.queryByText('riley.shah@acmedev.org')).not.toBeInTheDocument();
    expect(screen.getByText(/^9 of their organizations could join instead\./)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review on Organizations' })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Open menu' })[0]);
    fireEvent.click(await screen.findByText('Migrate to Acme'));
    expect(await screen.findByText('Migrates to Acme from Sam’s workspace')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Open menu' })[4]);
    fireEvent.click(await screen.findByText('Remove'));
    expect(await screen.findByText('Loses access to Casey’s workspace')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Select lee.park@acmedev.org'));
    fireEvent.click(screen.getByLabelText('Select morgan@exampledev.net'));
    expect(screen.getByText('2 selected')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Migrate' }));
    expect(await screen.findByText('Migrates to Acme from Acme Research')).toBeInTheDocument();
    expect(screen.getByText('Migrates to Acme from Initech')).toBeInTheDocument();
    expect(screen.queryByText('2 selected')).not.toBeInTheDocument();
    expect(
      screen.getByText('Migrates 3 users and removes 1. Changes start 14 days after you save.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Open menu' })[4]);
    fireEvent.click(await screen.findByText('Reset'));
    expect(await screen.findByText('Migrates 3 users. Changes start 14 days after you save.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(
      await screen.findByText(/^Saved\. Affected users get an email, and changes start [A-Z][a-z]{2} \d{1,2}\.$/),
    ).toBeInTheDocument();
  }, 20000);

  it('offers the membership rule on the default policy, with a caution', async () => {
    const page = await renderScenario('configured', { policy: 'pol_catch_all' });
    expect(await screen.findByText('Membership')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Only in Acme'));
    expect(
      screen.getByText(
        'Members can’t be in other organizations. Anyone already in one is removed 14 days after you save.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('This includes contractors and guests at other email domains.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    page.unmount();
    await renderCurrent();
    expect(await screen.findByText('Only in Acme')).toBeInTheDocument();
  }, 20000);

  it('sets the membership rule on a parent account’s policy, and Unmanaged users follows it', async () => {
    const before = await renderUnmanaged('parent');
    expect(
      await screen.findByText('Undecided users lose access to those organizations 14 days after you save.'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Undecided')).toHaveLength(2);
    before.unmount();

    const page = await renderCurrent({ policy: 'pol_meridianvet' });
    expect(
      await screen.findByText(
        'Users at these domains can’t be in organizations outside Meridian Vet Group. Decide what happens to them in Members › Unmanaged users.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /^Meridian Vet Group manages them and their users\. Decide what happens to these users in Members ›/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unmanaged users' })).toBeInTheDocument();
    fireEvent.click(screen.getByText('Any organization'));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    page.unmount();

    await renderUnmanaged();
    expect(await screen.findAllByText('No change')).toHaveLength(2);
    expect(screen.queryByText('Undecided')).not.toBeInTheDocument();
    expect(screen.queryByText(/Undecided users lose access/)).not.toBeInTheDocument();
  }, 20000);

  it('sets up a parent account from the General page', async () => {
    const { createFixtures: createViewFixtures } = bindCreateFixtures('OrganizationProfile');
    const { wrapper } = await createViewFixtures(withPageFixtures);
    const View = () => {
      const { setScenario } = useAccessPrototype();
      const [ready, setReady] = useState(false);
      useEffect(() => {
        setScenario('configured');
        setReady(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return ready ? <EnterpriseAccountSection /> : null;
    };
    render(<View />, { wrapper });

    expect(
      await screen.findByText(
        'Lets a central team manage your company’s users and organizations, starting with this one.',
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Set up' }));
    expect(
      await screen.findByText(
        'Acme becomes its first organization. It manages everyone at acmedev.org and exampledev.net.',
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(await screen.findByText('Acme Enterprise')).toBeInTheDocument();
    expect(screen.getAllByText('Parent account')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Manage' })).toBeInTheDocument();
    expect(screen.queryByText(/managing/)).not.toBeInTheDocument();
  });

  it('lists only the parent account on a sub-organization’s General page', async () => {
    const { createFixtures: createViewFixtures } = bindCreateFixtures('OrganizationProfile');
    const { wrapper } = await createViewFixtures(withPageFixtures);
    const View = () => {
      const { setScenario } = useAccessPrototype();
      const [ready, setReady] = useState(false);
      useEffect(() => {
        setScenario('child');
        setReady(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return ready ? <EnterpriseAccountSection /> : null;
    };
    render(<View />, { wrapper });

    expect(await screen.findByText('Meridian Vet Group')).toBeInTheDocument();
    expect(screen.getAllByText('Parent account')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Manage' })).toBeInTheDocument();
    expect(screen.queryByText('Dallas Clinic')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Set up' })).not.toBeInTheDocument();
  });

  it('tells an organization its members follow another organization’s SSO and lets it ask to be managed', async () => {
    const page = await renderScenario('domain_taken');
    expect(await screen.findByText('1 member signs in with Acme’s SSO')).toBeInTheDocument();
    expect(
      screen.getByText('Acme manages sign-in for everyone at acmedev.org, including jordan.wu@acmedev.org here.'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ask to join Acme Enterprise' }));
    expect(
      await screen.findByText('Request sent to Acme Enterprise. Nothing changes until they accept.'),
    ).toBeInTheDocument();
    page.unmount();

    const { createFixtures: createViewFixtures } = bindCreateFixtures('OrganizationProfile');
    const { wrapper } = await createViewFixtures(withPageFixtures);
    render(<EnterpriseAccountSection />, { wrapper });
    expect(await screen.findByText('You asked to join Acme Enterprise.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Set up' })).toBeInTheDocument();
  });

  it('lets a parent account bring in an organization that asked to join', async () => {
    const page = await renderScenario('join_request');
    expect(await screen.findByText('Acme Design asked to join Acme Enterprise')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Bring in' }));
    await waitFor(() =>
      expect(screen.queryByText('Acme Design asked to join Acme Enterprise')).not.toBeInTheDocument(),
    );
    page.unmount();

    await renderCurrent({ tab: 'sub-organizations' });
    expect(await screen.findByText('Organizations outside Acme Enterprise')).toBeInTheDocument();
    expect(screen.getByText('Acme Design')).toBeInTheDocument();
    expect(screen.queryByLabelText('Select Acme Design')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Select Acme Research')).toBeInTheDocument();
  });

  it('scenario: Only in Acme asks for ownership first, then shows who is in other organizations', async () => {
    await renderScenario('domain_elsewhere', { policy: 'new' });
    expect(await screen.findByText('Domain association verified')).toBeInTheDocument();
    expect(screen.queryByText(/are in other organizations/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Only in Acme'));
    expect(screen.getByText('Domain ownership unverified')).toBeInTheDocument();
    expect(screen.getByText('Verify ownership of acmedev.org in Target to use this.')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Verify' })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Activate policy' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Verify' }));
    await screen.findByText('We found the record. You own this domain.', undefined, { timeout: 6000 });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(await screen.findByText('Users at acmedev.org are in 5 other organizations')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Users at these domains can’t be in other organizations. Anyone already in one is removed 14 days after you activate.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Activate policy' })).toBeEnabled();
  }, 15000);

  it('warns the same way under single sign-on when the domain isn’t owned', async () => {
    await renderScenario('domain_elsewhere', { policy: 'new' });
    fireEvent.click(await screen.findByText('Single sign-on (SSO)'));
    expect(screen.getByText('Domain ownership unverified')).toBeInTheDocument();
    expect(screen.getByText('Verify ownership of acmedev.org in Target to use this.')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Verify' })).toHaveLength(1);
  });

  it('scenario: Only in Acme asks for ownership first, then shows nobody is in another organization', async () => {
    await renderScenario('domain_clear', { policy: 'new' });
    fireEvent.click(await screen.findByText('Only in Acme'));
    expect(screen.getByText('Verify ownership of acme.io in Target to use this.')).toBeInTheDocument();
    expect(screen.queryByText('Nobody at acme.io is in another organization.')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Verify' }));
    await screen.findByText('We found the record. You own this domain.', undefined, { timeout: 6000 });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(await screen.findByText('Nobody at acme.io is in another organization.')).toBeInTheDocument();
    expect(screen.queryByText(/removed from it/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Activate policy' })).toBeEnabled();
  }, 15000);

  it('does not ask again for a domain the policy already verified', async () => {
    await renderScenario('configured', { policy: 'pol_acmedev_org' });
    fireEvent.click(await screen.findByText('Only in Acme'));
    expect(screen.queryByText(/Verify ownership/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Verify' })).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'Users at these domains can’t be in other organizations. Anyone already in one is removed 14 days after you save.',
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Remove 5 users from other organizations?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save and remove' })).toBeInTheDocument();
  });

  it('moves the domain and its policy to a new parent account, and leaves the other policies', async () => {
    const page = await renderScenario('configured', { policy: 'pol_acmedev_org' });
    fireEvent.click(await screen.findByText('Manage these users with a parent account'));
    expect(await screen.findByText('Create the parent account')).toBeInTheDocument();
    expect(screen.queryByText('Move acmedev.org to a parent account')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Create parent account' }));
    expect(await screen.findByText('Move acmedev.org to a parent account')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByText('Move acmedev.org to a parent account')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Create parent account' }));
    expect(await screen.findByText('Move acmedev.org to a parent account')).toBeInTheDocument();
    expect(screen.getByText('Acme becomes the first organization in Acme Enterprise.')).toBeInTheDocument();
    expect(
      screen.getByText('acmedev.org and this policy move to Acme Enterprise. Ownership stays verified.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Decide what happens to unmanaged users on its Members page.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Create and continue' }));

    expect(
      await screen.findByText('acmedev.org now belongs to Acme Enterprise. Your changes are still here.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Only in Acme Enterprise’s organizations')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Acme Enterprise manages them and their users. Save this policy, then decide what happens to these users in Members › Unmanaged users.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Unmanaged users' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.queryByText(/from other organizations\?/)).not.toBeInTheDocument();
    page.unmount();

    const list = await renderCurrent();
    expect(await screen.findByText('acmedev.org')).toBeInTheDocument();
    expect(
      screen.getByText('Acme Enterprise is ready. Decide what happens to unmanaged users on the Members page.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('exampledev.net')).not.toBeInTheDocument();
    expect(screen.queryByText('example.com')).not.toBeInTheDocument();
    list.unmount();

    await renderUnmanaged();
    expect(await screen.findByText(/^Undecided users lose access to those organizations/)).toBeInTheDocument();
    expect(screen.getByText('Loses access to Sam’s workspace')).toBeInTheDocument();
  }, 15000);

  it('scenario: a domain another organization has SSO for can’t start a policy', async () => {
    await renderScenario('domain_taken', { policy: 'new' });
    expect(await screen.findByText('Acme has single sign-on set up for acmedev.org.')).toBeInTheDocument();
    expect(
      screen.getByText('Only Acme can add policies for it. Users there sign in with Acme’s SSO here too.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Verify' })).not.toBeInTheDocument();
  });

  it('pages through the organizations people are in', async () => {
    await renderScenario('configured', { policy: 'pol_acmedev_org' });
    expect(await screen.findByText('Users at acmedev.org are in 5 other organizations')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show organizations' }));
    expect(screen.getByText('Side Project Labs')).toBeInTheDocument();
    expect(screen.getByText('2 users from acmedev.org')).toBeInTheDocument();
    expect(screen.queryByText('Sam’s workspace')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Sam’s workspace')).toBeInTheDocument();
    expect(screen.getByText('Alex’s side project')).toBeInTheDocument();
    expect(screen.queryByText('Side Project Labs')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('asks before Only in Acme removes people from their other organizations', async () => {
    const form = await renderScenario('configured', { policy: 'new' });
    fireEvent.change(await screen.findByLabelText('Domain'), { target: { value: 'acme.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    fireEvent.click(await screen.findByText('Only in Acme'));
    expect(screen.getByText('Verify ownership of acme.com in Target to use this.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Activate policy' })).toBeDisabled();

    fireEvent.click((await screen.findAllByRole('button', { name: 'Verify' }))[0]);
    await screen.findByText('We found the record. You own this domain.', undefined, { timeout: 6000 });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(await screen.findByText('Users at acme.com are in 4 other organizations')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Users at these domains can’t be in other organizations. Anyone already in one is removed 14 days after you activate.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Activate policy' }));
    expect(await screen.findByText('Remove 3 users from other organizations?')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Users at acme.com can only be in Acme. They’re removed from Gus’s workspace, Dana’s workspace, Northwind Partners and 1 more 14 days after you activate. We email them first.',
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByText('Remove 3 users from other organizations?')).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Activate policy' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Activate and remove' }));
    form.unmount();
    await renderCurrent();
    expect(await screen.findByText('Only in Acme')).toBeInTheDocument();
    expect(screen.queryByText('3 users at acme.com are still in other organizations')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: '3 users at acme.com are still in other organizations. Open this policy to manage them.',
      }),
    ).toBeInTheDocument();
  }, 20000);

  it('activates without asking when nobody at the domain is outside the organization', async () => {
    await renderScenario('configured', { policy: 'pol_example_com' });
    fireEvent.click((await screen.findAllByRole('button', { name: 'Verify' }))[0]);
    await screen.findByText('We found the record. You own this domain.', undefined, { timeout: 6000 });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    fireEvent.click(screen.getByRole('button', { name: 'Activate policy' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Activate policy' })).not.toBeInTheDocument());
  }, 15000);

  it('does not ask for proof when another organization already owns the domain', async () => {
    await renderScenario('configured', { policy: 'new' });
    fireEvent.change(await screen.findByLabelText('Domain'), { target: { value: 'acmelabs.io' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(await screen.findByText('Only Acme Labs can add policies for it.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Verify' })).not.toBeInTheDocument();
  }, 10000);

  it('shows a parent its sub-organizations, policy scope and routing', async () => {
    const list = await renderScenario('parent');
    expect(await screen.findByText('Houston Clinic, El Paso Clinic')).toBeInTheDocument();
    list.unmount();

    const tab = await renderScenario('parent', { tab: 'sub-organizations' });
    expect(await screen.findByText('Where users land')).toBeInTheDocument();
    expect(screen.getByText('Austin Clinic')).toBeInTheDocument();
    tab.unmount();

    await renderScenario('parent', { policy: 'pol_meridianvet' });
    expect(await screen.findByText('Nobody joins Meridian Vet Group by domain.')).toBeInTheDocument();
    expect(
      screen.getByText('Where users land: by directory group or domain. Change it on the Organizations tab.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Skip for users who sign in with SSO')).toBeInTheDocument();
    expect(screen.getByText('All organizations in Meridian Vet Group')).toBeInTheDocument();
  });

  it('shows a sub-organization the rules it inherits', async () => {
    await renderScenario('child');
    expect(await screen.findByText('From Meridian Vet Group')).toBeInTheDocument();
    expect(screen.getByText('Required, skipped after SSO')).toBeInTheDocument();
  });

  it('flags live domains with people outside the organization: an icon on the list, a notice on General', async () => {
    const list = await renderScenario('configured');
    expect(
      await screen.findByRole('button', {
        name: '5 users at acmedev.org aren’t in Acme. To manage their access, create a parent account in General.',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText('5 users at acmedev.org aren’t in Acme')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
    list.unmount();

    const { createFixtures: createViewFixtures } = bindCreateFixtures('OrganizationProfile');
    const { wrapper } = await createViewFixtures(withPageFixtures);
    const General = () => {
      const { setScenario } = useAccessPrototype();
      const [ready, setReady] = useState(false);
      useEffect(() => {
        setScenario('configured');
        setReady(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return ready ? <EnterpriseAccountSection /> : null;
    };
    render(<General />, { wrapper });
    expect(await screen.findByText('5 users at acmedev.org aren’t in Acme')).toBeInTheDocument();
    expect(
      screen.getByText('They use your SSO in other organizations. Set up a parent account to manage their access.'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Set up' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Create' }));
    expect(await screen.findByText('Acme Enterprise')).toBeInTheDocument();
    expect(screen.queryByText('5 users at acmedev.org aren’t in Acme')).not.toBeInTheDocument();
  });

  it('offers a parent account under the policies only until the first policy', async () => {
    const empty = await renderScenario('domain_clear');
    fireEvent.click(await screen.findByRole('button', { name: 'Start with a parent account' }));
    expect(await screen.findByText('Set up a parent account')).toBeInTheDocument();
    empty.unmount();

    await renderScenario('configured');
    expect(await screen.findByText('Access policies')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start with a parent account' })).not.toBeInTheDocument();
  });

  it('lets the policy choose what happens to people outside the directory', async () => {
    await renderScenario('configured', { policy: 'pol_acmedev_org' });

    expect(await screen.findByText('Let them create their own organization')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Show an error'));
    expect(await screen.findByLabelText('Contact email')).toBeInTheDocument();
  });

  it('shows where users land as a choice, and the rules table only for directory groups or domains', async () => {
    await renderScenario('parent', { tab: 'sub-organizations' });
    const landing = await screen.findByRole('button', { name: 'Where users land' });
    expect(landing).toHaveTextContent('By directory group or domain');
    expect(screen.getByText('Recommended with SSO and directory sync.')).toBeInTheDocument();
    expect(screen.getByText('Houston Clinic Staff')).toBeInTheDocument();
    expect(screen.getByText('Regional Managers')).toBeInTheDocument();
    expect(screen.getByText('Houston Clinic, El Paso Clinic')).toBeInTheDocument();
    expect(screen.getByText('meridianpets.com')).toBeInTheDocument();
    expect(screen.getByText('Everyone else')).toBeInTheDocument();
    expect(screen.getByText('No organization')).toBeInTheDocument();
    expect(screen.queryByText(/Members can open every organization/)).not.toBeInTheDocument();

    fireEvent.click(landing);
    fireEvent.click(await screen.findByRole('option', { name: 'One organization' }));
    expect(await screen.findByRole('button', { name: 'Organization' })).toHaveTextContent('Austin Clinic');
    expect(screen.getByText('Everyone joins an organization you pick.')).toBeInTheDocument();
    expect(screen.queryByText('Everyone else')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Where users land' }));
    fireEvent.click(await screen.findByRole('option', { name: 'No organization until invited' }));
    expect(await screen.findByText('They sign in, then wait for an invitation.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Organization' })).not.toBeInTheDocument();
  });

  it('adds a domain rule, and Save picks it up', async () => {
    await renderScenario('parent', { tab: 'sub-organizations' });
    expect(await screen.findAllByText('· domain')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Add rule' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('radio', { name: 'Domain' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Domain' }));
    fireEvent.click(await screen.findByRole('option', { name: 'meridianvet.com' }));
    expect(within(dialog).getByRole('button', { name: 'Add rule' })).toBeDisabled();
    fireEvent.click(within(dialog).getByRole('checkbox', { name: 'Austin Clinic' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add rule' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getAllByText('· domain')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled();
  });

  it('offers directory groups for rules only once a directory is connected', async () => {
    const { createFixtures: createViewFixtures } = bindCreateFixtures('OrganizationProfile', {
      router: { queryParams: { tab: 'sub-organizations' } },
    });
    const { wrapper } = await createViewFixtures(withPageFixtures);
    const View = () => {
      const { setScenario, updateConnection } = useAccessPrototype();
      const [ready, setReady] = useState(false);
      useEffect(() => {
        setScenario('parent');
        updateConnection('dir_meridian_okta', { status: 'pending' });
        setReady(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return ready ? <AccessOnboardingPage /> : null;
    };
    render(<View />, { wrapper });

    fireEvent.click(await screen.findByRole('button', { name: 'Add rule' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('radio', { name: /Directory group/ })).toBeDisabled();
    expect(within(dialog).getByText('Connect a directory on a policy first.')).toBeInTheDocument();
    expect(within(dialog).getByRole('radio', { name: 'Domain' })).toBeChecked();
  });

  it('puts the parent members setting on the parent account’s Members tab only', async () => {
    const parent = await renderMembers('parent');
    expect(await screen.findByText('Members can open every organization in Meridian Vet Group')).toBeInTheDocument();
    expect(
      screen.getByText('When off, they manage Meridian Vet Group without joining its organizations.'),
    ).toBeInTheDocument();
    parent.unmount();

    await renderMembers('configured');
    expect(await screen.findByRole('tab', { name: /Members/ })).toBeInTheDocument();
    expect(screen.queryByText(/Members can open every organization/)).not.toBeInTheDocument();
  });

  it('adds an Unmanaged users tab to Members for a parent account only, and opens it from a link', async () => {
    const parent = await renderMembers('parent', { queryParams: { tab: 'unmanaged' } });
    const unmanagedTab = await screen.findByRole('tab', { name: /Unmanaged users/ });
    expect(within(unmanagedTab).getByText('4')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Members/ })).toBeInTheDocument();
    expect(
      await screen.findByText('Users at your domains who are in organizations outside Meridian Vet Group.'),
    ).toBeInTheDocument();
    parent.unmount();

    const organization = await renderMembers('configured');
    expect(await screen.findByRole('tab', { name: /Members/ })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Unmanaged users/ })).not.toBeInTheDocument();
    organization.unmount();

    await renderMembers('parent', { accessOnboarding: false });
    expect(await screen.findByRole('tab', { name: /Members/ })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Unmanaged users/ })).not.toBeInTheDocument();
  });

  it('shows a parent account each unmanaged user and what happens to them', async () => {
    await renderUnmanaged('parent');
    expect(await screen.findByText('Migrates to Houston Clinic from Nadia’s workspace')).toBeInTheDocument();
    expect(screen.getByText('Paws Partners Network, Lone Star Vet Collective')).toBeInTheDocument();
    expect(screen.getByText('Loses access to Paws Partners Network and Lone Star Vet Collective')).toBeInTheDocument();
    expect(screen.getByText('Loses access to Ben’s practice notes')).toBeInTheDocument();
    expect(screen.getByText('Joins with Pet Supply Co-op if its owner accepts')).toBeInTheDocument();
    expect(screen.queryByText(/^Added with/)).not.toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(
      screen.getAllByLabelText('Undecided. No decision yet. They lose access when the change starts.'),
    ).toHaveLength(2);
    expect(screen.getByText(/^4 of their organizations could join instead\./)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Select owen.cho@meridianvet.com'));
    expect(screen.getByText('1 selected')).toBeInTheDocument();
    expect(screen.getByText('Migrate to')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Migrate' }));
    expect(
      await screen.findByText('Migrates to Austin Clinic from Paws Partners Network and Lone Star Vet Collective'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Undecided')).toHaveLength(1);
    expect(screen.getByText('Migrates 1 user. Changes start 14 days after you save.')).toBeInTheDocument();
  });

  it('invites organizations outside a parent account on its Organizations tab', async () => {
    await renderScenario('parent', { tab: 'sub-organizations' });
    expect(await screen.findByText('Organizations outside Meridian Vet Group')).toBeInTheDocument();
    expect(
      screen.getByText('They have users at your domains. Invite them to bring all their members in.'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Invited')).toHaveLength(1);

    fireEvent.click(screen.getByLabelText('Select Nadia’s workspace'));
    fireEvent.click(screen.getByLabelText('Select Paws Partners Network'));
    fireEvent.click(screen.getByRole('button', { name: 'Invite to Meridian Vet Group' }));
    expect(await screen.findByText('Nadia’s workspace joined Meridian Vet Group.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Select Nadia’s workspace')).not.toBeInTheDocument();
    expect(screen.getAllByText('Invited')).toHaveLength(2);
    expect(screen.getAllByLabelText('Invited. Its owner has to accept.')).toHaveLength(2);

    fireEvent.click(screen.getAllByRole('button', { name: 'Open menu' })[0]);
    fireEvent.click(await screen.findByText('Cancel invitation'));
    await waitFor(() => expect(screen.getAllByText('Invited')).toHaveLength(1));
    expect(screen.getByLabelText('Select Paws Partners Network')).toBeInTheDocument();
  });
});
