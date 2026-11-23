import { frFR } from '@clerk/localizations';
import type { LocalizationResource } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures, render, screen } from '@/test/utils';
import { AppearanceProvider } from '@/ui/customizables';
import { CardStateProvider } from '@/ui/elements/contexts';

import { PasswordInput } from '../PasswordInput';
import { SocialButtons } from '../SocialButtons';

describe.each(['SignIn', 'SignUp'] as const)('%s accessible labels', component => {
  const { createFixtures } = bindCreateFixtures(component);

  it.each(['auto', 'iconButton', 'blockButton'] as const)(
    'localizes OAuth accessible names with the %s layout',
    async socialButtonsVariant => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'apple' });
        f.withSocialProvider({ provider: 'facebook' });
        f.withSocialProvider({ provider: 'google' });
      });
      fixtures.options.localization = {
        ...frFR,
        socialButtonsBlockButton: 'Se connecter avec {{provider}}',
        socialButtonsBlockButtonManyInView: 'Utiliser {{provider|titleize}}',
      };

      render(
        <AppearanceProvider
          appearanceKey={component === 'SignIn' ? 'signIn' : 'signUp'}
          appearance={{ options: { socialButtonsVariant } }}
        >
          <CardStateProvider>
            <SocialButtons
              oauthCallback={vi.fn()}
              web3Callback={vi.fn()}
              alternativePhoneCodeCallback={vi.fn()}
              enableOAuthProviders
              enableWeb3Providers={false}
              enableAlternativePhoneCodeProviders={false}
            />
          </CardStateProvider>
        </AppearanceProvider>,
        { wrapper },
      );

      for (const provider of ['Apple', 'Facebook', 'Google']) {
        const name = socialButtonsVariant === 'blockButton' ? `Utiliser ${provider}` : `Se connecter avec ${provider}`;
        const button = screen.getByRole('button', { name, exact: true });
        expect(button).toHaveAccessibleName(name);
        expect(button.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
      }
      expect(screen.queryByRole('button', { name: /Sign in with/ })).not.toBeInTheDocument();
    },
  );

  it.each(['auto', 'iconButton', 'blockButton'] as const)(
    'includes the localized last-used badge in the accessible name with the %s layout',
    async socialButtonsVariant => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'apple' });
        f.withSocialProvider({ provider: 'facebook' });
        f.withSocialProvider({ provider: 'google' });
      });
      fixtures.clerk.client.lastAuthenticationStrategy = 'oauth_google';
      fixtures.options.localization = {
        ...frFR,
        lastAuthenticationStrategy: 'Dernière utilisation',
        socialButtonsBlockButton: 'Se connecter avec {{provider}}',
      };

      render(
        <AppearanceProvider
          appearanceKey={component === 'SignIn' ? 'signIn' : 'signUp'}
          appearance={{ options: { socialButtonsVariant } }}
        >
          <CardStateProvider>
            <SocialButtons
              oauthCallback={vi.fn()}
              web3Callback={vi.fn()}
              alternativePhoneCodeCallback={vi.fn()}
              enableOAuthProviders
              enableWeb3Providers={false}
              enableAlternativePhoneCodeProviders={false}
              showLastAuthenticationStrategy
            />
          </CardStateProvider>
        </AppearanceProvider>,
        { wrapper },
      );

      expect(
        screen.getByRole('button', { name: 'Dernière utilisation Se connecter avec Google', exact: true }),
      ).toBeVisible();
    },
  );

  it.each([
    { localization: frFR, show: 'Afficher le mot de passe', hide: 'Masquer le mot de passe' },
    {
      localization: { formFieldAction__showPassword: 'Révéler', formFieldAction__hidePassword: 'Cacher' },
      show: 'Révéler',
      hide: 'Cacher',
    },
    { localization: { locale: 'fr-FR' }, show: 'Show password', hide: 'Hide password' },
  ] satisfies { localization: LocalizationResource; show: string; hide: string }[])(
    'uses $show / $hide while toggling password visibility',
    async ({ localization, show, hide }) => {
      const { wrapper, fixtures } = await createFixtures();
      fixtures.options.localization = localization;

      const { userEvent } = render(
        <PasswordInput
          aria-label='Password'
          setError={vi.fn()}
          setWarning={vi.fn()}
          setSuccess={vi.fn()}
          setInfo={vi.fn()}
          setHasPassedComplexity={vi.fn()}
        />,
        { wrapper },
      );

      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
      await userEvent.click(screen.getByRole('button', { name: show, exact: true }));
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
      await userEvent.click(screen.getByRole('button', { name: hide, exact: true }));
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
      expect(screen.getByRole('button', { name: show, exact: true })).toBeInTheDocument();
    },
  );
});
