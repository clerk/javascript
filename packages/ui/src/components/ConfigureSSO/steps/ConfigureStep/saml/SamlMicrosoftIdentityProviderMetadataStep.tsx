import { useSamlMicrosoftMetadataStepController } from './saml-microsoft-metadata-step.controller';
import { useSamlMicrosoftMetadataStepModel } from './saml-microsoft-metadata-step.model';
import { SamlMicrosoftMetadataStepView } from './saml-microsoft-metadata-step.view';

export const SamlMicrosoftIdentityProviderMetadataStep = (): JSX.Element => {
  const model = useSamlMicrosoftMetadataStepModel();
  const controller = useSamlMicrosoftMetadataStepController(model);
  return <SamlMicrosoftMetadataStepView {...controller} />;
};
