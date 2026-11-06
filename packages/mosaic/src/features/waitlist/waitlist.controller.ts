import { useForm } from '../../components/form';
import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/use-machine';
import type { WaitlistModel } from './waitlist.types';
import type { WaitlistViewProps } from './waitlist.view';

export const WAITLIST_REDIRECT_DELAY_MS = 2000;

type WaitlistMachineContext = Record<never, never>;

type WaitlistMachineEvent = { type: 'JOINED' };

const { createMachine } = setup<WaitlistMachineContext, WaitlistMachineEvent>();

const waitlistMachine = createMachine({
  id: 'waitlist',
  initial: 'form',
  context: {},
  actions: { redirect: (): void => {} },
  states: {
    form: {
      on: { JOINED: { target: 'joined' } },
    },
    joined: {
      after: {
        [WAITLIST_REDIRECT_DELAY_MS]: ({ actions }, enq) => {
          enq(actions.redirect);
        },
      },
    },
  },
});

export type WaitlistReadyModel = Extract<WaitlistModel, { status: 'ready' }>;

export function useWaitlistController(model: WaitlistReadyModel): WaitlistViewProps {
  const { initialEmailAddress, renderBranding, onJoinWaitlist, onSignIn, onRedirect } = model;
  const [snapshot, send] = useMachine(waitlistMachine.provide({ actions: { redirect: () => onRedirect?.() } }));
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
