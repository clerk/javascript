import { useWizard } from '../../ConfigureSSO/elements/Wizard';
import { useAttributeMappingStepModel } from './attribute-mapping-step.model';
import { AttributeMappingStepView } from './attribute-mapping-step.view';

export const AttributeMappingStep = (): JSX.Element => {
  const model = useAttributeMappingStepModel();
  const { goNext, goPrev } = useWizard();
  return (
    <AttributeMappingStepView
      {...model}
      goNext={goNext}
      goPrev={goPrev}
    />
  );
};
