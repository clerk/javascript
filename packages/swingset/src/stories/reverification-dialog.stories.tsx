import type {
  ReverificationAttempt,
  ReverificationAttemptResult,
  ReverificationChallenge,
  ReverificationCompleteResult,
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
  stage: 'first',
  strategy: 'password',
};

const emailFactor: ReverificationEmailCodeFactor = {
  stage: 'first',
  strategy: 'email_code',
  emailAddressId: 'email_1',
  safeIdentifier: 'a••••@clerk.dev',
};

const firstPhoneFactor: ReverificationFirstFactorPhoneCodeFactor = {
  stage: 'first',
  strategy: 'phone_code',
  phoneNumberId: 'phone_1',
  safeIdentifier: '••••4242',
};

const passkeyFactor: ReverificationPasskeyFactor = {
  stage: 'first',
  strategy: 'passkey',
};

const secondPhoneFactor: ReverificationSecondFactorPhoneCodeFactor = {
  stage: 'second',
  strategy: 'phone_code',
  phoneNumberId: 'phone_2',
  safeIdentifier: '••••8675',
};

const secondFactors: ReverificationSecondFactor[] = [
  secondPhoneFactor,
  { stage: 'second', strategy: 'totp' },
  { stage: 'second', strategy: 'backup_code' },
];

const firstFactors: ReverificationFirstFactor[] = [passwordFactor, emailFactor, firstPhoneFactor, passkeyFactor];

// Only the launch buttons need these. The dialog names a method from its own messages.
const factorStoryDetails = (factor: ReverificationFirstFactor | ReverificationSecondFactor) => {
  switch (factor.strategy) {
    case 'email_code':
      return { id: factor.emailAddressId, name: 'email code' };
    case 'phone_code':
      return { id: factor.phoneNumberId, name: 'SMS code' };
    case 'totp':
      return { id: factor.strategy, name: 'authenticator app' };
    case 'backup_code':
      return { id: factor.strategy, name: 'backup code' };
    default:
      return { id: factor.strategy, name: factor.strategy };
  }
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
  ...firstFactors.map(factor => {
    const details = factorStoryDetails(factor);
    return {
      id: `first-${details.id}`,
      label: `First factor — ${details.name}`,
      challenge: { status: 'needs_first_factor' as const, factors: firstFactors, initialFactor: factor },
    };
  }),
  {
    id: 'first-then-second',
    label: 'First factor → second factor',
    challenge: { status: 'needs_first_factor', factors: firstFactors, initialFactor: passwordFactor },
    continuesToSecondFactor: true,
  },
  {
    id: 'choose-second',
    label: 'Second factor — choose method',
    challenge: { status: 'needs_second_factor', factors: secondFactors },
  },
  ...secondFactors.map(factor => {
    const details = factorStoryDetails(factor);
    return {
      id: `second-${details.id}`,
      label: `Second factor — ${details.name}`,
      challenge: { status: 'needs_second_factor' as const, factors: secondFactors, initialFactor: factor },
    };
  }),
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
      return { status: 'complete', sessionId: 'sess_story' };
    },
    [scenario.continuesToSecondFactor],
  );
  // The view finishes in a final state, so the story unmounts it to make the demo repeatable.
  // Deferred a tick because the machine reports cancellation from inside its own transition.
  const finish = React.useCallback(() => window.setTimeout(onFinished, 0), [onFinished]);
  // Stands in for activating the session, which the dialog waits out before it closes.
  const onComplete = React.useCallback(
    async (_result: ReverificationCompleteResult) => {
      await settleAfter(800);
      finish();
    },
    [finish],
  );

  return (
    <ReverificationDialogView
      initialChallenge={scenario.challenge}
      prepare={prepare}
      attempt={attempt}
      onComplete={onComplete}
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
