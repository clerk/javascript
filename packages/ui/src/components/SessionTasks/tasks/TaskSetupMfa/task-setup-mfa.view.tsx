import { Wizard } from '@/common';
import { Flow } from '@/customizables';

import { SetupMfaStartScreen } from './SetupMfaStartScreen';
import { SmsCodeFlow } from './SmsCodeFlowScreen';
import type { useTaskSetupMfaController } from './task-setup-mfa.controller';
import { TOTPCodeFlow } from './TOTPCodeFlowScreen';

export const TaskSetupMfaView = ({ controller }: { controller: ReturnType<typeof useTaskSetupMfaController> }) => (
  <Flow.Root flow='taskSetupMfa'>
    <Wizard
      {...controller.wizardProps}
      animate={false}
    >
      <Flow.Part part='methodSelectionMFA'>
        <SetupMfaStartScreen
          availableMethods={controller.availableMethods}
          goToStep={controller.goToStep}
        />
      </Flow.Part>
      <Flow.Part part='phoneCode2Fa'>
        <SmsCodeFlow
          onSuccess={controller.onSuccess}
          goToStartStep={controller.goToStartStep}
        />
      </Flow.Part>
      <Flow.Part part='totp2Fa'>
        <TOTPCodeFlow
          onSuccess={controller.onSuccess}
          goToStartStep={controller.goToStartStep}
        />
      </Flow.Part>
    </Wizard>
  </Flow.Root>
);
