import { useConfigureStepController } from './configure-step.controller';
import { useConfigureProviderStepModel, useConfigureStepModel } from './configure-step.model';
import { ConfigureProviderStepView, ConfigureStepView } from './configure-step.view';

export { resolveConfigureSteps } from './configure-step.model';

export const ConfigureStep = (): JSX.Element => {
  const model = useConfigureStepModel();
  const controller = useConfigureStepController();
  return (
    <ConfigureStepView
      {...model}
      {...controller}
      configureProviderStep={<ConfigureProviderStep />}
    />
  );
};

export const ConfigureProviderStep = (): JSX.Element | null => {
  const model = useConfigureProviderStepModel();
  return <ConfigureProviderStepView {...model} />;
};
