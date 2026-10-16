import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEmailAddress,
  fapiEnterpriseAccount,
  fapiEnvironment,
  fapiSession,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfileActiveDevicesSection } from '../user-profile-active-devices-section/user-profile-active-devices-section';
import { mfaEnvironment } from '../user-profile-mfa-section/__tests__/mfa-feature-setup';
import { UserProfilePasswordSection } from '../user-profile-password-section/user-profile-password-section';
import { UserProfileSecurityPanel } from '../user-profile-security-panel';

const email = fapiEmailAddress({ id: 'idn_1', email_address: 'person@example.com' });
const alice = fapiUser({ id: 'user_1', email_addresses: [email] });

afterEach(() => vi.restoreAllMocks());

describe('UserProfileSecurityPanel', () => {
  function sectionHeadings() {
    return screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent);
  }

  it('renders the security sections the instance enables', async () => {
    vi.spyOn(navigator, 'webdriver', 'get').mockReturnValue(false);
    const environment = mfaEnvironment();
    environment.user_settings.attributes.passkey.enabled = true;
    serveFapi({ environment, client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]), activeDevices: [] });
    await renderWithClerk(<UserProfileSecurityPanel />);

    expect(screen.getByRole('heading', { level: 2, name: 'Security' })).toBeInTheDocument();
    await screen.findByRole('heading', { level: 3, name: 'Active devices' });
    expect(sectionHeadings()).toEqual(['Password', 'Passkeys', '2-step verification', 'Active devices']);
  });

  it('renders only the sections passed as children, in their order', async () => {
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]), activeDevices: [] });
    await renderWithClerk(
      <UserProfileSecurityPanel>
        <UserProfileActiveDevicesSection />
        <UserProfilePasswordSection />
      </UserProfileSecurityPanel>,
    );

    await screen.findByRole('heading', { level: 3, name: 'Active devices' });
    expect(sectionHeadings()).toEqual(['Active devices', 'Password']);
  });

  it('shows a section fallback while that section loads', async () => {
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]) });
    const loading = renderWithClerk(
      <UserProfileSecurityPanel>
        <UserProfilePasswordSection fallback={<div>Loading password section</div>} />
      </UserProfileSecurityPanel>,
    );
    try {
      expect(screen.getByText('Loading password section')).toBeInTheDocument();
    } finally {
      await loading;
    }
    expect(screen.getByRole('heading', { level: 3, name: 'Password' })).toBeInTheDocument();
    expect(screen.queryByText('Loading password section')).toBeNull();
  });

  it('keeps the panel title when nobody is signed in', async () => {
    serveFapi({ client: fapiClient() });
    await renderWithClerk(<UserProfileSecurityPanel />);

    expect(screen.getByRole('heading', { level: 2, name: 'Security' })).toBeInTheDocument();
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
  });

  it.each(['disabled', 'editable', 'managed'])('resolves the password section for %s passwords', async policy => {
    const environment = fapiEnvironment();
    environment.user_settings.attributes.password.enabled = policy !== 'disabled';
    const user = fapiUser({
      ...alice,
      enterprise_accounts: policy === 'managed' ? [fapiEnterpriseAccount({ id: 'ent_1' })] : [],
    });
    serveFapi({ environment, client: fapiClient([fapiSession({ id: 'sess_1', user })]) });
    await renderWithClerk(<UserProfileSecurityPanel />);
    if (policy === 'disabled') {
      expect(screen.queryByRole('heading', { level: 3, name: 'Password' })).toBeNull();
    } else {
      expect(screen.getByRole('heading', { level: 3, name: 'Password' })).toBeInTheDocument();
    }
  });
});
