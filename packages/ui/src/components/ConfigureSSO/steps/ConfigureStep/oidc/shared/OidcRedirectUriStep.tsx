import { useOidcRedirectUriStepController } from './oidc-redirect-uri-step.controller';
import { useOidcRedirectUriStepModel } from './oidc-redirect-uri-step.model';
import { OidcRedirectUriStepView } from './oidc-redirect-uri-step.view';

export const OidcRedirectUriStep = (): JSX.Element => {
  const model = useOidcRedirectUriStepModel();
  const controller = useOidcRedirectUriStepController(model.redirectUri);
  return (
    <OidcRedirectUriStepView
      {...model}
      {...controller}
    />
  );
};
