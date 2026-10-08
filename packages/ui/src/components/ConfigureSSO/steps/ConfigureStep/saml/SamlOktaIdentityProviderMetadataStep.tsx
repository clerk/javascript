import { useSamlOktaMetadataStepController } from './saml-okta-metadata-step.controller';
import { useSamlOktaMetadataStepModel } from './saml-okta-metadata-step.model';
import { SamlOktaMetadataStepView } from './saml-okta-metadata-step.view';

export const SamlOktaIdentityProviderMetadataStep = (): JSX.Element => {
  const model = useSamlOktaMetadataStepModel();
  const controller = useSamlOktaMetadataStepController(model);
  return <SamlOktaMetadataStepView {...controller} />;
};
