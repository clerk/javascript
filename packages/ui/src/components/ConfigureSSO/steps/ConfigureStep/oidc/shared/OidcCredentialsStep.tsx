import type { OidcIdpConfigurationMode } from '../../shared/IdentityProviderConfigurationModes';
import { useOidcCredentialsStepController } from './oidc-credentials-step.controller';
import { useOidcCredentialsStepModel } from './oidc-credentials-step.model';
import { OidcCredentialsStepView } from './oidc-credentials-step.view';

interface OidcCredentialsStepProps {
  mode: OidcIdpConfigurationMode;
}

export const OidcCredentialsStep = ({ mode }: OidcCredentialsStepProps): JSX.Element => {
  const model = useOidcCredentialsStepModel();
  const controller = useOidcCredentialsStepController(mode, model);
  return <OidcCredentialsStepView {...controller} />;
};
