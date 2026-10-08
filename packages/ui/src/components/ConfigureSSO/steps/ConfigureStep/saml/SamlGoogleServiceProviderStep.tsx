import { useSamlGoogleServiceProviderStepController } from './saml-google-service-provider-step.controller';
import { useSamlGoogleServiceProviderStepModel } from './saml-google-service-provider-step.model';
import { SamlGoogleServiceProviderStepView } from './saml-google-service-provider-step.view';

export const SamlGoogleServiceProviderStep = (): JSX.Element => {
  const model = useSamlGoogleServiceProviderStepModel();
  const controller = useSamlGoogleServiceProviderStepController(model.acsUrl, model.spEntityId);
  return (
    <SamlGoogleServiceProviderStepView
      {...model}
      {...controller}
    />
  );
};
