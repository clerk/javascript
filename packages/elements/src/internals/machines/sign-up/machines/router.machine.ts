import type { SignUpStatus } from '@clerk/types';
import type { NonReducibleUnknown } from 'xstate';
import { and, assign, enqueueActions, log, not, or, sendTo, setup, stopChild } from 'xstate';

import { SIGN_IN_DEFAULT_BASE_PATH, SIGN_UP_DEFAULT_BASE_PATH, SSO_CALLBACK_PATH_ROUTE } from '~/internals/constants';
import type { ClerkElementsError } from '~/internals/errors';
import { ClerkElementsRuntimeError } from '~/internals/errors';
import type {
  SignUpRouterContext,
  SignUpRouterEvents,
  SignUpRouterNextEvent,
  SignUpRouterSchema,
} from '~/internals/machines/sign-up/types';
import { THIRD_PARTY_MACHINE_ID, ThirdPartyMachine } from '~/internals/machines/third-party/machine';
import { shouldUseVirutalRouting } from '~/internals/machines/utils/next';

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
  actors: {
    thirdParty: ThirdPartyMachine,
  },
  actions: {
    logUnknownError: snapshot => console.error('Unknown error:', snapshot),
    navigateInternal: ({ context }, { path, force = false }: { path: string; force?: boolean }) => {
      if (!context.router) return;
      if (!force && shouldUseVirutalRouting()) return;

      const resolvedPath = [context.router.basePath, path].join('/').replace(/\/\/g/, '/');
      if (resolvedPath === context.router.pathname()) return;

      context.router.push(resolvedPath);
    },
    navigateExternal: ({ context }, { path }: { path: string }) => context.router?.push(path),
    setActive({ context, event }, params?: { sessionId?: string; useLastActiveSession?: boolean }) {
      const session =
        params?.sessionId ||
        (params?.useLastActiveSession && context.clerk.client.lastActiveSessionId) ||
        ((event as SignUpRouterNextEvent)?.resource || context.clerk.client.signUp).createdSessionId;

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

    hasAuthenticatedViaClerkJS: ({ context }) =>
      Boolean(context.clerk.client.signUp.status === null && context.clerk.client.lastActiveSessionId),

    hasCreatedSession: ({ context }) => Boolean(context.router?.searchParams().get('__clerk_created_session')),
    hasClerkStatus: ({ context }) => Boolean(context.router?.searchParams().get('__clerk_status')),
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
    needsVerification: and(['statusNeedsVerification', isCurrentPath('/verify')]),
    needsCallback: isCurrentPath(SSO_CALLBACK_PATH_ROUTE),

    statusNeedsIdentifier: or([not('hasResource'), 'isStatusAbandoned']),
    statusNeedsContinue: or(['isMissingRequiredFields']),
    statusNeedsVerification: or(['isMissingRequiredUnverifiedFields', and(['areFieldsMissing', 'hasClerkStatus'])]),
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
          guard: 'needsCallback',
          target: 'Callback',
        },
        {
          guard: 'needsIdentifier',
          actions: { type: 'navigateInternal', params: { force: true, path: '/' } },
          target: 'Start',
        },
        {
          guard: 'needsVerification',
          actions: { type: 'navigateInternal', params: { force: true, path: '/verify' } },
          target: 'Verification',
        },
        {
          guard: 'needsContinue',
          actions: { type: 'navigateInternal', params: { force: true, path: '/continue' } },
          target: 'Continue',
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
            guard: 'isStatusComplete',
            actions: 'setActive',
          },
          {
            guard: 'statusNeedsVerification',
            target: 'Verification',
            actions: { type: 'navigateInternal', params: { path: '/verify' } },
            reenter: true,
          },
          {
            guard: 'statusNeedsContinue',
            actions: { type: 'navigateInternal', params: { path: '/continue' } },
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
            actions: { type: 'navigateInternal', params: { path: '/verify' } },
            reenter: true,
          },
        ],
      },
    },
    Verification: {
      tags: 'route:verification',
      always: [
        {
          guard: 'hasCreatedSession',
          actions: ({ context }) => ({
            type: 'setActive',
            params: { sessionId: context.router?.searchParams().get('__clerk_created_session') },
          }),
        },
        {
          guard: ({ context }) => context.router?.searchParams().get('__clerk_status') === 'verified',
          actions: { type: 'navigateInternal', params: { force: true, path: '/continue' } },
        },
        {
          guard: ({ context }) => context.router?.searchParams().get('__clerk_status') === 'expired',
          actions: { type: 'navigateInternal', params: { force: true, path: '/' } },
        },
      ],
      on: {
        NEXT: [
          {
            guard: 'isStatusComplete',
            actions: 'setActive',
          },
          {
            guard: 'statusNeedsContinue',
            actions: { type: 'navigateInternal', params: { path: '/continue' } },
            target: 'Continue',
            reenter: true,
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
          basePath: context.router?.basePath ?? SIGN_UP_DEFAULT_BASE_PATH,
          clerk: context.clerk,
          flow: 'signUp',
        }),
      },
      entry: sendTo(THIRD_PARTY_MACHINE_ID, { type: 'CALLBACK' }),
      on: {
        NEXT: [
          {
            guard: 'isStatusComplete',
            actions: 'setActive',
          },
          {
            description: 'Handle a case where the user has already been authenticated via ClerkJS',
            guard: 'hasAuthenticatedViaClerkJS',
            actions: { type: 'setActive', params: { useLastActiveSession: true } },
          },
          {
            guard: 'statusNeedsVerification',
            actions: { type: 'navigateInternal', params: { path: '/verify' } },
            target: 'Verification',
          },
          {
            guard: 'statusNeedsContinue',
            actions: { type: 'navigateInternal', params: { path: '/continue' } },
            target: 'Continue',
          },
          {
            actions: { type: 'navigateInternal', params: { path: '/' } },
            target: 'Start',
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
