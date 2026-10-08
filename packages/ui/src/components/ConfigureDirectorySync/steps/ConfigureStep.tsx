import { useConfigureStepController } from './configure-step.controller';
import { useConfigureStepModel } from './configure-step.model';
import { ConfigureStepView } from './configure-step.view';

export const ConfigureStep = (): JSX.Element => {
  const model = useConfigureStepModel();
  const controller = useConfigureStepController(model);
  return (
    <ConfigureStepView
      {...model}
      {...controller}
    />
  );
};
