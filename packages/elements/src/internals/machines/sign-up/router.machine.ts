import { joinURL } from '@clerk/shared/url';
import type { SignUpStatus, VerificationStatus } from '@clerk/types';
import type { NonReducibleUnknown } from 'xstate';
import { and, assign, enqueueActions, log, not, or, sendTo, setup, spawnChild, stopChild } from 'xstate';

import {
  ERROR_CODES,
  SEARCH_PARAMS,
  SIGN_IN_DEFAULT_BASE_PATH,
  SIGN_UP_DEFAULT_BASE_PATH,
  SSO_CALLBACK_PATH_ROUTE,
} from '~/internals/constants';
import { ClerkElementsError, ClerkElementsRuntimeError } from '~/internals/errors';
import { ThirdPartyMachine, ThirdPartyMachineId } from '~/internals/machines/third-party';
import { shouldUseVirtualRouting } from '~/internals/machines/utils/next';

import type {
  SignUpRouterContext,
  SignUpRouterEvents,
  SignUpRouterNextEvent,
  SignUpRouterSchema,
} from './router.types';

const isCurrentPath =
  (path: `/${string}`) =>
  ({ context }: { context: SignUpRouterContext }, _params?: NonReducibleUnknown) =>
    context.router?.match(path) ?? false;

const needsStatus =
  (status: SignUpStatus) =>
  ({ context, event }: { context: SignUpRouterContext; event?: SignUpRouterEvents }, _?: NonReducibleUnknown) =>
    (event as SignUpRouterNextEvent)?.resource?.status === status || context.clerk?.client?.signUp?.status === status;

export const SignUpRouterMachineId = 'SignUpRouter';
export type TSignUpRouterMachine = typeof SignUpRouterMachine;

export const SignUpRouterMachine = setup({
  actors: {
    thirdParty: ThirdPartyMachine,
  },
  actions: {
    clearFormErrors: sendTo(({ context }) => context.formRef, { type: 'ERRORS.CLEAR' }),
    logUnknownError: snapshot => console.error('Unknown error:', snapshot),
    navigateInternal: ({ context }, { path, force = false }: { path: string; force?: boolean }) => {
      if (!context.router) return;
      if (!force && shouldUseVirtualRouting()) return;
      if (context.exampleMode) return;

      const resolvedPath = joinURL(context.router.basePath, path);
      if (resolvedPath === context.router.pathname()) return;

      context.router.shallowPush(resolvedPath);
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
    setFormOAuthErrors: ({ context }) => {
      const errorOrig = context.clerk.client.signIn.firstFactorVerification.error;

      if (!errorOrig) {
        return;
      }

      let error: ClerkElementsError;

      switch (errorOrig.code) {
        case ERROR_CODES.NOT_ALLOWED_TO_SIGN_UP:
        case ERROR_CODES.OAUTH_ACCESS_DENIED:
        case ERROR_CODES.NOT_ALLOWED_ACCESS:
        case ERROR_CODES.SAML_USER_ATTRIBUTE_MISSING:
        case ERROR_CODES.OAUTH_EMAIL_DOMAIN_RESERVED_BY_SAML:
        case ERROR_CODES.USER_LOCKED:
          error = new ClerkElementsError(errorOrig.code, errorOrig.longMessage!);
          break;
        default:
          error = new ClerkElementsError(
            'unable_to_complete',
            'Unable to complete action at this time. If the problem persists please contact support.',
          );
      }

      context.formRef.send({
        type: 'ERRORS.SET',
        error,
      });
    },
    transfer: ({ context }) => context.router?.push(context.clerk.buildSignInUrl()),
  },
  guards: {
    areFieldsMissing: ({ context }) => context.clerk?.client?.signUp?.missingFields?.length > 0,
    areFieldsUnverified: ({ context }) => context.clerk?.client?.signUp?.unverifiedFields?.length > 0,

    hasAuthenticatedViaClerkJS: ({ context }) =>
      Boolean(context.clerk.client.signUp.status === null && context.clerk.client.lastActiveSessionId),
    hasCreatedSession: ({ context }) => Boolean(context.router?.searchParams().get(SEARCH_PARAMS.createdSession)),
    hasClerkStatus: ({ context }, params?: { status: VerificationStatus }) => {
      const value = context.router?.searchParams().get(SEARCH_PARAMS.status);
      if (!params) return Boolean(value);
      return value === params.status;
    },
    hasClerkTransfer: ({ context }) => Boolean(context.router?.searchParams().get(SEARCH_PARAMS.transfer)),
    hasResource: ({ context }) => Boolean(context.clerk.client.signUp),

    isStatusAbandoned: needsStatus('abandoned'),
    isStatusComplete: ({ context, event }) => {
      const resource = (event as SignUpRouterNextEvent)?.resource;
      const signUp = context.clerk?.client?.signUp;

      return (
        (resource?.status === 'complete' && Boolean(resource?.createdSessionId)) ||
        (signUp?.status === 'complete' && Boolean(signUp?.createdSessionId))
      );
    },
    isStatusMissingRequirements: needsStatus('missing_requirements'),

    isLoggedIn: or(['isStatusComplete', ({ context }) => Boolean(context.clerk.user)]),
    isExampleMode: ({ context }) => Boolean(context.exampleMode),
    isMissingRequiredFields: and(['isStatusMissingRequirements', 'areFieldsMissing']),
    isMissingRequiredUnverifiedFields: and(['isStatusMissingRequirements', 'areFieldsUnverified']),

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
      actions: enqueueActions(({ context, enqueue, event, self, system }) => {
        const { id, logic, input } = event;

        if (!system.get(id)) {
          // @ts-expect-error - This is valid (See: https://discord.com/channels/795785288994652170/1203714033190969405/1205595237293096960)
          enqueue.spawnChild(logic, {
            id,
            systemId: id,
            input: { basePath: context.router?.basePath, parent: self, formRef: context.formRef, ...input },
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
            signInPath: event.signInPath || SIGN_IN_DEFAULT_BASE_PATH,
            loading: {
              isLoading: false,
            },
            exampleMode: event.exampleMode || false,
            formRef: event.formRef,
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
          basePath: context.router?.basePath ?? SIGN_UP_DEFAULT_BASE_PATH,
          environment: context.clerk.__unstable__environment,
          flow: 'signUp',
          formRef: context.formRef,
          parent: self,
        }),
      }),
      always: [
        {
          guard: and(['isLoggedIn', not('isExampleMode')]),
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
          guard: 'needsVerification',
          actions: { type: 'navigateInternal', params: { force: true, path: '/verify' } },
          target: 'Verification',
        },
        {
          guard: or(['needsContinue', 'hasClerkTransfer']),
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
      exit: 'clearFormErrors',
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
            params: { sessionId: context.router?.searchParams().get(SEARCH_PARAMS.createdSession) },
          }),
        },
        {
          guard: { type: 'hasClerkStatus', params: { status: 'verified' } },
          actions: { type: 'navigateInternal', params: { force: true, path: '/continue' } },
        },
        {
          guard: { type: 'hasClerkStatus', params: { status: 'expired' } },
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
          actions: 'clearFormErrors',
        },
      },
    },
    Hist: {
      type: 'history',
      exit: 'clearFormErrors',
    },
  },
});
