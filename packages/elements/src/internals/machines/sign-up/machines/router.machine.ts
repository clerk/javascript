import type { SignUpStatus } from '@clerk/types';
import type { NonReducibleUnknown } from 'xstate';
import { and, assign, enqueueActions, log, not, or, setup, stopChild } from 'xstate';

import { SIGN_IN_DEFAULT_BASE_PATH } from '~/internals/constants';
import type { ClerkElementsError } from '~/internals/errors/error';
import { ClerkElementsRuntimeError } from '~/internals/errors/error';
import type {
  SignUpRouterContext,
  SignUpRouterEvents,
  SignUpRouterNextEvent,
  SignUpRouterSchema,
} from '~/internals/machines/sign-up/types';

const isCurrentPath =
  (path: `/${string}`) =>
  ({ context }: { context: SignUpRouterContext }, _params?: NonReducibleUnknown) =>
    context.router?.match(path) ?? true;

const needsStatus =
  (status: SignUpStatus) =>
  ({ context, event }: { context: SignUpRouterContext; event?: SignUpRouterEvents }, _?: NonReducibleUnknown) =>
    (event as SignUpRouterNextEvent)?.resource?.status === status || context.clerk.client.signUp.status === status;

export const SignUpRouterMachineId = 'SignUpRouter';
export type TSignUpRouterMachine = typeof SignUpRouterMachine;

export const SignUpRouterMachine = setup({
  actions: {
    logUnknownError: snapshot => console.error('Unknown error:', snapshot),
    navigateInternal: ({ context }, { path }: { path: string }) => {
      if (!context.router) return;
      const resolvedPath = [context.router?.basePath, path].join('/').replace(/\/\/g/, '/');
      if (resolvedPath === context.router.pathname()) return;
      context.router.push(resolvedPath);
    },
    navigateExternal: ({ context }, { path }: { path: string }) => context.router?.push(path),
    setActive({ context, event }) {
      const session = ((event as SignUpRouterNextEvent)?.resource || context.clerk.client.signUp).createdSessionId;
      const beforeEmit = () => context.router?.push(context.clerk.buildAfterSignUpUrl());

      void context.clerk.setActive({ session, beforeEmit });
    },
    setError: assign({
      error: (_, { error }: { error?: ClerkElementsError }) => {
        if (error) return error;
        return new ClerkElementsRuntimeError('Unknown error');
      },
    }),
    resetError: assign({ error: undefined }),
    transfer: ({ context }) => context.router?.push(context.clerk.buildSignInUrl()),
  },
  guards: {
    areFieldsMissing: ({ context }) => context.clerk.client.signUp.missingFields.length > 0,
    areFieldsUnverified: ({ context }) => context.clerk.client.signUp.unverifiedFields.length > 0,

    isStatusAbandoned: needsStatus('abandoned'),
    isStatusComplete: ({ context, event }) => {
      const resource = (event as SignUpRouterNextEvent)?.resource;
      const signUp = context.clerk.client.signUp;

      return (
        (resource?.status === 'complete' && Boolean(resource?.createdSessionId)) ||
        (signUp.status === 'complete' && Boolean(signUp.createdSessionId))
      );
    },
    isStatusMissingRequirements: needsStatus('missing_requirements'),

    isLoggedIn: or(['isStatusComplete', ({ context }) => Boolean(context.clerk.user)]),
    isMissingRequiredFields: and(['isStatusMissingRequirements', 'areFieldsMissing']),
    isMissingRequiredUnverifiedFields: and(['isStatusMissingRequirements', 'areFieldsUnverified']),

    hasResource: ({ context }) => Boolean(context.clerk.client.signUp),

    needsIdentifier: or(['statusNeedsIdentifier', isCurrentPath('/')]),
    needsContinue: and(['statusNeedsContinue', isCurrentPath('/continue')]),
    needsVerification: and(['statusNeedsVerification', isCurrentPath('/continue')]),
    needsCallback: isCurrentPath('/sso-callback'),

    statusNeedsIdentifier: or([not('hasResource'), 'isStatusAbandoned']),
    statusNeedsContinue: or(['isMissingRequiredFields']),
    statusNeedsVerification: or(['isMissingRequiredUnverifiedFields']),
  },
  delays: {
    'TIMEOUT.POLLING': 300_000, // 5 minutes
  },
  types: {} as SignUpRouterSchema,
}).createMachine({
  id: SignUpRouterMachineId,
  context: ({ input }) => ({
    clerk: input.clerk,
    router: input.router,
    signInPath: input.signInPath || SIGN_IN_DEFAULT_BASE_PATH,
  }),
  initial: 'Init',
  on: {
    PREV: '.Hist',
    'ROUTE.REGISTER': {
      actions: enqueueActions(({ context, enqueue, event, self, system }) => {
        const { clerk, router } = context;
        const { id, logic, input } = event;

        if (!system.get(id)) {
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
          guard: 'isLoggedIn',
          actions: [
            log('Already logged in'),
            {
              type: 'navigateExternal',
              params: ({ context }) => ({ path: context.clerk.buildAfterSignUpUrl() }),
            },
          ],
        },
        {
          guard: 'needsIdentifier',
          actions: { type: 'navigateInternal', params: { path: '/' } },
          target: 'Start',
        },
        {
          guard: 'needsVerification',
          actions: { type: 'navigateInternal', params: { path: '/verify' } },
          target: 'Verification',
        },
        {
          guard: 'needsContinue',
          actions: { type: 'navigateInternal', params: { path: '/continue' } },
          target: 'Continue',
        },
        {
          guard: 'needsCallback',
          target: 'Callback',
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
            guard: 'isStatusComplete',
            actions: 'setActive',
          },
          {
            guard: 'statusNeedsVerification',
            target: 'Verification',
            // actions: { type: 'navigateInternal', params: { path: '/verify' } },
            reenter: true,
          },
          {
            guard: 'statusNeedsContinue',
            // actions: { type: 'navigateInternal', params: { path: '/continue' } },
            target: 'Continue',
            reenter: true,
          },
        ],
      },
    },
    Continue: {
      tags: 'route:continue',
      on: {
        NEXT: [
          {
            guard: 'isStatusComplete',
            actions: 'setActive',
          },
          {
            guard: 'statusNeedsVerification',
            target: 'Verification',
            // actions: { type: 'navigateInternal', params: { path: '/verify' } },
            reenter: true,
          },
        ],
      },
    },
    Verification: {
      tags: 'route:verification',
      on: {
        NEXT: [
          {
            guard: 'isStatusComplete',
            actions: 'setActive',
          },
          {
            guard: 'statusNeedsContinue',
            // actions: { type: 'navigateInternal', params: { path: '/continue' } },
            target: 'Continue',
            reenter: true,
          },
        ],
      },
    },
    Callback: {
      tags: 'route:callback',
      on: {
        NEXT: [
          {
            guard: 'isStatusComplete',
            actions: 'setActive',
          },
          {
            guard: 'statusNeedsVerification',
            target: 'Verification',
            actions: { type: 'navigateInternal', params: { path: '/verify' } },
          },
          {
            guard: 'statusNeedsContinue',
            actions: { type: 'navigateInternal', params: { path: '/continue' } },
            target: 'Continue',
          },
          {
            actions: { type: 'navigateInternal', params: { path: '/' } },
          },
        ],
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
