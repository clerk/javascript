import { useSamlMicrosoftServiceProviderStepController } from './saml-microsoft-service-provider-step.controller';
import { useSamlMicrosoftServiceProviderStepModel } from './saml-microsoft-service-provider-step.model';
import { SamlMicrosoftServiceProviderStepView } from './saml-microsoft-service-provider-step.view';

export const SamlMicrosoftServiceProviderStep = (): JSX.Element => {
  const model = useSamlMicrosoftServiceProviderStepModel();
  const controller = useSamlMicrosoftServiceProviderStepController(model.acsUrl, model.spEntityId);
  return (
    <SamlMicrosoftServiceProviderStepView
      {...model}
      {...controller}
    />
  );
};
