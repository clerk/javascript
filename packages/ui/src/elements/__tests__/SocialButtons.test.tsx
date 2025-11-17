// packages/clerk-js/src/ui/elements/__tests__/SocialButtons.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

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
    it('should show "Continue with" prefix for single strategy', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
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
  });
});
