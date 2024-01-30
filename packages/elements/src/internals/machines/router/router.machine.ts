import { setup } from 'xstate';

import type { ClerkRouter } from '~/react/router';

export interface RouterMachineContext {
  router: ClerkRouter;
}

export type RouterMachineInput = RouterMachineContext;

export type RouterMachineEvents = { type: 'PUSH'; path: string } | { type: 'REPLACE'; path: string };

export interface RouterMachineSchema {
  context: RouterMachineContext;
  events: RouterMachineEvents;
  input: RouterMachineInput;
}

export const RouterMachine = setup({
  actions: {
    push: ({ context }, { path }: { path: string }) => context.router.push(path),
    replace: ({ context }, { path }: { path: string }) => context.router.replace(path),
  },
  types: {} as RouterMachineSchema,
}).createMachine({
  id: 'Router',
  context: ({ input }) => ({ router: input.router }),
  initial: 'Idle',
  states: {
    Idle: {
      on: {
        PUSH: {
          actions: { type: 'push', params: ({ event }) => ({ path: event.path }) },
        },
        REPLACE: {
          actions: { type: 'replace', params: ({ event }) => ({ path: event.path }) },
        },
      },
    },
  },
});
