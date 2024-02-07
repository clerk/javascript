import type { SignInStatus } from '@clerk/types';
import type { NonReducibleUnknown } from 'xstate';
import { and, assign, enqueueActions, log, not, or, setup, stopChild } from 'xstate';

import { SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import { ClerkElementsError, ClerkElementsRuntimeError } from '~/internals/errors/error';
import type {
  SignInRouterContext,
  SignInRouterEvents,
  SignInRouterNextEvent,
  SignInRouterSchema,
} from '~/internals/machines/sign-in/types';

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
  actions: {
    logUnknownError: snapshot => console.error('Unknown error:', snapshot),
    navigateInternal: ({ context }, { path }: { path: string }) => {
      if (!context.router) return;
      const resolvedPath = [context.router?.basePath, path].join('/').replace(/\/\/g/, '/');
      if (resolvedPath === context.router.pathname()) return;
      context.router.push(resolvedPath);
    },
    navigateExternal: ({ context }, { path }: { path: string }) => context.router?.push(path),
    setActive({ context }) {
      const beforeEmit = () => context.router?.push(context.clerk.buildAfterSignInUrl());
      void context.clerk.setActive({ session: context.clerk.client.signIn.createdSessionId, beforeEmit });
    },
    setError: assign({
      error: (_, { error }: { error?: ClerkElementsError }) => {
        if (error) return error;
        return new ClerkElementsRuntimeError('Unknown error');
      },
    }),
    resetError: assign({ error: undefined }),
    transfer: ({ context }) => context.router?.push(context.clerk.buildSignUpUrl()),
  },
  guards: {
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
  /** @xstate-layout N4IgpgJg5mDOIC5QGUCWUB2BJDAlA9gK4AuYATgMQAKuAogGoDaADALqKgAO+sqxq+DBxAAPRABYATABoQAT0QBGZgFYAdAHYVzHRoAcivQDZtzAMwBfC7LSYcBEuTU4+FFuyQhuvfoOFiESRVxNTMATj1xDQ1JMxUVY2DZBQQNcUVQxUlxMJUsjUVxPT0rG3RsPCJSMmcMV0ZFDy4ePgEhTwCgsNCIqJi4hJNxZMRJAzVxFTNFQrjFIw1p0pBbCodq2vrJJq8W33bQTpVu8Mjo2PjE4flEYu7mRRUTRQLVJ5Vl1fsqpxdiNzMO28rT8HVGxx6Z36lyGIwQhm6OTCuTCRki4jRxU+5W+jhqfzc4iBeza-nBJ165wGVzheT0amKYyC00eWnE2LslTxm3+jBUxJ8pLBgQhpz6F0GSRuCGO6km00kaWyOkUHLWPxqyGIAEMyP8AHK0AAaABV3MJgfsyakVBpNEiiswwmYjPM9LSMWoVJJUXpzIYotk1biNlrdQbjWbGhaSaDDogwhojGoFoZqRonXE4UYzMw1GFJD7zEZC5E4sGuaGdXqKIbTYxtjHBXHRAmkymCnp05mVLSzCEMYmTMw9PoYpIK+snAAxVBkWDEafagDGxHwlDrZrYTZBB1b8OmyYMkhLRkm4mY6Thfvp+jCl8v4jMWnmk41aln88XK7XG8jDQFXdrUeOJNH7PJwiiPIk2vYxNBMIwdFiPR7yyN9uWQMBl0ECAl1Xdda3-bdPEtIV43hUd1Eo5gjFonNnz0GRpQxPMy0kcxTiCKYPmsFYcUrJxMOwjBcJ-AjNwAncrWFQwNG6F4EgvRZ5hLOEzGfCYXVyLt5SyWJ0I2ABhbUABsTIAIxXABrCgTVwABBfVkGnWhcHNEjYz3AJvUkNRskkRQwkmPRjnYsw4SkXyC1RMI3W9LQTwMpxaDIMhxKIwDpPIkxuhPeJ7yCEwDHC6V9HpZEAuKSZlASDQrF4jB8AgOBhC+ASyCksj9wAWiMOFerUHQhuG4bCiS-E6mITqWwCRRcwZXpaJiRjpnMa9UQmAtDFtcQMSTMJxrUMM9WmrzbkLNQ5sVSI0RmC8SpSM87QiMZDBC-snyMQ7PwXPDf1O4C4m6S5x2mRjVDhWK838l4ULHUtDqEnC-vXAGZPvO0ii7OaTG9XamJSJ5fJ9HN0mdMxC1ow7jLMyzlystHyKmXzDwvWJnyCubaWyUJGK7ZhCwFjEeLKTkpxqFK0o6jzmzOmVJgZPnbRzdmjDCOE702yrIjyVRjG+9coHwYgqG1WBYAAd3XCBGf3KRrw0ir2IxFD+313i2vFtQAAlUAXW2jgpKEJRpaVxlMcwMxHR4gvZeqgA */
  id: SignInRouterMachineId,
  context: ({ input }) => ({
    activeRouteRef: null,
    clerk: input.clerk,
    router: input.router,
    routes: new Map(),
    signUpPath: input.signUpPath || SIGN_UP_DEFAULT_BASE_PATH,
  }),
  initial: 'Init',
  on: {
    PREV: '.Hist',
    'ROUTE.REGISTER': {
      actions: enqueueActions(({ context, enqueue, event, self }) => {
        const { clerk, router } = context;
        const { id, logic, input } = event;

        router?.push;

        if (!self.getSnapshot().children[id]) {
          enqueue.spawnChild(logic, {
            id,
            systemId: id,
            input: { basePath: router?.basePath, clerk, router: self, ...input },
          });
        }
      }),
    },
    'ROUTE.UNREGISTER': {
      actions: stopChild(({ event }) => event.id),
    },
    'ROUTE.CLEAR': {
      actions: enqueueActions(({ enqueue, self }) => {
        Object.keys(self.getSnapshot().children).forEach(id => {
          enqueue.stopChild(id);
        });
      }),
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
          guard: 'needsCallback',
          target: 'Callback',
        },
        {
          actions: [
            log('Unknown state'),
            log(({ context }) => context.clerk.client.signIn),
            {
              type: 'setError',
              params: {
                error: new ClerkElementsRuntimeError('Unknown state'),
              },
            },
          ],
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
      on: {
        TRANSFER: {
          actions: 'transfer',
        },
      },
    },
    Error: {
      tags: 'route:error',
      on: {
        NEXT: {
          target: 'Start',
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
