import type {
  ReverificationAttempt,
  ReverificationAttemptResult,
  ReverificationChallenge,
  ReverificationEmailCodeFactor,
  ReverificationFirstFactor,
  ReverificationFirstFactorPhoneCodeFactor,
  ReverificationPasskeyFactor,
  ReverificationPasswordFactor,
  ReverificationPreparationFactor,
  ReverificationSecondFactor,
  ReverificationSecondFactorPhoneCodeFactor,
} from '@clerk/ui/mosaic/blocks/reverification-dialog';
import { ReverificationDialogView } from '@clerk/ui/mosaic/blocks/reverification-dialog';
import { Button } from '@clerk/ui/mosaic/components/button';
import React from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './reverification-dialog.stories?raw';

export const meta: StoryMeta = {
  group: 'Blocks',
  title: 'ReverificationDialog',
  source: 'packages/ui/src/mosaic/blocks/reverification-dialog/reverification-dialog.view.tsx',
};

const passwordFactor: ReverificationPasswordFactor = {
  id: 'password',
  stage: 'first',
  strategy: 'password',
};

const emailFactor: ReverificationEmailCodeFactor = {
  id: 'email_1',
  stage: 'first',
  strategy: 'email_code',
  emailAddressId: 'email_1',
  safeIdentifier: 'a••••@clerk.dev',
};

const firstPhoneFactor: ReverificationFirstFactorPhoneCodeFactor = {
  id: 'phone_1',
  stage: 'first',
  strategy: 'phone_code',
  phoneNumberId: 'phone_1',
  safeIdentifier: '••••4242',
};

const passkeyFactor: ReverificationPasskeyFactor = {
  id: 'passkey',
  stage: 'first',
  strategy: 'passkey',
};

const secondPhoneFactor: ReverificationSecondFactorPhoneCodeFactor = {
  id: 'phone_2',
  stage: 'second',
  strategy: 'phone_code',
  phoneNumberId: 'phone_2',
  safeIdentifier: '••••8675',
};

const secondFactors: ReverificationSecondFactor[] = [
  secondPhoneFactor,
  { id: 'totp', stage: 'second', strategy: 'totp' },
  { id: 'backup_code', stage: 'second', strategy: 'backup_code' },
];

const firstFactors: ReverificationFirstFactor[] = [passwordFactor, emailFactor, firstPhoneFactor, passkeyFactor];

// Only the launch buttons need these. The dialog names a method from its own messages.
const factorNames: Record<string, string> = {
  password: 'password',
  email_1: 'email code',
  phone_1: 'SMS code',
  passkey: 'passkey',
  phone_2: 'SMS code',
  totp: 'authenticator app',
  backup_code: 'backup code',
};

interface Scenario {
  id: string;
  label: string;
  challenge: ReverificationChallenge;
  continuesToSecondFactor?: boolean;
}

const scenarios: Scenario[] = [
  {
    id: 'choose-first',
    label: 'First factor — choose method',
    challenge: { status: 'needs_first_factor', factors: firstFactors },
  },
  ...firstFactors.map(factor => ({
    id: `first-${factor.id}`,
    label: `First factor — ${factorNames[factor.id]}`,
    challenge: { status: 'needs_first_factor' as const, factors: firstFactors, initialFactorId: factor.id },
  })),
  {
    id: 'first-then-second',
    label: 'First factor → second factor',
    challenge: { status: 'needs_first_factor', factors: firstFactors, initialFactorId: passwordFactor.id },
    continuesToSecondFactor: true,
  },
  {
    id: 'choose-second',
    label: 'Second factor — choose method',
    challenge: { status: 'needs_second_factor', factors: secondFactors },
  },
  ...secondFactors.map(factor => ({
    id: `second-${factor.id}`,
    label: `Second factor — ${factorNames[factor.id]}`,
    challenge: { status: 'needs_second_factor' as const, factors: secondFactors, initialFactorId: factor.id },
  })),
];

const settleAfter = (ms: number) => new Promise<void>(resolve => window.setTimeout(resolve, ms));

function MachineDrivenDialog({ scenario, onFinished }: { scenario: Scenario; onFinished: () => void }) {
  const prepare = React.useCallback(async (_factor: ReverificationPreparationFactor) => {
    await settleAfter(600);
  }, []);
  const attempt = React.useCallback(
    async (attemptValue: ReverificationAttempt): Promise<ReverificationAttemptResult> => {
      await settleAfter(800);
      if (scenario.continuesToSecondFactor && attemptValue.factor.stage === 'first') {
        return { status: 'needs_second_factor', factors: secondFactors };
      }
      return { status: 'complete' };
    },
    [scenario.continuesToSecondFactor],
  );
  // The view finishes in a final state, so the story unmounts it to make the demo repeatable.
  // Deferred a tick because the machine reports cancellation from inside its own transition.
  const finish = React.useCallback(() => window.setTimeout(onFinished, 0), [onFinished]);
  // Stands in for activating the session, which the dialog waits out before it closes.
  const complete = React.useCallback(async () => {
    await settleAfter(800);
    finish();
  }, [finish]);

  return (
    <ReverificationDialogView
      challenge={scenario.challenge}
      prepare={prepare}
      attempt={attempt}
      onComplete={complete}
      onCancel={finish}
      supportEmail='support@clerk.dev'
    />
  );
}

export function Default() {
  const [active, setActive] = React.useState<{ scenario: Scenario; runId: number } | null>(null);
  const runIdRef = React.useRef(0);

  const openScenario = (scenario: Scenario) => {
    runIdRef.current += 1;
    setActive({ scenario, runId: runIdRef.current });
  };

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {scenarios.map(scenario => (
          <Button
            key={scenario.id}
            aria-haspopup='dialog'
            variant='outline'
            onClick={() => openScenario(scenario)}
          >
            {scenario.label}
          </Button>
        ))}
      </div>
      {active ? (
        <MachineDrivenDialog
          key={active.runId}
          scenario={active.scenario}
          onFinished={() => setActive(null)}
        />
      ) : null}
    </>
  );
}
