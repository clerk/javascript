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
  const { createMachine, createInvoke } = setup<ModalContentContext<Options>, ModalContentEvent>();

  const machine = createMachine({
    initial: 'idle',
    context: { Content: undefined },
    states: {
      idle: { on: { LOAD: { target: 'loading' } } },
      loading: {
        invoke: createInvoke({
          src: () => importContent(),
          onDone: ({ event }) => ({ target: 'loaded', context: { Content: event.output.default } }),
          onError: ({ event }, enq) => {
            enq(logLoadError, event.error);
            return { target: 'failed' };
          },
        }),
      },
      loaded: {},
      failed: { on: { LOAD: { target: 'loading' } } },
    },
  });

  return createActor(machine).start();
}

function logLoadError(error: unknown): void {
  console.error('[Clerk] Could not load the modal content', error);
}
