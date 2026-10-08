import { useSelectProviderStepController } from './select-provider-step.controller';
import { useSelectProviderStepModel } from './select-provider-step.model';
import { SelectProviderStepView } from './select-provider-step.view';

export const SelectProviderStep = (): JSX.Element => {
  const model = useSelectProviderStepModel();
  const controller = useSelectProviderStepController(model);
  return (
    <SelectProviderStepView
      {...model}
      {...controller}
    />
  );
};
