import { useMachine } from '../../machine/useMachine';
import type { ReverificationDialogMethod, ReverificationDialogProps } from './reverification-dialog';
import { ReverificationDialog } from './reverification-dialog';
import type { ReverificationDialogMachineContext } from './reverification-dialog.machine';
import { reverificationDialogMachine } from './reverification-dialog.machine';
import { fill, reverificationDialogBase as m } from './reverification-dialog.messages';
import type {
  ReverificationAttempt,
  ReverificationAttemptResult,
  ReverificationChallenge,
  ReverificationFactor,
  ReverificationPreparationFactor,
} from './reverification-dialog.types';

export interface ReverificationDialogViewProps {
  /** The methods this attempt may use, and which one to open on. */
  challenge: ReverificationChallenge;
  /** Sends a code for a method that delivers one. Reject to keep the user on the code step. */
  prepare: (factor: ReverificationPreparationFactor) => Promise<void>;
  /** Submits the user's answer. Resolving `needs_second_factor` moves the flow on to 2FA. */
  attempt: (attempt: ReverificationAttempt) => Promise<ReverificationAttemptResult>;
  /**
   * The user proved who they are. Awaited: the dialog stays up, pending, until this resolves,
   * so a caller can activate the session before the flow hands back.
   */
  onComplete: () => Promise<void>;
  /** The user gave up, or closed the dialog. */
  onCancel: () => void;
  /** Address behind the support action on a dead end. From Clerk's `useSupportEmail`. */
  supportEmail: string;
}

/**
 * Title, subtitle, field label, and resend copy for a method — keyed the way
 * `@clerk/localizations` keys it. `field` is absent for a method with nothing to type, and
 * `resendButton` for one that delivers no code.
 */
function copyFor(factor: ReverificationFactor): {
  title: string;
  subtitle: string;
  field?: { label: string; kind: 'code' | 'password' | 'text' };
  resendButton?: string;
} {
  switch (factor.strategy) {
    case 'password':
      return { ...m.password, field: { label: m.formFieldLabel__password, kind: 'password' } };
    case 'passkey':
      return m.passkey;
    case 'email_code':
      return { ...m.emailCode, field: { label: m.emailCode.formTitle, kind: 'code' } };
    case 'phone_code': {
      const copy = factor.stage === 'second' ? m.phoneCodeMfa : m.phoneCode;
      return { ...copy, field: { label: copy.formTitle, kind: 'code' } };
    }
    case 'totp':
      return { ...m.totpMfa, field: { label: m.totpMfa.formTitle, kind: 'code' } };
    case 'backup_code':
      return { ...m.backupCodeMfa, field: { label: m.formFieldLabel__backupCode, kind: 'text' } };
  }
}

function methodLabel(factor: ReverificationFactor): string {
  const alternatives = m.alternativeMethods;
  switch (factor.strategy) {
    case 'password':
      return alternatives.blockButton__password;
    case 'passkey':
      return alternatives.blockButton__passkey;
    case 'email_code':
      return fill(alternatives.blockButton__emailCode, { identifier: factor.safeIdentifier });
    case 'phone_code':
      return fill(alternatives.blockButton__phoneCode, { identifier: factor.safeIdentifier });
    case 'totp':
      return alternatives.blockButton__totp;
    case 'backup_code':
      return alternatives.blockButton__backupCode;
  }
}

const asMethod = (factor: ReverificationFactor): ReverificationDialogMethod => ({
  id: factor.id,
  label: methodLabel(factor),
});

const alternativesTo = (context: ReverificationDialogMachineContext) =>
  context.challenge.factors.filter(factor => factor.id !== context.currentFactor?.id);

/**
 * Drives {@link ReverificationDialog} with {@link reverificationDialogMachine}.
 *
 * Every decision about what the flow does next lives in the machine; this layer only turns a
 * snapshot into the block's props and the block's callbacks into events. The Clerk work arrives
 * as `prepare` and `attempt`, so the whole flow runs against plain promises in a test or a story.
 */
