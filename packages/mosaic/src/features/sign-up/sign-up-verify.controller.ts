import { useEffect, useState } from 'react';

import { usePendingAction } from '../../hooks/use-pending-action';
import { useResendSeconds } from '../../hooks/use-resend-seconds';
import type { ErrorDescription } from '../../localization';
import { useErrorText } from '../../localization';
import { setup } from '../../machine/setup';
import type { ErrorInvokeEvent } from '../../machine/types';
import { useMachine } from '../../machine/use-machine';
import { toLocalizableError } from '../../utils/errors';
import { CODE_RESEND_SECONDS, isResendUnlocked, resendUnlockTime } from '../../utils/verification';
import type { SignUpVerifyScreen } from './sign-up.types';

interface CodeContext {
  sendCode: () => Promise<void>;
  resendAvailableAt: number | undefined;
  error: ErrorDescription | undefined;
}

type CodeEvent = { type: 'SEND' } | { type: 'RESEND' };

const code = setup<CodeContext, CodeEvent>();

const clearError = code.assign(() => ({ error: undefined }));

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
      on: { SEND: 'sending', RESEND: 'sending' },
    },
    sending: {
      invoke: code.fromPromise(context => context.sendCode(), {
        onDone: {
          target: 'sent',
          actions: code.assign(() => ({ resendAvailableAt: resendUnlockTime(CODE_RESEND_SECONDS) })),
        },
        onError: {
          target: 'sent',
          actions: code.assign<ErrorInvokeEvent>((_, event) => ({ error: toLocalizableError(event.error) })),
        },
      }),
    },
    sent: {
      on: {
        SEND: { target: 'sending', actions: clearError },
        RESEND: {
          target: 'sending',
          guard: context => isResendUnlocked(context.resendAvailableAt),
          actions: clearError,
        },
      },
    },
  },
});

type SignUpVerifyOptions = Pick<
  SignUpVerifyScreen,
  'needsCode' | 'sendCode' | 'verifyCode' | 'isPending' | 'globalErrorMessage'
>;

export function useSignUpVerifyController({
  needsCode,
  sendCode,
  verifyCode,
  isPending: isFlowPending,
  globalErrorMessage,
}: SignUpVerifyOptions) {
  const [value, setValue] = useState('');
  const actions = usePendingAction<'code'>();
  const errorText = useErrorText();
  const [snapshot, send, actor] = useMachine(codeMachine, { context: { sendCode } });
  const resendSeconds = useResendSeconds(snapshot.context.resendAvailableAt, CODE_RESEND_SECONDS);

  /* eslint-disable react-you-might-not-need-an-effect/no-event-handler -- Sends the code when the screen mounts on a step with none out, which a reload or a redirect reaches with no event. */
  useEffect(() => {
    if (needsCode) {
      send({ type: 'SEND' });
    }
  }, [needsCode, send]);
  /* eslint-enable react-you-might-not-need-an-effect/no-event-handler */

  const isPending = actions.isPending || isFlowPending;
  const submit = (submitted: string) => void actions.run('code', () => verifyCode(submitted));

  return {
    value,
    onValueChange: setValue,
    onSubmit: () => submit(value),
    onComplete: submit,
    isPending,
    errorMessage: actions.error,
    globalErrorMessage: snapshot.context.error ? errorText(snapshot.context.error) : globalErrorMessage,
    onResend: () => send({ type: 'RESEND' }),
    canResend: actor.can({ type: 'RESEND' }) && !isPending,
    resendRemainingSeconds: resendSeconds || undefined,
  };
}
