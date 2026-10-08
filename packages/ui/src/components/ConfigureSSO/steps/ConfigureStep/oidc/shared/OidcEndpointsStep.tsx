import type { OidcIdpConfigurationMode } from '../../shared/IdentityProviderConfigurationModes';
import { useOidcEndpointsStepController } from './oidc-endpoints-step.controller';
import { useOidcEndpointsStepModel } from './oidc-endpoints-step.model';
import { OidcEndpointsStepView } from './oidc-endpoints-step.view';

interface OidcEndpointsStepProps {
  mode: OidcIdpConfigurationMode;
  onModeChange: (mode: OidcIdpConfigurationMode) => void;
}

export const OidcEndpointsStep = ({ mode, onModeChange }: OidcEndpointsStepProps): JSX.Element => {
  const model = useOidcEndpointsStepModel();
  const controller = useOidcEndpointsStepController(mode, onModeChange, model);
  return <OidcEndpointsStepView {...controller} />;
};
