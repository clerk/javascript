import { useSamlOktaCreateAppStepController } from './saml-okta-create-app-step.controller';
import { useSamlOktaCreateAppStepModel } from './saml-okta-create-app-step.model';
import { SamlOktaCreateAppStepView } from './saml-okta-create-app-step.view';

export const SamlOktaCreateAppStep = (): JSX.Element => {
  const model = useSamlOktaCreateAppStepModel();
  const controller = useSamlOktaCreateAppStepController(model.acsUrl, model.spEntityId);
  return (
    <SamlOktaCreateAppStepView
      {...model}
      {...controller}
    />
  );
};
