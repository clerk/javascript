import { useSamlGoogleMetadataStepController } from './saml-google-metadata-step.controller';
import { useSamlGoogleMetadataStepModel } from './saml-google-metadata-step.model';
import { SamlGoogleMetadataStepView } from './saml-google-metadata-step.view';

export const SamlGoogleIdentityProviderMetadataStep = (): JSX.Element => {
  const model = useSamlGoogleMetadataStepModel();
  const controller = useSamlGoogleMetadataStepController(model);
  return <SamlGoogleMetadataStepView {...controller} />;
};
