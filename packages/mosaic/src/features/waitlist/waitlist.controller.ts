import type { UseFormResult } from '../../components/form';
import { useForm } from '../../components/form';
import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/use-machine';
import type { WaitlistModel, WaitlistStep, WaitlistValues } from './waitlist.types';

export const WAITLIST_REDIRECT_DELAY_MS = 2000;

interface WaitlistMachineContext {
  onRedirect: (() => void) | undefined;
}

type WaitlistMachineEvent = { type: 'JOINED' };

const { createMachine } = setup<WaitlistMachineContext, WaitlistMachineEvent>();

const waitlistMachine = createMachine({
  id: 'waitlist',
  initial: 'form',
  context: { onRedirect: undefined },
  states: {
    form: {
      on: { JOINED: 'joined' },
    },
    joined: {
      after: {
        [WAITLIST_REDIRECT_DELAY_MS]: {
          target: 'redirected',
          guard: context => context.onRedirect !== undefined,
          actions: context => context.onRedirect?.(),
        },
      },
    },
    redirected: { type: 'final' },
  },
});

export type WaitlistReadyModel = Extract<WaitlistModel, { status: 'ready' }>;

export interface WaitlistController {
  step: WaitlistStep;
  form: UseFormResult<WaitlistValues>;
  renderBranding: boolean;
  isRedirecting: boolean;
  onSignIn: () => void;
}

export function useWaitlistController(model: WaitlistReadyModel): WaitlistController {
  const { initialEmailAddress, renderBranding, onJoinWaitlist, onSignIn, onRedirect } = model;
  const [snapshot, send] = useMachine(waitlistMachine, { context: { onRedirect } });
  const form = useForm({
    initialValues: { emailAddress: initialEmailAddress },
    canSubmit: values => values.emailAddress.trim() !== '',
    onSubmit: async values => {
      await onJoinWaitlist(values.emailAddress);
      send({ type: 'JOINED' });
    },
  });

  return {
    step: snapshot.value === 'form' ? 'form' : 'joined',
    form,
    renderBranding,
    isRedirecting: onRedirect !== undefined,
    onSignIn,
  };
}
