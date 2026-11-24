import { useEffect, useState } from 'react';

import { usePendingAction } from '../../../hooks/use-pending-action';
import { useResendSeconds } from '../../../hooks/use-resend-seconds';
import type { ErrorDescription } from '../../../localization';
import { useErrorText } from '../../../localization';
import { setup } from '../../../machine/setup';
import type { ErrorInvokeEvent } from '../../../machine/types';
import { useMachine } from '../../../machine/use-machine';
import { toLocalizableError } from '../../../utils/errors';
import { CODE_RESEND_SECONDS, isResendUnlocked, resendUnlockTime } from '../../../utils/verification';
import type { SignUpVerificationModel } from '../sign-up.model';
import type { SignUpVerifyScreen } from '../sign-up.types';

interface CodeContext {
  sendCode: SignUpVerificationModel['send'];
  resendAvailableAt: number | undefined;
  error: ErrorDescription | undefined;
}

type CodeEvent = { type: 'SEND' } | { type: 'RESEND' } | { type: 'SEND_SMS' } | { type: 'ALREADY_SENT' };

const code = setup<CodeContext, CodeEvent>();

const clearError = code.assign(() => ({ error: undefined }));

const sendBySms = { target: 'sendingSms' as const, actions: clearError };

const startCooldown = code.assign(() => ({ resendAvailableAt: resendUnlockTime(CODE_RESEND_SECONDS) }));

const settleSend = {
  onDone: { target: 'sent' as const, actions: startCooldown },
  onError: {
    target: 'sent' as const,
    actions: code.assign<ErrorInvokeEvent>((_, event) => ({
      error: toLocalizableError(event.error),
      resendAvailableAt: resendUnlockTime(CODE_RESEND_SECONDS),
    })),
  },
};

const codeMachine = code.createMachine({
  id: 'signUpCode',
  initial: 'idle',
  context: {
    sendCode: () => Promise.resolve(),
    resendAvailableAt: undefined,
    error: undefined,
  },
  states: {
    idle: {
      on: {
        SEND: 'sending',
        RESEND: 'sending',
        SEND_SMS: sendBySms,
        ALREADY_SENT: { target: 'sent', actions: startCooldown },
      },
    },
    // With no channel, the code goes out over the channel the last code used, which the model reads from the sign-up.
    sending: { invoke: code.fromPromise(context => context.sendCode(), settleSend) },
    sendingSms: { invoke: code.fromPromise(context => context.sendCode({ channel: 'sms' }), settleSend) },
    sent: {
      on: {
        SEND: { target: 'sending', actions: clearError },
        SEND_SMS: sendBySms,
        RESEND: {
          target: 'sending',
          guard: context => isResendUnlocked(context.resendAvailableAt),
          actions: clearError,
        },
      },
    },
  },
});

type SignUpVerifyOptions = Pick<SignUpVerifyScreen, 'verification' | 'onNext' | 'isPending' | 'globalErrorMessage'>;

export function useSignUpVerifyController({
  verification,
  onNext,
  isPending: isFlowPending,
  globalErrorMessage,
}: SignUpVerifyOptions) {
  const { needsCode, send: sendCode } = verification;
  const [value, setValue] = useState('');
  const actions = usePendingAction<'code'>();
  const errorText = useErrorText();
  const [snapshot, send] = useMachine(codeMachine, { context: { sendCode } });
  const resendSeconds = useResendSeconds(snapshot.context.resendAvailableAt, CODE_RESEND_SECONDS);

  useEffect(() => {
    send({ type: needsCode ? 'SEND' : 'ALREADY_SENT' });
  }, [needsCode, send]);

  const isSwitchingToSms = snapshot.value === 'sendingSms';
  const isPending = actions.isPending || isFlowPending || isSwitchingToSms;
  const submit = (submitted: string) =>
    void actions.run('code', async () => onNext(await verification.verify(submitted)));

  return {
    value,
    onValueChange: setValue,
    onSubmit: () => submit(value),
    onComplete: submit,
    isPending,
    canEditIdentifier: !isPending && snapshot.value !== 'sending',
    errorMessage: actions.error,
    globalErrorMessage: snapshot.context.error ? errorText(snapshot.context.error) : globalErrorMessage,
    onResend: () => {
      setValue('');
      send({ type: 'RESEND' });
    },
    onSendSms: verification.provider
      ? () => {
          setValue('');
          send({ type: 'SEND_SMS' });
        }
      : undefined,
    canResend: snapshot.value === 'sent' && resendSeconds === 0 && !isPending,
    resendRemainingSeconds: resendSeconds || undefined,
  };
}
