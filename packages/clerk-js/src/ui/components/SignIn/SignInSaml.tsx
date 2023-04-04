import { buildSSOCallbackURL } from '../../common';
import { SamlCard } from '../../common/SamlCard';
import { useCoreSignIn, useEnvironment, useSignInContext } from '../../contexts';
import { withCardStateProvider } from '../../elements';
import { localizationKeys } from '../../localization';

function _SignInSaml() {
  const strategy = 'saml';
  const signIn = useCoreSignIn();
  const { displayConfig } = useEnvironment();
  const ctx = useSignInContext();
  const redirectUrl = buildSSOCallbackURL(ctx, displayConfig.signInUrl);
  const redirectUrlComplete = ctx.afterSignInUrl || displayConfig.afterSignInUrl;

  const handleSamlIdentifier = (samlIdentifier: string) => {
    return signIn.authenticateWithRedirect({ strategy, samlIdentifier, redirectUrl, redirectUrlComplete });
  };

  return (
    <SamlCard
      cardTitle={localizationKeys('signIn.saml.title')}
      cardSubtitle={localizationKeys('signIn.saml.subtitle')}
      handleSamlIdentifier={handleSamlIdentifier}
    />
  );
}

export const SignInSaml = withCardStateProvider(_SignInSaml);
