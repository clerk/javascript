// packages/clerk-js/src/ui/elements/__tests__/SocialButtons.test.tsx
import { render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';
import { useTotalEnabledAuthMethods } from '@/ui/hooks/useTotalEnabledAuthMethods';

import { SocialButtons } from '../SocialButtons';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('SocialButtons', () => {
  const mockOAuthCallback = vi.fn();
  const mockWeb3Callback = vi.fn();
  const mockAlternativePhoneCodeCallback = vi.fn();

  const defaultProps = {
    oauthCallback: mockOAuthCallback,
    web3Callback: mockWeb3Callback,
    alternativePhoneCodeCallback: mockAlternativePhoneCodeCallback,
    enableOAuthProviders: true,
    enableWeb3Providers: true,
    enableAlternativePhoneCodeProviders: true,
  };

  describe('Without last authentication strategy', () => {
    it('should show "Continue with" prefix for single strategy', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
      });

      fixtures.clerk.client.lastAuthenticationStrategy = null;

      render(
        <CardStateProvider>
          <SocialButtons
            {...defaultProps}
            showLastAuthenticationStrategy={false}
          />
        </CardStateProvider>,
        { wrapper },
      );

      const button = screen.getByRole('button', { name: /google/i });
      expect(button).toHaveTextContent('Continue with Google');
    });

    it('should NOT show "Continue with" prefix for either button when two strategies exist', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withSocialProvider({ provider: 'github' });
      });

      fixtures.clerk.client.lastAuthenticationStrategy = null;

      render(
        <CardStateProvider>
          <SocialButtons
            {...defaultProps}
            showLastAuthenticationStrategy={false}
          />
        </CardStateProvider>,
        { wrapper },
      );

      const googleButton = screen.getByRole('button', { name: /google/i });
      const githubButton = screen.getByRole('button', { name: /github/i });

      expect(googleButton).toHaveTextContent('Google');
      expect(googleButton).not.toHaveTextContent('Continue with Google');
      expect(githubButton).toHaveTextContent('GitHub');
      expect(githubButton).not.toHaveTextContent('Continue with GitHub');
    });

    it('should NOT show "Continue with" prefix for any button when 3+ strategies exist', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withSocialProvider({ provider: 'github' });
        f.withSocialProvider({ provider: 'apple' });
      });

      fixtures.clerk.client.lastAuthenticationStrategy = null;

      render(
        <CardStateProvider>
          <SocialButtons
            {...defaultProps}
            showLastAuthenticationStrategy={false}
          />
        </CardStateProvider>,
        { wrapper },
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveTextContent(/Continue with/i);
      });
    });

    it('should return null when no strategies are enabled', async () => {
      const { wrapper } = await createFixtures();

      const { container } = render(
        <CardStateProvider>
          <SocialButtons
            {...defaultProps}
            enableOAuthProviders={false}
            enableWeb3Providers={false}
            enableAlternativePhoneCodeProviders={false}
          />
        </CardStateProvider>,
        { wrapper },
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('With last authentication strategy', () => {
    it('should NOT show "Last used" badge when only one total auth method exists (single social provider, no email/username)', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        // Explicitly disable email and username to ensure only one auth method
        // Note: By default fixtures have these disabled, but we set them explicitly to be sure
        f.withEmailAddress({ enabled: false, used_for_first_factor: false });
        f.withUsername({ enabled: false, used_for_first_factor: false });
      });

      // Verify that email and username are disabled
      const enabledIdentifiers = fixtures.environment.userSettings.enabledFirstFactorIdentifiers;
      expect(enabledIdentifiers).not.toContain('email_address');
      expect(enabledIdentifiers).not.toContain('username');
      // Verify only one social provider is enabled
      expect(fixtures.environment.userSettings.authenticatableSocialStrategies).toHaveLength(1);

      // Verify the total count is actually 1 using the hook
      const { result } = renderHook(() => useTotalEnabledAuthMethods(), { wrapper });
      expect(result.current).toBe(1);

      fixtures.clerk.client.lastAuthenticationStrategy = 'oauth_google';

      render(
        <CardStateProvider>
          <SocialButtons
            {...defaultProps}
            showLastAuthenticationStrategy
          />
        </CardStateProvider>,
        { wrapper },
      );

      const button = screen.getByRole('button', { name: /google/i });
      expect(button).toHaveTextContent('Continue with Google');
      expect(button).not.toHaveTextContent('Last used');
      expect(screen.queryByText('Last used')).not.toBeInTheDocument();
    });

    it('should show "Last used" badge when email is enabled even with single social provider', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withEmailAddress({ enabled: true, used_for_first_factor: true });
        f.withUsername({ enabled: false, used_for_first_factor: false });
      });

      // Verify the total count is 2 (email + google)
      const { result } = renderHook(() => useTotalEnabledAuthMethods(), { wrapper });
      expect(result.current).toBe(2);

      fixtures.clerk.client.lastAuthenticationStrategy = 'oauth_google';

      render(
        <CardStateProvider>
          <SocialButtons
            {...defaultProps}
            showLastAuthenticationStrategy
          />
        </CardStateProvider>,
        { wrapper },
      );

      const button = screen.getByRole('button', { name: /google/i });
      expect(button).toHaveTextContent('Continue with Google');
      expect(button).toHaveTextContent('Last used');
      expect(screen.getByText('Last used')).toBeInTheDocument();
    });

    it('should show "Last used" badge when only one social provider but email/username is also enabled', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withEmailAddress({ enabled: true, used_for_first_factor: true });
      });

      fixtures.clerk.client.lastAuthenticationStrategy = 'oauth_google';

      render(
        <CardStateProvider>
          <SocialButtons
            {...defaultProps}
            showLastAuthenticationStrategy
          />
        </CardStateProvider>,
        { wrapper },
      );

      const button = screen.getByRole('button', { name: /google/i });
      expect(button).toHaveTextContent('Continue with Google');
      expect(button).toHaveTextContent('Last used');
      expect(screen.getByText('Last used')).toBeInTheDocument();
    });

    it('should show "Continue with" prefix for single strategy when multiple auth methods exist', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withEmailAddress({ enabled: true, used_for_first_factor: true });
      });

      fixtures.clerk.client.lastAuthenticationStrategy = 'oauth_google';

      render(
        <CardStateProvider>
          <SocialButtons
            {...defaultProps}
            showLastAuthenticationStrategy
          />
        </CardStateProvider>,
        { wrapper },
      );

      const button = screen.getByRole('button', { name: /google/i });
      expect(button).toHaveTextContent('Continue with Google');
      expect(button).toHaveTextContent('Last used');
    });

    it('should show "Continue with" prefix for both buttons when two strategies exist', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withSocialProvider({ provider: 'github' });
      });

      fixtures.clerk.client.lastAuthenticationStrategy = 'oauth_google';

      render(
        <CardStateProvider>
          <SocialButtons
            {...defaultProps}
            showLastAuthenticationStrategy
          />
        </CardStateProvider>,
        { wrapper },
      );

      const googleButton = screen.getByRole('button', { name: /google/i });
      const githubButton = screen.getByRole('button', { name: /github/i });

      // Both should show "Continue with" when last auth is present
      expect(googleButton).toHaveTextContent('Continue with Google');
      expect(githubButton).toHaveTextContent('Continue with GitHub');
    });

    it('should show "Last used" badge on last auth strategy button', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withSocialProvider({ provider: 'github' });
      });

      fixtures.clerk.client.lastAuthenticationStrategy = 'oauth_google';

      render(
        <CardStateProvider>
          <SocialButtons
            {...defaultProps}
            showLastAuthenticationStrategy
          />
        </CardStateProvider>,
        { wrapper },
      );

      const googleButton = screen.getByRole('button', { name: /google/i });
      expect(googleButton).toHaveTextContent('Last used');

      const badge = screen.getByText('Last used');
      expect(badge).toBeInTheDocument();
    });

    it('should show "Continue with" prefix when last auth strategy is alone in its row', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withSocialProvider({ provider: 'github' });
        f.withSocialProvider({ provider: 'apple' });
      });

      fixtures.clerk.client.lastAuthenticationStrategy = 'oauth_google';

      render(
        <CardStateProvider>
          <SocialButtons
            {...defaultProps}
            showLastAuthenticationStrategy
          />
        </CardStateProvider>,
        { wrapper },
      );

      // Google (last auth) should be in its own row and show "Continue with"
      const googleButton = screen.getByRole('button', { name: /google/i });
      expect(googleButton).toHaveTextContent('Continue with Google');
    });

    it('should handle SAML strategies converted to OAuth', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withEmailAddress({ enabled: true, used_for_first_factor: true });
      });

      // SAML strategy should be converted to OAuth
      fixtures.clerk.client.lastAuthenticationStrategy = 'saml_google' as any;

      render(
        <CardStateProvider>
          <SocialButtons
            {...defaultProps}
            showLastAuthenticationStrategy
          />
        </CardStateProvider>,
        { wrapper },
      );

      const googleButton = screen.getByRole('button', { name: /google/i });
      expect(googleButton).toHaveTextContent('Continue with Google');
    });

    it('should NOT show "Last used" badge when only one total auth method exists (single social provider, no email/username, SAML)', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        // Disable email and username to ensure only one auth method
        f.withEmailAddress({ enabled: false, used_for_first_factor: false });
        f.withUsername({ enabled: false, used_for_first_factor: false });
      });

      // SAML strategy should be converted to OAuth but badge should not show
      fixtures.clerk.client.lastAuthenticationStrategy = 'saml_google' as any;

      render(
        <CardStateProvider>
          <SocialButtons
            {...defaultProps}
            showLastAuthenticationStrategy
          />
        </CardStateProvider>,
        { wrapper },
      );

      const googleButton = screen.getByRole('button', { name: /google/i });
      expect(googleButton).toHaveTextContent('Continue with Google');
      expect(googleButton).not.toHaveTextContent('Last used');
      expect(screen.queryByText('Last used')).not.toBeInTheDocument();
    });
  });
});
