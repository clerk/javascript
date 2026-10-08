import { Wizard } from '@/common';
import { Card } from '@/ui/elements/Card';

import { SharedFooterActionForSignOut } from './shared';
import type { useSmsCodeFlowController } from './sms-code-flow.controller';
import { SmsAddPhoneStep, SmsSelectPhoneStep, SmsSuccessStep, SmsVerifyPhoneStep } from './sms-code-flow.steps';

export const SmsCodeFlowView = ({ controller }: { controller: ReturnType<typeof useSmsCodeFlowController> }) => (
  <Card.Root>
    <Wizard
      {...controller.wizardProps}
      animate={false}
    >
      {/* Step 0: Add new phone (default if no available phones) */}
      <SmsAddPhoneStep
        onSuccess={controller.onAddSuccess}
        onReset={controller.onAddReset}
      />
      {/* Step 1: Verify phone */}
      <SmsVerifyPhoneStep
        onSuccess={controller.onVerifySuccess}
        onReset={controller.onVerifyReset}
      />
      {/* Step 2: Phone selection (default if available phones) */}
      <SmsSelectPhoneStep
        onSuccess={controller.onSelectSuccess}
        onReset={controller.onSelectReset}
        onAddPhoneClick={controller.onAddPhoneClick}
        onUnverifiedPhoneClick={controller.onUnverifiedPhoneClick}
      />
      {/* Step 3: Success with backup codes */}
      <SmsSuccessStep onFinish={controller.onFinish} />
    </Wizard>
    <Card.Footer>
      <SharedFooterActionForSignOut />
    </Card.Footer>
  </Card.Root>
);
