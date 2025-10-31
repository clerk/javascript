import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import { SocialButtons } from '../SocialButtons';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('SocialButtons', () => {
  describe('Without Last Authentication Strategy', () => {
    it('renders 1 provider with full text as block button', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
      });

      render(
        <CardStateProvider>
          <SocialButtons
            enableOAuthProviders
            enableWeb3Providers={false}
            enableAlternativePhoneCodeProviders={false}
            oauthCallback={async () => {}}
            web3Callback={async () => {}}
            alternativePhoneCodeCallback={() => {}}
            showLastAuthenticationStrategy={false}
          />
        </CardStateProvider>,
        { wrapper },
      );

      // Should show full text "Continue with Google"
      expect(screen.getByText('Continue with Google')).toBeInTheDocument();

      // Should be a block button (not icon-only)
      const button = screen.getByRole('button');
      expect(button.className).toContain('cl-socialButtonsBlockButton');
    });

    it('renders 2 providers with short text as block buttons', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withSocialProvider({ provider: 'github' });
      });

      render(
        <CardStateProvider>
          <SocialButtons
            enableOAuthProviders
            enableWeb3Providers={false}
            enableAlternativePhoneCodeProviders={false}
            oauthCallback={async () => {}}
            web3Callback={async () => {}}
            alternativePhoneCodeCallback={() => {}}
            showLastAuthenticationStrategy={false}
          />
        </CardStateProvider>,
        { wrapper },
      );

      // Should show short text "Google" and "GitHub"
      expect(screen.getByText('Google')).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();

      // Should NOT show full text
      expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument();
      expect(screen.queryByText('Continue with GitHub')).not.toBeInTheDocument();

      // Should be block buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      buttons.forEach(button => {
        expect(button.className).toContain('cl-socialButtonsBlockButton');
      });
    });

    it('renders 3 providers as icon buttons (no visible text)', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withSocialProvider({ provider: 'github' });
        f.withSocialProvider({ provider: 'facebook' });
      });

      render(
        <CardStateProvider>
          <SocialButtons
            enableOAuthProviders
            enableWeb3Providers={false}
            enableAlternativePhoneCodeProviders={false}
            oauthCallback={async () => {}}
            web3Callback={async () => {}}
            alternativePhoneCodeCallback={() => {}}
            showLastAuthenticationStrategy={false}
          />
        </CardStateProvider>,
        { wrapper },
      );

      // Should be icon buttons (not block)
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      buttons.forEach(button => {
        expect(button.className).toContain('cl-socialButtonsIconButton');
      });

      // Icon buttons should have images with proper alt text (but no visible text nodes)
      expect(screen.getByAltText('Sign in with Google')).toBeInTheDocument();
      expect(screen.getByAltText('Sign in with GitHub')).toBeInTheDocument();
      expect(screen.getByAltText('Sign in with Facebook')).toBeInTheDocument();
    });
  });

  describe('With Last Authentication Strategy', () => {
    it('renders last auth button with full text when it is the only provider', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
      });

      // Set last authentication strategy
      fixtures.clerk.client.lastAuthenticationStrategy = 'oauth_google';

      render(
        <CardStateProvider>
          <SocialButtons
            enableOAuthProviders
            enableWeb3Providers={false}
            enableAlternativePhoneCodeProviders={false}
            oauthCallback={async () => {}}
            web3Callback={async () => {}}
            alternativePhoneCodeCallback={() => {}}
            showLastAuthenticationStrategy
          />
        </CardStateProvider>,
        { wrapper },
      );

      // Should show full text for last auth button
      expect(screen.getByText('Continue with Google')).toBeInTheDocument();

      // Should be a block button
      const button = screen.getByRole('button');
      expect(button.className).toContain('cl-socialButtonsBlockButton');
    });

    it('renders last auth button with full text and 1 remaining with full text', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withSocialProvider({ provider: 'github' });
      });

      // Set last authentication strategy
      fixtures.clerk.client.lastAuthenticationStrategy = 'oauth_google';

      render(
        <CardStateProvider>
          <SocialButtons
            enableOAuthProviders
            enableWeb3Providers={false}
            enableAlternativePhoneCodeProviders={false}
            oauthCallback={async () => {}}
            web3Callback={async () => {}}
            alternativePhoneCodeCallback={() => {}}
            showLastAuthenticationStrategy
          />
        </CardStateProvider>,
        { wrapper },
      );

      // Both should show full text because remaining count is 1
      expect(screen.getAllByText(/Continue with/)).toHaveLength(2);
      expect(screen.getByText('Continue with Google')).toBeInTheDocument();
      expect(screen.getByText('Continue with GitHub')).toBeInTheDocument();

      // All should be block buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      buttons.forEach(button => {
        expect(button.className).toContain('cl-socialButtonsBlockButton');
      });
    });

    it('renders last auth button with full text and 2 remaining with short text as block buttons', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withSocialProvider({ provider: 'github' });
        f.withSocialProvider({ provider: 'facebook' });
      });

      // Set last authentication strategy
      fixtures.clerk.client.lastAuthenticationStrategy = 'oauth_google';

      render(
        <CardStateProvider>
          <SocialButtons
            enableOAuthProviders
            enableWeb3Providers={false}
            enableAlternativePhoneCodeProviders={false}
            oauthCallback={async () => {}}
            web3Callback={async () => {}}
            alternativePhoneCodeCallback={() => {}}
            showLastAuthenticationStrategy
          />
        </CardStateProvider>,
        { wrapper },
      );

      // Last auth should show full text
      expect(screen.getByText('Continue with Google')).toBeInTheDocument();

      // Remaining 2 should show short text (because remaining count = 2)
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.queryByText('Continue with GitHub')).not.toBeInTheDocument();
      expect(screen.queryByText('Continue with Facebook')).not.toBeInTheDocument();

      // All should be block buttons (remaining count = 2, threshold = 2)
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      buttons.forEach(button => {
        expect(button.className).toContain('cl-socialButtonsBlockButton');
      });
    });

    it('renders last auth button with full text and 3 remaining as icon buttons (no visible text)', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withSocialProvider({ provider: 'github' });
        f.withSocialProvider({ provider: 'facebook' });
        f.withSocialProvider({ provider: 'apple' });
      });

      // Set last authentication strategy
      fixtures.clerk.client.lastAuthenticationStrategy = 'oauth_google';

      render(
        <CardStateProvider>
          <SocialButtons
            enableOAuthProviders
            enableWeb3Providers={false}
            enableAlternativePhoneCodeProviders={false}
            oauthCallback={async () => {}}
            web3Callback={async () => {}}
            alternativePhoneCodeCallback={() => {}}
            showLastAuthenticationStrategy
          />
        </CardStateProvider>,
        { wrapper },
      );

      // Last auth should show full text
      expect(screen.getByText('Continue with Google')).toBeInTheDocument();

      // Remaining 3 are icon buttons (no visible text, only alt text on images)
      expect(screen.getByAltText('Sign in with GitHub')).toBeInTheDocument();
      expect(screen.getByAltText('Sign in with Facebook')).toBeInTheDocument();
      expect(screen.getByAltText('Sign in with Apple')).toBeInTheDocument();

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);

      // First button (last auth) should be block button
      expect(buttons[0].className).toContain('cl-socialButtonsBlockButton');

      // Remaining 3 should be icon buttons (remaining count = 3 > threshold)
      for (let i = 1; i < buttons.length; i++) {
        expect(buttons[i].className).toContain('cl-socialButtonsIconButton');
      }
    });

    it('uses last authentication strategy badge for the last auth button', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withSocialProvider({ provider: 'github' });
      });

      // Set last authentication strategy
      fixtures.clerk.client.lastAuthenticationStrategy = 'oauth_google';

      const { container } = render(
        <CardStateProvider>
          <SocialButtons
            enableOAuthProviders
            enableWeb3Providers={false}
            enableAlternativePhoneCodeProviders={false}
            oauthCallback={async () => {}}
            web3Callback={async () => {}}
            alternativePhoneCodeCallback={() => {}}
            showLastAuthenticationStrategy
          />
        </CardStateProvider>,
        { wrapper },
      );

      // Should have the last authentication strategy badge
      const badge = container.querySelector('.cl-lastAuthenticationStrategyBadge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Last used');
    });
  });

  describe('Edge Cases', () => {
    it('handles when showLastAuthenticationStrategy is false', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withSocialProvider({ provider: 'github' });
      });

      // Set last authentication strategy but showLastAuthenticationStrategy is false
      fixtures.clerk.client.lastAuthenticationStrategy = 'oauth_google';

      render(
        <CardStateProvider>
          <SocialButtons
            enableOAuthProviders
            enableWeb3Providers={false}
            enableAlternativePhoneCodeProviders={false}
            oauthCallback={async () => {}}
            web3Callback={async () => {}}
            alternativePhoneCodeCallback={() => {}}
            showLastAuthenticationStrategy={false}
          />
        </CardStateProvider>,
        { wrapper },
      );

      // Should behave as if there's no last auth (2 providers with short text)
      expect(screen.getByText('Google')).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument();
    });

    it('handles when lastAuthenticationStrategy does not match any provider', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withSocialProvider({ provider: 'github' });
      });

      // Set last authentication strategy to a provider that doesn't exist
      fixtures.clerk.client.lastAuthenticationStrategy = 'oauth_facebook';

      render(
        <CardStateProvider>
          <SocialButtons
            enableOAuthProviders
            enableWeb3Providers={false}
            enableAlternativePhoneCodeProviders={false}
            oauthCallback={async () => {}}
            web3Callback={async () => {}}
            alternativePhoneCodeCallback={() => {}}
            showLastAuthenticationStrategy
          />
        </CardStateProvider>,
        { wrapper },
      );

      // Should behave as if there's no last auth
      expect(screen.getByText('Google')).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument();
    });
  });
});
