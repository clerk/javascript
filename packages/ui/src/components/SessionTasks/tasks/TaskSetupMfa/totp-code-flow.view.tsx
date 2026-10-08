import { Wizard } from '@/common';
import { Card } from '@/ui/elements/Card';

import { SharedFooterActionForSignOut } from './shared';
import type { useTotpCodeFlowController } from './totp-code-flow.controller';
import { AddAuthenticatorApp, TotpSuccessScreen, TotpVerifyStep } from './totp-code-flow.steps';

export const TotpCodeFlowView = ({ controller }: { controller: ReturnType<typeof useTotpCodeFlowController> }) => (
  <Card.Root>
    <Card.Content>
      <Wizard
        {...controller.wizardProps}
        animate={false}
      >
        {/* Step 0: Add new authenticator app (default if no available authenticator apps) */}
        <AddAuthenticatorApp
          model={controller.creation}
          onSuccess={controller.onAddSuccess}
          onReset={controller.onAddReset}
        />
        {/* Step 1: Verify TOTP */}
        <TotpVerifyStep
          key={controller.verification.scopeKey}
          onSuccess={controller.onVerifySuccess}
          onReset={controller.onVerifyReset}
          model={controller.verification}
        />
        {/* Step 2: Success with backup codes */}
        <TotpSuccessScreen
          backupCodes={controller.backupCodes}
          onFinish={controller.onFinish}
        />
      </Wizard>
    </Card.Content>
    <Card.Footer>
      <SharedFooterActionForSignOut />
    </Card.Footer>
  </Card.Root>
);
