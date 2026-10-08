import { useSamlCustomCreateAppStepController } from './saml-custom-create-app-step.controller';
import { useSamlCustomCreateAppStepModel } from './saml-custom-create-app-step.model';
import { SamlCustomCreateAppStepView } from './saml-custom-create-app-step.view';

export const SamlCustomCreateAppStep = (): JSX.Element => {
  const model = useSamlCustomCreateAppStepModel();
  const controller = useSamlCustomCreateAppStepController(model.acsUrl, model.spEntityId);
  return (
    <SamlCustomCreateAppStepView
      {...model}
      {...controller}
    />
  );
};
