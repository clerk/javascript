import type { SignInStatus } from '@clerk/types';
import type { NonReducibleUnknown } from 'xstate';
import { and, assign, enqueueActions, log, not, or, sendTo, setup, stopChild } from 'xstate';

import { SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import { ClerkElementsError, ClerkElementsRuntimeError } from '~/internals/errors';
import type {
  SignInRouterContext,
  SignInRouterEvents,
  SignInRouterNextEvent,
  SignInRouterSchema,
} from '~/internals/machines/sign-in/types';
import { THIRD_PARTY_MACHINE_ID, ThirdPartyMachine } from '~/internals/machines/third-party/machine';

export type TSignInRouterMachine = typeof SignInRouterMachine;

const isCurrentPath =
  (path: `/${string}`) =>
  ({ context }: { context: SignInRouterContext }, _params?: NonReducibleUnknown) =>
    context.router?.match(path) ?? true;

const needsStatus =
  (status: SignInStatus) =>
  ({ context, event }: { context: SignInRouterContext; event?: SignInRouterEvents }, _?: NonReducibleUnknown) =>
    (event as SignInRouterNextEvent)?.resource?.status === status || context.clerk.client.signIn.status === status;

export const SignInRouterMachineId = 'SignInRouter';

export const SignInRouterMachine = setup({
  actors: {
    thirdParty: ThirdPartyMachine,
  },
  actions: {
    logUnknownError: snapshot => console.error('Unknown error:', snapshot),
    navigateInternal: ({ context }, { path }: { path: string }) => {
      if (!context.router) return;
      const resolvedPath = [context.router?.basePath, path].join('/').replace(/\/\/g/, '/');
      if (resolvedPath === context.router.pathname()) return;
      context.router.push(resolvedPath);
    },
    navigateExternal: ({ context }, { path }: { path: string }) => context.router?.push(path),
    setActive({ context, event }, params?: { useLastActiveSession?: boolean }) {
      const session =
        (params?.useLastActiveSession && context.clerk.client.lastActiveSessionId) ||
        ((event as SignInRouterNextEvent)?.resource || context.clerk.client.signIn).createdSessionId;

      const beforeEmit = () => context.router?.push(context.clerk.buildAfterSignInUrl());
      void context.clerk.setActive({ session, beforeEmit });
    },
    setError: assign({
      error: (_, { error }: { error?: ClerkElementsError }) => {
        if (error) return error;
        return new ClerkElementsRuntimeError('Unknown error');
      },
    }),
    resetError: assign({ error: undefined }),
    transfer: ({ context }) => context.router?.push(context.clerk.buildSignInUrl() + '/sso-callback'),
  },
  guards: {
    hasAuthenticatedViaClerkJS: ({ context }) =>
      Boolean(context.clerk.client.signIn.status === null && context.clerk.client.lastActiveSessionId),
    hasResource: ({ context }) => Boolean(context.clerk.client.signIn.status),

    isLoggedInAndSingleSession: and(['isLoggedIn', 'isSingleSessionMode']),
    isActivePathRoot: isCurrentPath('/'),
    isComplete: ({ context, event }) => {
      const resource = (event as SignInRouterNextEvent)?.resource;
      const signIn = context.clerk.client.signIn;

      return (
        (resource?.status === 'complete' && Boolean(resource?.createdSessionId)) ||
        (signIn.status === 'complete' && Boolean(signIn.createdSessionId))
      );
    },
    isLoggedIn: ({ context }) => Boolean(context.clerk.user),
    isSingleSessionMode: ({ context }) => Boolean(context.clerk.__unstable__environment?.authConfig.singleSessionMode),

    needsStart: or([not('hasResource'), 'statusNeedsIdentifier', isCurrentPath('/')]),
    needsFirstFactor: and(['statusNeedsFirstFactor', isCurrentPath('/continue')]),
    needsSecondFactor: and(['statusNeedsSecondFactor', isCurrentPath('/continue')]),
    needsCallback: isCurrentPath('/sso-callback'),
    needsNewPassword: and(['statusNeedsNewPassword', isCurrentPath('/new-password')]),

    statusNeedsIdentifier: needsStatus('needs_identifier'),
    statusNeedsFirstFactor: needsStatus('needs_first_factor'),
    statusNeedsSecondFactor: needsStatus('needs_second_factor'),
    statusNeedsNewPassword: needsStatus('needs_new_password'),
  },
  types: {} as SignInRouterSchema,
}).createMachine({
  id: SignInRouterMachineId,
  context: ({ input }) => ({
    clerk: input.clerk,
    router: input.router,
    signUpPath: input.signUpPath || SIGN_UP_DEFAULT_BASE_PATH,
  }),
  initial: 'Init',
  on: {
    PREV: '.Hist',
    'ROUTE.REGISTER': {
      actions: enqueueActions(({ context, enqueue, event, self }) => {
        const { clerk, router } = context;
        const { id, logic, input } = event;

        if (!self.getSnapshot().children[id]) {
          // @ts-expect-error - This is valid (See: https://discord.com/channels/795785288994652170/1203714033190969405/1205595237293096960)
          enqueue.spawnChild(logic, {
            id,
            systemId: id,
            input: { basePath: router?.basePath, clerk, router: self, ...input },
            syncSnapshot: false, // Subscribes to the spawned actor and send back snapshot events
          });
        }
      }),
    },
    'ROUTE.UNREGISTER': {
      actions: stopChild(({ event }) => event.id),
    },
  },
  states: {
    Init: {
      always: [
        {
          guard: 'isLoggedInAndSingleSession',
          actions: [
            log('Already logged in'),
            {
              type: 'setError',
              params: {
                error: new ClerkElementsError('logged-in-single-session-mode', 'You are already logged in.'),
              },
            },
            { type: 'navigateExternal', params: { path: '/' } },
          ],
          target: 'Error',
        },
        {
          guard: 'needsCallback',
          target: 'Callback',
        },
        {
          guard: 'needsStart',
          actions: { type: 'navigateInternal', params: { path: '/' } },
          target: 'Start',
        },
        {
          guard: 'needsFirstFactor',
          actions: { type: 'navigateInternal', params: { path: '/continue' } },
          target: 'FirstFactor',
        },
        {
          guard: 'needsSecondFactor',
          actions: { type: 'navigateInternal', params: { path: '/continue' } },
          target: 'SecondFactor',
        },
        {
          actions: { type: 'navigateInternal', params: { path: '/' } },
          target: 'Start',
        },
      ],
    },
    Start: {
      tags: 'route:start',
      on: {
        NEXT: [
          {
            guard: 'isComplete',
            actions: 'setActive',
          },
          {
            guard: 'statusNeedsFirstFactor',
            // actions: { type: 'navigateInternal', params: { path: '/continue' } },
            target: 'FirstFactor',
            reenter: true,
          },
          {
            guard: 'statusNeedsSecondFactor',
            // actions: { type: 'navigateInternal', params: { path: '/continue' } },
            target: 'SecondFactor',
            reenter: true,
          },
        ],
      },
    },
    FirstFactor: {
      tags: 'route:first-factor',
      on: {
        NEXT: [
          {
            guard: 'isComplete',
            actions: 'setActive',
          },
          {
            guard: 'statusNeedsSecondFactor',
            // actions: { type: 'navigateInternal', params: { path: '/continue' } },
            target: 'SecondFactor',
            reenter: true,
          },
          {
            actions: ['logUnknownError', { type: 'navigateInternal', params: { path: '/' } }],
          },
        ],
      },
    },
    SecondFactor: {
      tags: 'route:second-factor',
      on: {
        NEXT: [
          {
            guard: 'isComplete',
            actions: 'setActive',
          },
          {
            actions: ['logUnknownError', { type: 'navigateInternal', params: { path: '/' } }],
          },
        ],
      },
    },
    Callback: {
      tags: 'route:callback',
      invoke: {
        id: THIRD_PARTY_MACHINE_ID,
        systemId: THIRD_PARTY_MACHINE_ID,
        src: 'thirdParty',
        input: ({ context }) => ({
          basePath: context.router?.basePath ?? '/sign-in',
          clerk: context.clerk,
          flow: 'signIn',
        }),
      },
      entry: sendTo(THIRD_PARTY_MACHINE_ID, { type: 'CALLBACK' }),
      on: {
        NEXT: [
          {
            guard: 'isComplete',
            actions: 'setActive',
          },
          {
            description: 'Handle a case where the user has already been authenticated via ClerkJS',
            guard: 'hasAuthenticatedViaClerkJS',
            actions: { type: 'setActive', params: { useLastActiveSession: true } },
          },
          {
            guard: 'statusNeedsIdentifier',
            actions: 'transfer',
          },
          {
            guard: 'statusNeedsFirstFactor',
            actions: { type: 'navigateInternal', params: { path: '/continue' } },
            target: 'FirstFactor',
            reenter: true,
          },
          {
            guard: 'statusNeedsSecondFactor',
            actions: { type: 'navigateInternal', params: { path: '/continue' } },
            target: 'SecondFactor',
            reenter: true,
          },
        ],
      },
    },
    Error: {
      tags: 'route:error',
      on: {
        NEXT: {
          target: 'Start',
          actions: 'resetError',
          reenter: true,
        },
      },
    },
    ForgotPassword: {
      tags: 'route:forgot-password',
    },
    Hist: {
      type: 'history',
      exit: 'resetError',
      reenter: true,
    },
  },
});