export function ReverificationDialogView({
  challenge,
  prepare,
  attempt,
  onComplete,
  onCancel,
  supportEmail,
}: ReverificationDialogViewProps) {
  const [snapshot, send, actor] = useMachine(reverificationDialogMachine, {
    context: { initialChallenge: challenge, prepare, attempt, complete: onComplete, cancel: onCancel },
  });
  const { context } = snapshot;

  // `useMachine` starts the actor in an effect, so the first render still sees the pre-start
  // state, before `initialChallenge` has been read. Nothing truthful can be drawn from it.
  if (snapshot.value === 'initializing') {
    return null;
  }

  // The one thing a user with no working method can still do. A navigation rather than a
  // callback, the way the legacy error card did it.
  const emailSupport = {
    label: m.alternativeMethods.getHelp.blockButton__emailSupport,
    onClick: () => {
      window.location.href = `mailto:${supportEmail}`;
    },
  };

  const base = {
    open: snapshot.status === 'active',
    onOpenChange: (open: boolean) => {
      if (!open) {
        send({ type: 'CANCEL' });
      }
    },
    closeLabel: m.closeButton,
    error: context.error?.location === 'form' ? context.error.message : undefined,
  };

  const props = ((): ReverificationDialogProps => {
    // Legacy gave this card no way back — there is no method to go back to.
    if (snapshot.value === 'unavailable') {
      return {
        ...base,
        step: 'message',
        title: m.noAvailableMethods.title,
        description: m.noAvailableMethods.message,
        action: emailSupport,
      };
    }

    if (snapshot.value === 'help') {
      return {
        ...base,
        step: 'message',
        title: m.alternativeMethods.getHelp.title,
        description: m.alternativeMethods.getHelp.content,
        action: emailSupport,
        back: { label: m.backButton, onClick: () => send({ type: 'BACK' }) },
      };
    }

    if (snapshot.value === 'selectingFactor') {
      const methods = context.currentFactor ? alternativesTo(context) : context.challenge.factors;
      return {
        ...base,
        step: 'choose',
        title: m.alternativeMethods.title,
        description: m.alternativeMethods.subtitle,
        methods: methods.map(asMethod),
        onSelectMethod: factorId => send({ type: 'SELECT_FACTOR', factorId }),
        back: actor.can({ type: 'BACK' }) ? { label: m.backButton, onClick: () => send({ type: 'BACK' }) } : undefined,
        cancelLabel: m.formButtonReset,
        help: { label: m.alternativeMethods.actionLink, onClick: () => send({ type: 'SHOW_HELP' }) },
      };
    }

    // Every remaining state is the flow working on the current method, so the step stays
    // mounted while a code is sent or an answer is checked.
    const factor = context.currentFactor;
    if (!factor) {
      return {
        ...base,
        step: 'message',
        title: m.noAvailableMethods.title,
        description: m.noAvailableMethods.message,
        action: emailSupport,
      };
    }

    const copy = copyFor(factor);
    const { resendButton } = copy;
    const isPending = snapshot.value === 'submitting' || snapshot.value === 'completing';
    // Only these two states accept a keystroke; anywhere else the field would swallow one.
    const isEditable = snapshot.value === 'verifying' || snapshot.value === 'verifyingCooldown';

    return {
      ...base,
      step: 'verify',
      title: copy.title,
      description: copy.subtitle,
      identifier: 'safeIdentifier' in factor ? factor.safeIdentifier : undefined,
      field: copy.field
        ? {
            ...copy.field,
            value: context.value,
            disabled: !isEditable,
            error: context.error?.location === 'field' ? context.error.message : undefined,
            onChange: value => send({ type: 'CHANGE_VALUE', value }),
          }
        : undefined,
      resend: resendButton
        ? {
            label:
              context.resendSecondsRemaining > 0 ? `${resendButton} (${context.resendSecondsRemaining})` : resendButton,
            disabled: !actor.can({ type: 'RESEND' }),
            onResend: () => send({ type: 'RESEND' }),
          }
        : undefined,
      submitLabel: factor.strategy === 'passkey' ? m.passkey.blockButton__passkey : m.formButtonPrimary,
      pendingLabel: m.verifying,
      canSubmit: actor.can({ type: 'SUBMIT' }),
      isPending,
      onSubmit: () => send({ type: 'SUBMIT' }),
      cancelLabel: m.formButtonReset,
      secondary: actor.can({ type: 'SHOW_ALTERNATIVES' })
        ? { label: m.footerActionLink__useAnotherMethod, onClick: () => send({ type: 'SHOW_ALTERNATIVES' }) }
        : actor.can({ type: 'SHOW_HELP' })
          ? { label: m.alternativeMethods.actionLink, onClick: () => send({ type: 'SHOW_HELP' }) }
          : undefined,
    };
  })();

  return <ReverificationDialog {...props} />;
}
