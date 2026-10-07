import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { serveFapi } from '../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEmailAddress,
  fapiEnterpriseAccount,
  fapiEnvironment,
  fapiSession,
  fapiUser,
} from '../../__tests__/feature/fapi';
import { renderWithClerk } from '../../__tests__/feature/render';
import { UserProfileSecurityPanel } from './user-profile-security-panel';

const email = fapiEmailAddress({ id: 'idn_1', email_address: 'person@example.com' });
const alice = fapiUser({ id: 'user_1', email_addresses: [email] });

describe('UserProfileSecurityPanel', () => {
  it('omits Authentication while the only method loads without a fallback', async () => {
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]) });
    const loading = renderWithClerk(<UserProfileSecurityPanel />);
    try {
      expect(screen.queryByRole('region', { name: 'Authentication' })).toBeNull();
    } finally {
      await loading;
    }
    expect(screen.getByRole('region', { name: 'Authentication' })).toHaveTextContent('Password');
  });

  it.each([false, 0, ''])('omits Authentication while loading with a %s fallback', async passwordFallback => {
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]) });
    const loading = renderWithClerk(<UserProfileSecurityPanel passwordFallback={passwordFallback} />);
    try {
      const hasAuthentication = screen.queryByRole('region', { name: 'Authentication' }) !== null;
      expect(hasAuthentication).toBe(false);
    } finally {
      await loading;
    }
    expect(screen.getByRole('region', { name: 'Authentication' })).toHaveTextContent('Password');
  });

  it('keeps Authentication around a visible loading fallback', async () => {
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]) });
    const loading = renderWithClerk(
      <UserProfileSecurityPanel passwordFallback={<div>Loading password section</div>} />,
    );
    try {
      expect(screen.getByRole('region', { name: 'Authentication' })).toHaveTextContent('Loading password section');
    } finally {
      await loading;
    }
    expect(screen.getByRole('region', { name: 'Authentication' })).toHaveTextContent('Password');
    expect(screen.queryByText('Loading password section')).toBeNull();
  });

  it('shows no password action when nobody is signed in', async () => {
    serveFapi({ client: fapiClient() });
    await renderWithClerk(<UserProfileSecurityPanel />);

    expect(screen.queryByRole('region', { name: 'Authentication' })).toBeNull();
    expect(screen.queryByText('Password')).toBeNull();
  });

  it('keeps Authentication for other methods when passwords are disabled', async () => {
    const environment = fapiEnvironment();
    environment.user_settings.attributes.password.enabled = false;
    serveFapi({ environment, client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]) });
    await renderWithClerk(<UserProfileSecurityPanel passkeys={[]} />);

    expect(screen.getByRole('region', { name: 'Authentication' })).toHaveTextContent('Passkeys');
    expect(screen.queryByText('Password')).toBeNull();
  });

  it.each(['disabled', 'editable', 'managed'])('resolves the Authentication section for %s passwords', async policy => {
    const environment = fapiEnvironment();
    environment.user_settings.attributes.password.enabled = policy !== 'disabled';
    const user = fapiUser({
      ...alice,
      enterprise_accounts: policy === 'managed' ? [fapiEnterpriseAccount({ id: 'ent_1' })] : [],
    });
    serveFapi({ environment, client: fapiClient([fapiSession({ id: 'sess_1', user })]) });
    await renderWithClerk(<UserProfileSecurityPanel />);
    if (policy === 'disabled') {
      expect(screen.queryByRole('region', { name: 'Authentication' })).toBeNull();
    } else {
      expect(screen.getByRole('region', { name: 'Authentication' })).toHaveTextContent('Password');
    }
  });
});
