import { joinURL } from '@clerk/shared/url';
import type { SignInStatus } from '@clerk/types';
import type { NonReducibleUnknown } from 'xstate';
import { and, assign, enqueueActions, not, or, sendTo, setup, stopChild } from 'xstate';

import { SIGN_IN_DEFAULT_BASE_PATH, SIGN_UP_DEFAULT_BASE_PATH, SSO_CALLBACK_PATH_ROUTE } from '~/internals/constants';
import { ClerkElementsError, ClerkElementsRuntimeError } from '~/internals/errors';
import { ThirdPartyMachine, ThirdPartyMachineId } from '~/internals/machines/third-party';
import { shouldUseVirtualRouting } from '~/internals/machines/utils/next';

import type {
  SignInRouterContext,
  SignInRouterEvents,
  SignInRouterNextEvent,
  SignInRouterSchema,
} from './router.types';

export type TSignInRouterMachine = typeof SignInRouterMachine;

const isCurrentPath =
  (path: `/${string}`) =>
  ({ context }: { context: SignInRouterContext }, _params?: NonReducibleUnknown) => {
    return context.router?.match(path) ?? false;
  };

const needsStatus =
  (status: SignInStatus) =>
  ({ context, event }: { context: SignInRouterContext; event?: SignInRouterEvents }, _?: NonReducibleUnknown) =>
    (event as SignInRouterNextEvent)?.resource?.status === status || context.clerk?.client.signIn.status === status;

export const SignInRouterMachineId = 'SignInRouter';

export const SignInRouterMachine = setup({
  actors: {
    thirdParty: ThirdPartyMachine,
  },
  actions: {
    navigateInternal: ({ context }, { path, force = false }: { path: string; force?: boolean }) => {
      if (!context.router) return;
      if (!force && shouldUseVirtualRouting()) return;
      if (context.exampleMode) return;

      const resolvedPath = joinURL(context.router.basePath, path);
      if (resolvedPath === context.router.pathname()) return;

      context.router.shallowPush(resolvedPath);
    },
    navigateExternal: ({ context }, { path }: { path: string }) => context.router?.push(path),
    setActive({ context, event }) {
      if (context.exampleMode) return;

      const lastActiveSessionId = context.clerk.client.lastActiveSessionId;
      const createdSessionId = ((event as SignInRouterNextEvent)?.resource || context.clerk.client.signIn)
        .createdSessionId;

      const session = createdSessionId || lastActiveSessionId || null;

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

    isLoggedInAndSingleSession: and(['isLoggedIn', 'isSingleSessionMode', not('isExampleMode')]),
    isActivePathRoot: isCurrentPath('/'),
    isComplete: ({ context, event }) => {
      const resource = (event as SignInRouterNextEvent)?.resource;
      const signIn = context.clerk.client.signIn;

      return (
        (resource?.status === 'complete' && Boolean(resource?.createdSessionId)) ||
        (signIn.status === 'complete' && Boolean(signIn.createdSessionId))
      );
    },
    isLoggedIn: ({ context }) => Boolean(context.clerk?.user),
    isSingleSessionMode: ({ context }) => Boolean(context.clerk?.__unstable__environment?.authConfig.singleSessionMode),
    isExampleMode: ({ context }) => Boolean(context.exampleMode),

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
  },
  states: {
    Idle: {
      on: {
        INIT: {
          actions: assign(({ event }) => ({
            clerk: event.clerk,
            router: event.router,
            signUpPath: event.signUpPath || SIGN_UP_DEFAULT_BASE_PATH,
            exampleMode: event.exampleMode || false,
            loading: {
              isLoading: false,
            },
          })),
          target: 'Init',
        },
      },
    },
    Init: {
      entry: enqueueActions(({ enqueue, self }) => {
        if (!self.getSnapshot().children[ThirdPartyMachineId]) {
          enqueue.spawnChild('thirdParty', {
            id: ThirdPartyMachineId,
            systemId: ThirdPartyMachineId,
            input: ({ context, self }) => ({
              basePath: context.router?.basePath ?? SIGN_IN_DEFAULT_BASE_PATH,
              flow: 'signIn',
              parent: self,
            }),
          });
        }
      }),
      always: [
        {
          guard: 'needsCallback',
          target: 'Callback',
        },
        {
          guard: 'isLoggedInAndSingleSession',
          actions: [
            () => console.warn('logged-in-single-session-mode'),
            {
              type: 'setError',
              params: {
                error: new ClerkElementsError('logged-in-single-session-mode', 'You are already logged in.'),
              },
            },
          ],
          target: 'Start',
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
          guard: 'needsNewPassword',
          actions: { type: 'navigateInternal', params: { force: true, path: '/reset-password' } },
          target: 'ResetPassword',
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
        NEXT: [
          {
            guard: 'isComplete',
            actions: 'setActive',
            target: 'Start',
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
          {
            guard: 'statusNeedsNewPassword',
            actions: { type: 'navigateInternal', params: { path: '/reset-password' } },
            target: 'ResetPassword',
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
            target: 'Start',
          },
          {
            guard: 'statusNeedsSecondFactor',
            actions: { type: 'navigateInternal', params: { path: '/continue' } },
            target: 'SecondFactor',
          },
          {
            guard: 'statusNeedsNewPassword',
            actions: { type: 'navigateInternal', params: { path: '/reset-password' } },
            target: 'ResetPassword',
          },
        ],
        'STRATEGY.UPDATE': {
          description: 'Send event to verification machine to update the current strategy.',
          actions: sendTo('firstFactor', ({ event }) => event),
          target: '.Idle',
        },
      },
      initial: 'Idle',
      states: {
        Idle: {
          on: {
            'NAVIGATE.FORGOT_PASSWORD': {
              description: 'Navigate to forgot password screen.',
              actions: sendTo('firstFactor', ({ event }) => event),
              target: 'ForgotPassword',
            },
            'NAVIGATE.CHOOSE_STRATEGY': {
              description: 'Navigate to choose strategy screen.',
              actions: sendTo('firstFactor', ({ event }) => event),
              target: 'ChoosingStrategy',
            },
          },
        },
        ChoosingStrategy: {
          tags: ['route:choose-strategy'],
          on: {
            'NAVIGATE.PREVIOUS': 'Idle',
          },
        },
        ForgotPassword: {
          tags: ['route:forgot-password'],
          on: {
            'NAVIGATE.PREVIOUS': 'Idle',
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
            target: 'Start',
          },
          {
            guard: 'statusNeedsNewPassword',
            actions: { type: 'navigateInternal', params: { path: '/reset-password' } },
            target: 'ResetPassword',
          },
        ],
      },
    },
    ResetPassword: {
      tags: 'route:reset-password',
      on: {
        NEXT: [
          {
            guard: 'isComplete',
            actions: 'setActive',
            target: 'Start',
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
    Callback: {
      tags: 'route:callback',
      entry: sendTo(ThirdPartyMachineId, { type: 'CALLBACK' }),
      on: {
        NEXT: [
          {
            guard: or(['isComplete', 'hasAuthenticatedViaClerkJS']),
            actions: 'setActive',
            target: 'Start',
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
          {
            guard: 'statusNeedsNewPassword',
            actions: { type: 'navigateInternal', params: { path: '/reset-password' } },
            target: 'ResetPassword',
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
    Hist: {
      type: 'history',
      exit: 'resetError',
    },
  },
});
