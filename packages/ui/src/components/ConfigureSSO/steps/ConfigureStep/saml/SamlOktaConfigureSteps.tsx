import { Step } from '@/components/ConfigureSSO/elements/Step';
import { Wizard } from '@/components/ConfigureSSO/elements/Wizard';
import { InnerStepCounter } from '@/components/ConfigureSSO/elements/Wizard/InnerStepCounter';
import { localizationKeys } from '@/localization';

export const SamlOktaConfigureSteps = () => {
  return (
    <Wizard>
      <Wizard.Step id='create-app'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlOkta.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlOkta.createAppStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>

        <SamlOktaCreateAppStep />
      </Wizard.Step>
    </Wizard>
  );
};

const SamlOktaCreateAppStep = () => {
  return <div>SamlOktaCreateAppStep</div>;
};
