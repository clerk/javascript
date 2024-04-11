import { joinURL } from '@clerk/shared';
import type { SignInStatus } from '@clerk/types';
import type { NonReducibleUnknown } from 'xstate';
import { and, assign, enqueueActions, log, not, or, sendTo, setup, spawnChild, stopChild } from 'xstate';

import { SIGN_IN_DEFAULT_BASE_PATH, SIGN_UP_DEFAULT_BASE_PATH, SSO_CALLBACK_PATH_ROUTE } from '~/internals/constants';
import { ClerkElementsError, ClerkElementsRuntimeError } from '~/internals/errors';
import type {
  SignInRouterContext,
  SignInRouterEvents,
  SignInRouterNextEvent,
  SignInRouterSchema,
} from '~/internals/machines/sign-in/types';
import { ThirdPartyMachine, ThirdPartyMachineId } from '~/internals/machines/third-party/machine';
import { shouldUseVirtualRouting } from '~/internals/machines/utils/next';

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
    navigateInternal: ({ context }, { path, force = false }: { path: string; force?: boolean }) => {
      if (!context.router) return;
      if (!force && shouldUseVirtualRouting()) return;

      const resolvedPath = joinURL(context.router.basePath, path);
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
    transfer: ({ context }) => {
      const searchParams = new URLSearchParams({ __clerk_transfer: '1' });
      context.router?.push(`${context.signUpPath}?${searchParams}`);
    },
  },
  guards: {
    hasAuthenticatedViaClerkJS: ({ context }) =>
      Boolean(context.clerk.client.signIn.status === null && context.clerk.client.lastActiveSessionId),
    hasResource: ({ context }) => Boolean(context.clerk?.client?.signIn?.status),

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
    needsCallback: isCurrentPath(SSO_CALLBACK_PATH_ROUTE),
    needsNewPassword: and(['statusNeedsNewPassword', isCurrentPath('/new-password')]),

    statusNeedsIdentifier: needsStatus('needs_identifier'),
    statusNeedsFirstFactor: needsStatus('needs_first_factor'),
    statusNeedsSecondFactor: needsStatus('needs_second_factor'),
    statusNeedsNewPassword: needsStatus('needs_new_password'),
  },
  types: {} as SignInRouterSchema,
}).createMachine({
  id: SignInRouterMachineId,
  // @ts-expect-error - Set in INIT event
  context: {},
  initial: 'Idle',
  on: {
    'AUTHENTICATE.OAUTH': {
      actions: sendTo(ThirdPartyMachineId, ({ event }) => ({
        type: 'REDIRECT',
        params: {
          strategy: event.strategy,
        },
      })),
    },
    'AUTHENTICATE.SAML': {
      actions: sendTo(ThirdPartyMachineId, {
        type: 'REDIRECT',
        params: { strategy: 'saml' },
      }),
    },
    'NAVIGATE.PREVIOUS': '.Hist',
    'NAVIGATE.START': '.Start',
    'ROUTE.REGISTER': {
      actions: enqueueActions(({ context, enqueue, event, self }) => {
        const { id, logic, input } = event;

        if (!self.getSnapshot().children[id]) {
          // @ts-expect-error - This is valid (See: https://discord.com/channels/795785288994652170/1203714033190969405/1205595237293096960)
          enqueue.spawnChild(logic, {
            id,
            systemId: id,
            input: { basePath: context.router?.basePath, parent: self, ...input },
            syncSnapshot: true, // Subscribes to the spawned actor and send back snapshot events
          });
        }
      }),
    },
    'ROUTE.UNREGISTER': {
      actions: stopChild(({ event }) => event.id),
    },
    LOADING: {
      actions: assign(({ event }) => ({
        loading: {
          isLoading: event.isLoading,
          step: event.step,
          strategy: event.strategy,
        },
      })),
    },
    SET_CLERK: {
      actions: assign(({ event }) => ({
        clerk: event.clerk,
      })),
    },
  },
  states: {
    Idle: {
      on: {
        INIT: {
          actions: assign(({ event }) => ({
            clerk: event.clerk,
            router: event.router,
            signUpPath: event.signUpPath || SIGN_UP_DEFAULT_BASE_PATH,
            loading: {
              isLoading: false,
            },
          })),
          target: 'Init',
        },
      },
    },
    Init: {
      entry: spawnChild('thirdParty', {
        id: ThirdPartyMachineId,
        systemId: ThirdPartyMachineId,
        input: ({ context, self }) => ({
          basePath: context.router?.basePath ?? SIGN_IN_DEFAULT_BASE_PATH,
          flow: 'signIn',
          parent: self,
        }),
      }),
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
          actions: { type: 'navigateInternal', params: { force: true, path: '/' } },
          target: 'Start',
        },
        {
          guard: 'needsFirstFactor',
          actions: { type: 'navigateInternal', params: { force: true, path: '/continue' } },
          target: 'FirstFactor',
        },
        {
          guard: 'needsSecondFactor',
          actions: { type: 'navigateInternal', params: { force: true, path: '/continue' } },
          target: 'SecondFactor',
        },
        {
          actions: { type: 'navigateInternal', params: { force: true, path: '/' } },
          target: 'Start',
        },
      ],
    },
    Start: {
      tags: 'route:start',
      on: {
        'NAVIGATE.FORGOT_PASSWORD': 'ForgotPassword',
        NEXT: [
          {
            guard: 'isComplete',
            actions: 'setActive',
          },
          {
            guard: 'statusNeedsFirstFactor',
            actions: { type: 'navigateInternal', params: { path: '/continue' } },
            target: 'FirstFactor',
          },
          {
            guard: 'statusNeedsSecondFactor',
            actions: { type: 'navigateInternal', params: { path: '/continue' } },
            target: 'SecondFactor',
          },
        ],
      },
    },
    FirstFactor: {
      tags: 'route:first-factor',
      on: {
        'NAVIGATE.FORGOT_PASSWORD': 'ForgotPassword',
        NEXT: [
          {
            guard: 'isComplete',
            actions: 'setActive',
          },
          {
            guard: 'statusNeedsSecondFactor',
            actions: { type: 'navigateInternal', params: { path: '/continue' } },
            target: 'SecondFactor',
          },
          {
            actions: ['logUnknownError', { type: 'navigateInternal', params: { path: '/' } }],
          },
        ],
      },
      initial: 'Idle',
      states: {
        Idle: {
          on: {
            'NAVIGATE.CHOOSE_STRATEGY': {
              description: 'Send event to verification machine to update the current factor.',
              actions: sendTo('firstFactor', ({ event }) => event),
              target: 'ChoosingStrategy',
            },
          },
        },
        ChoosingStrategy: {
          tags: ['route:choose-strategy'],
          on: {
            'NAVIGATE.PREVIOUS': 'Idle',
            'STRATEGY.UPDATE': {
              description: 'Send event to verification machine to update the current factor.',
              actions: sendTo('firstFactor', ({ event }) => event),
              target: 'Idle',
            },
          },
        },
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
      entry: sendTo(ThirdPartyMachineId, { type: 'CALLBACK' }),
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
          },
          {
            guard: 'statusNeedsSecondFactor',
            actions: { type: 'navigateInternal', params: { path: '/continue' } },
            target: 'SecondFactor',
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
        },
      },
    },
    ForgotPassword: {
      tags: 'route:forgot-password',
    },
    Hist: {
      type: 'history',
      exit: 'resetError',
    },
  },
});
