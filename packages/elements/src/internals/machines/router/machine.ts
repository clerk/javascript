import { assign, enqueueActions, raise, setup } from 'xstate';

import { historySyncListener } from './actors';
import type { RouterSchema } from './types';

const ROUTER_MACHINE_ID = 'Router';

export const machine = setup({
  actors: {
    historySyncListener,
  },
  actions: {
    push: ({ context }, { path, force = false }: { path: string; force?: boolean }) => {
      if (force || context.router.pathname() !== path) {
        context.router.push(path);
      }
    },
    replace: ({ context }, { path, force = false }: { path: string; force?: boolean }) => {
      if (force || context.router.pathname() !== path) {
        context.router.replace(path);
      }
    },
    sync: assign(({ context }) => ({
      pathname: context.router.pathname(),
      searchParams: context.router.searchParams(),
    })),
  },
  guards: {
    isCurrentPath: ({ context }, { path }: { path: string }) => context.router.pathname() === path,
  },
  types: {} as RouterSchema,
}).createMachine({
  id: ROUTER_MACHINE_ID,
  context: ({ input }) => ({
    pathname: input.router.pathname(),
    router: input.router,
    searchParams: input.router.searchParams(),
  }),
  invoke: {
    id: 'historySyncListener',
    src: 'historySyncListener',
    description: 'Syncs the router state with the browser history',
  },
  on: {
    push: {
      description: 'Pushes a new path to the browser history',
      actions: enqueueActions(({ enqueue, check, event }) => {
        const path = event.path;

        if (check({ type: 'isCurrentPath', params: { path } })) {
          return;
        }

        enqueue({ type: 'push', params: { path } });
        // enqueue({ type: 'sync' });
      }),
    },
    replace: {
      description: 'Replaces the current path in the browser history',
      actions: enqueueActions(({ enqueue, check, event }) => {
        const path = event.path;

        if (check({ type: 'isCurrentPath', params: { path } })) {
          return;
        }

        enqueue({ type: 'replace', params: { path } });
        // enqueue({ type: 'sync' });
      }),
    },
    sync: {
      description: 'Syncs the router state with the context',
      actions: 'sync',
    },
    goToAfterSignIn: {
      actions: raise(({ context }) => ({ type: 'replace', path: context.clerk.buildAfterSignInUrl() })),
    },
    goToAfterSignUp: {
      actions: raise(({ context }) => ({ type: 'replace', path: context.clerk.buildAfterSignUpUrl() })),
    },
  },
});

export { ROUTER_MACHINE_ID, machine as RouterMachine };
