import { useSamlCustomMetadataStepController } from './saml-custom-metadata-step.controller';
import { useSamlCustomMetadataStepModel } from './saml-custom-metadata-step.model';
import { SamlCustomMetadataStepView } from './saml-custom-metadata-step.view';

export const SamlCustomIdentityProviderMetadataStep = (): JSX.Element => {
  const model = useSamlCustomMetadataStepModel();
  const controller = useSamlCustomMetadataStepController(model);
  return <SamlCustomMetadataStepView {...controller} />;
};
