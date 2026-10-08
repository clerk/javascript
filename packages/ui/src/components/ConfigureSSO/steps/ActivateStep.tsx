import { useActivateStepController } from './activate-step.controller';
import { useActivateStepModel } from './activate-step.model';
import { ActivateStepView } from './activate-step.view';

export const ActivateStep = (): JSX.Element => {
  const model = useActivateStepModel();
  const controller = useActivateStepController(model);
  return (
    <ActivateStepView
      {...model}
      {...controller}
    />
  );
};
