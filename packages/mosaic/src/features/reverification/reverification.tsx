import { useEffect, useState } from 'react';

import { useMosaicSupportEmail } from '../../hooks/useMosaicSupportEmail';
import { childActor } from '../../machine/createActor';
import type { Actor, AnyActor, Snapshot } from '../../machine/types';
import { useActor } from '../../machine/useMachine';
import {
  RESEND_COOLDOWN_MS,
  type ReverificationContext,
  type ReverificationEvent,
  reverificationMachine,
} from './reverification.machine';
import type { ReverificationMethod, ReverificationStep } from './reverification.types';
import { otpChannelFor } from './reverification.utils';
import { ReverificationPending, ReverificationUnavailable, ReverificationView } from './reverification.view';

function factorStep(method: ReverificationMethod): ReverificationStep {
  if (method.strategy === 'password') {
    return 'password';
  }
  if (method.strategy === 'passkey') {
    return 'passkey';
  }
  if (method.strategy === 'backup_code') {
    return 'backup-code';
  }
  return 'otp';
}

function viewStep(snapshot: Snapshot<ReverificationContext>): ReverificationStep | undefined {
  if (snapshot.matches('factor.help') || snapshot.matches('methods.help')) {
    return 'help';
  }
  if (snapshot.matches('methods')) {
    return 'method-picker';
  }
  const method = snapshot.context.activeMethod;
  return method ? factorStep(method) : undefined;
}

function useResendCooldown(resendAvailableAt: number | undefined) {
  const [now, setNow] = useState(() => Date.now());
  const canResend = resendAvailableAt === undefined || now >= resendAvailableAt;

  useEffect(() => {
    if (canResend) {
      return;
    }
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [canResend, resendAvailableAt]);

  return {
    canResend,
    resendRemainingSeconds:
      !canResend && resendAvailableAt
        ? Math.min(RESEND_COOLDOWN_MS / 1000, Math.max(0, Math.ceil((resendAvailableAt - now) / 1000)))
        : undefined,
  };
}

function ReverificationChallenge({ actor }: { actor: Actor<ReverificationContext, ReverificationEvent> }) {
  const [snapshot, send] = useActor(actor);
  const supportEmail = useMosaicSupportEmail();
  const { context } = snapshot;
  const resend = useResendCooldown(context.resendAvailableAt);

  if (snapshot.matches('unavailable')) {
    return <ReverificationUnavailable />;
  }

  const step = viewStep(snapshot);
  if (!step) {
    return <ReverificationPending />;
  }

  const activeMethod = context.activeMethod;

  return (
    <ReverificationView
      step={step}
      direction={context.direction}
      value={context.inputValue}
      onValueChange={value => send({ type: 'TYPE', value })}
      errorMessage={context.errorMessage}
      isPending={snapshot.matches('factor.submitting') || snapshot.matches('finishing') || snapshot.matches('verified')}
      onSubmit={() => send({ type: 'SUBMIT' })}
      onShowMethods={() => send({ type: 'SHOW_METHODS' })}
      onShowHelp={() => send({ type: 'SHOW_HELP' })}
      onBack={() => send({ type: 'BACK' })}
      onEmailSupport={() => {
        if (supportEmail) {
          window.location.assign(`mailto:${supportEmail}`);
        }
      }}
      methods={context.methods.filter(method => method.id !== activeMethod?.id)}
      pendingMethodId={snapshot.matches('methods.preparing') ? context.pendingMethod?.id : undefined}
      onSelectMethod={id => send({ type: 'SELECT_METHOD', id })}
      otpChannel={activeMethod ? otpChannelFor(activeMethod.strategy) : undefined}
      onResend={() => send({ type: 'RESEND' })}
      canResend={resend.canResend}
      resendRemainingSeconds={resend.resendRemainingSeconds}
    />
  );
}

export function Reverification({ actor }: { actor: AnyActor | undefined }) {
  const challenge = childActor(actor, reverificationMachine);
  if (!challenge) {
    return null;
  }
  return <ReverificationChallenge actor={challenge} />;
}
