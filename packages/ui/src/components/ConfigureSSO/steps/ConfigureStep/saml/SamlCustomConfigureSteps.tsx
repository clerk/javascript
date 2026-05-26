import { Step } from '@/components/ConfigureSSO/elements/Step';
import { Wizard } from '@/components/ConfigureSSO/elements/Wizard';
import { InnerStepCounter } from '@/components/ConfigureSSO/elements/Wizard/InnerStepCounter';
import { localizationKeys } from '@/localization';

export const SamlCustomConfigureSteps = () => {
  return (
    <Wizard>
      <Wizard.Step id='create-app'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlCustom.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlCustom.createAppStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlCustomCreateAppStep />
      </Wizard.Step>
    </Wizard>
  );
};

const SamlCustomCreateAppStep = () => {
  return <div>SamlCustomCreateAppStep</div>;
};
