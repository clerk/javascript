import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { mfaEnvironment } from '../user-profile-mfa-section/__tests__/mfa-feature-setup';
import { mfaSectionNode } from '../user-profile-mfa-section/user-profile-mfa-section';
import { useUserProfileMfaModel } from '../user-profile-mfa-section/user-profile-mfa-section.model';
import { renderPasswordSection } from '../user-profile-password-section/user-profile-password-section';
import { useUserProfilePasswordModel } from '../user-profile-password-section/user-profile-password-section.model';
import { UserProfileSecurityPanelView } from '../user-profile-security-panel.view';

describe('User profile security panel MFA composition', () => {
  it('renders a plain MFA node in Authentication over legacy methods', async () => {
    serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });
    await renderWithClerk(
      <UserProfileSecurityPanelView
        mfaSlot={<div>Connected MFA</div>}
        mfaMethods={[{ id: 'injected', type: 'authenticator' }]}
      />,
    );

    const authentication = screen.getByRole('region', { name: 'Authentication' });
    expect(within(authentication).getByText('Connected MFA')).toBeVisible();
    expect(within(authentication).queryByRole('heading', { name: '2-step verification' })).toBeNull();
  });

  it('suppresses injected MFA when the slot is explicitly null', async () => {
    serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });
    await renderWithClerk(
      <UserProfileSecurityPanelView
        mfaSlot={null}
        mfaMethods={[{ id: 'injected', type: 'authenticator' }]}
      />,
    );

    expect(screen.queryByRole('region', { name: 'Authentication' })).toBeNull();
  });

  it('places a connected MFA slot after password in the security panel', async () => {
    function Panel() {
      const mfaSlot = mfaSectionNode(useUserProfileMfaModel());
      const passwordSlot = renderPasswordSection(useUserProfilePasswordModel(), null);
      return (
        <UserProfileSecurityPanelView
          passwordSlot={passwordSlot}
          mfaSlot={mfaSlot}
        />
      );
    }
    serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });
    await renderWithClerk(<Panel />);
    const authentication = screen.getByRole('region', { name: 'Authentication' });
    expect(authentication).toHaveTextContent('Password');
    expect(authentication).toHaveTextContent('2-step verification');
    expect(authentication.textContent?.indexOf('Password')).toBeLessThan(
      authentication.textContent?.indexOf('2-step verification') ?? 0,
    );
  });

  it('uses the connected slot instead of duplicate injected MFA props', async () => {
    function Panel() {
      const mfaSlot = mfaSectionNode(useUserProfileMfaModel());
      return (
        <UserProfileSecurityPanelView
          mfaSlot={mfaSlot}
          mfaMethods={[{ id: 'injected', type: 'authenticator' }]}
        />
      );
    }
    serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });
    await renderWithClerk(<Panel />);
    expect(screen.getAllByText('2-step verification')).toHaveLength(1);
    expect(screen.queryByText('Authenticator app')).toBeNull();
  });

  it('suppresses injected MFA when the connected slot is hidden', async () => {
    function Panel() {
      const mfaSlot = mfaSectionNode(useUserProfileMfaModel());
      return (
        <UserProfileSecurityPanelView
          mfaSlot={mfaSlot}
          mfaMethods={[{ id: 'injected', type: 'authenticator' }]}
        />
      );
    }
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]) });
    await renderWithClerk(<Panel />);
    expect(screen.queryByRole('region', { name: 'Authentication' })).toBeNull();
  });
});
