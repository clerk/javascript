import { buildSSOCallbackURL } from '../../common';
import { SamlCard } from '../../common/SamlCard';
import { useCoreSignUp, useEnvironment, useSignUpContext } from '../../contexts';
import { withCardStateProvider } from '../../elements';
import { localizationKeys } from '../../localization';

function _SignUpSaml() {
  const strategy = 'saml';
  const signUp = useCoreSignUp();
  const ctx = useSignUpContext();
  const { displayConfig } = useEnvironment();
  const redirectUrl = buildSSOCallbackURL(ctx, displayConfig.signUpUrl);
  const redirectUrlComplete = ctx.afterSignUpUrl || displayConfig.afterSignUpUrl;

  // TODO handle continueSignUp
  const handleSamlIdentifier = (samlIdentifier: string) => {
    return signUp.authenticateWithRedirect({
      strategy,
      samlIdentifier,
      redirectUrl,
      redirectUrlComplete,
      continueSignUp: false,
    });
  };

  return (
    <SamlCard
      cardTitle={localizationKeys('signUp.saml.title')}
      cardSubtitle={localizationKeys('signUp.saml.subtitle')}
      handleSamlIdentifier={handleSamlIdentifier}
    />
  );
}

export const SignUpSaml = withCardStateProvider(_SignUpSaml);
