import type { ComponentType } from 'react';

import { createActor } from '../machine/create-actor';
import { setup } from '../machine/setup';
import type { Actor } from '../machine/types';
import type { ModalContentProps, ModalSurfaceConfig } from './modal.types';

interface ModalContentContext<Options> {
  Content: ComponentType<ModalContentProps<Options>> | undefined;
}

type ModalContentEvent = { type: 'LOAD' };

export type ModalContentLoader<Options> = Actor<ModalContentContext<Options>, ModalContentEvent>;

export function createModalContentLoader<Options>(
  importContent: ModalSurfaceConfig<Options>['load'],
): ModalContentLoader<Options> {
  const { createMachine, assign, fromPromise } = setup<ModalContentContext<Options>, ModalContentEvent>();

  const machine = createMachine({
    initial: 'idle',
    context: { Content: undefined },
    states: {
      idle: { on: { LOAD: 'loading' } },
      loading: {
        invoke: fromPromise(() => importContent(), {
          onDone: { target: 'loaded', actions: assign((_, event) => ({ Content: event.output.default })) },
          onError: {
            target: 'failed',
            actions: (_, event) => console.error('[Clerk] Could not load the modal content', event.error),
          },
        }),
      },
      loaded: {},
      failed: { on: { LOAD: 'loading' } },
    },
  });

  return createActor(machine).start();
}
