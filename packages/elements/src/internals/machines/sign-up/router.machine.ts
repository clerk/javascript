import type { SignUpStatus, VerificationStatus } from '@clerk/shared/types';
import { joinURL } from '@clerk/shared/url';
import type { NonReducibleUnknown } from 'xstate';
import { and, assign, enqueueActions, log, not, or, raise, sendTo, setup } from 'xstate';

import {
  ERROR_CODES,
  ROUTING,
  SEARCH_PARAMS,
  SIGN_IN_DEFAULT_BASE_PATH,
  SIGN_UP_DEFAULT_BASE_PATH,
  SIGN_UP_MODES,
  SSO_CALLBACK_PATH_ROUTE,
} from '~/internals/constants';
import { ClerkElementsError, ClerkElementsRuntimeError } from '~/internals/errors';
import { ThirdPartyMachine, ThirdPartyMachineId } from '~/internals/machines/third-party';
import { shouldUseVirtualRouting } from '~/internals/machines/utils/next';

import { SignUpContinueMachine } from './continue.machine';
import type {
  SignUpRouterContext,
  SignUpRouterEvents,
  SignUpRouterNextEvent,
  SignUpRouterSchema,
} from './router.types';
import { SignUpStartMachine } from './start.machine';
import { SignUpVerificationMachine } from './verification.machine';

export const SignUpRouterMachineId = 'SignUpRouter';
export type TSignUpRouterMachine = typeof SignUpRouterMachine;

const isCurrentPath =
  (path: `/${string}`) =>
  ({ context }: { context: SignUpRouterContext }, _params?: NonReducibleUnknown) =>
    context.router?.match(path) ?? false;

const needsStatus =
  (status: SignUpStatus) =>
  ({ context, event }: { context: SignUpRouterContext; event?: SignUpRouterEvents }, _?: NonReducibleUnknown) =>
    (event as SignUpRouterNextEvent)?.resource?.status === status || context.clerk?.client?.signUp?.status === status;

export const SignUpRouterMachine = setup({
  actors: {
    continueMachine: SignUpContinueMachine,
    startMachine: SignUpStartMachine,
    thirdPartyMachine: ThirdPartyMachine,
    verificationMachine: SignUpVerificationMachine,
  },
  actions: {
    clearFormErrors: sendTo(({ context }) => context.formRef, { type: 'ERRORS.CLEAR' }),
    logUnknownError: snapshot => console.error('Unknown error:', snapshot),
    navigateInternal: ({ context }, { path, force = false }: { path: string; force?: boolean }) => {
      if (!context.router) {
        return;
      }
      if (!force && shouldUseVirtualRouting()) {
        return;
      }
      if (context.exampleMode) {
        return;
      }

      const resolvedPath = joinURL(context.router.basePath, path);
      if (resolvedPath === context.router.pathname()) {
        return;
      }

      context.router.shallowPush(resolvedPath);
    },
    navigateExternal: ({ context }, { path }: { path: string }) => context.router?.push(path),
    raiseNext: raise({ type: 'NEXT' }),
    setActive: ({ context, event }, params?: { sessionId?: string; useLastActiveSession?: boolean }) => {
      if (context.exampleMode) {
        return;
      }

      const session =
        params?.sessionId ||
        (params?.useLastActiveSession && context.clerk.client.lastActiveSessionId) ||
        ((event as SignUpRouterNextEvent)?.resource || context.clerk.client.signUp).createdSessionId;

      void context.clerk.setActive({
        session,
        redirectUrl: context.clerk.buildAfterSignUpUrl({
          params: context.router?.searchParams(),
        }),
      });
    },
    delayedReset: raise({ type: 'RESET' }, { delay: 3000 }), // Reset machine after 3s delay.
    setError: assign({
      error: (_, { error }: { error?: ClerkElementsError }) => {
        if (error) {
          return error;
        }
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
        case ERROR_CODES.ENTERPRISE_SSO_USER_ATTRIBUTE_MISSING:
        case ERROR_CODES.ENTERPRISE_SSO_EMAIL_ADDRESS_DOMAIN_MISMATCH:
        case ERROR_CODES.ENTERPRISE_SSO_HOSTED_DOMAIN_MISMATCH:
        case ERROR_CODES.SAML_EMAIL_ADDRESS_DOMAIN_MISMATCH:
        case ERROR_CODES.ORGANIZATION_MEMBERSHIP_QUOTA_EXCEEDED_FOR_SSO:
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
      if (!params) {
        return Boolean(value);
      }
      return value === params.status;
    },
    hasClerkTransfer: ({ context }) => Boolean(context.router?.searchParams().get(SEARCH_PARAMS.transfer)),
    hasResource: ({ context }) => Boolean(context.clerk.client.signUp),
    hasTicket: ({ context }) => Boolean(context.ticket),

    isLoggedInAndSingleSession: and(['isLoggedIn', 'isSingleSessionMode', not('isExampleMode')]),
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
    isSingleSessionMode: ({ context }) => Boolean(context.clerk?.__unstable__environment?.authConfig.singleSessionMode),
    isRestricted: ({ context }) =>
      context.clerk?.__unstable__environment?.userSettings.signUp.mode === SIGN_UP_MODES.RESTRICTED,
    isRestrictedWithoutTicket: and(['isRestricted', not('hasTicket')]),
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
      actions: sendTo(ThirdPartyMachineId, ({ context, event }) => ({
        type: 'REDIRECT',
        params: {
          strategy: event.strategy,
          redirectUrl: `${
            context.router?.mode === ROUTING.virtual
              ? context.clerk.__unstable__environment?.displayConfig.signUpUrl
              : context.router?.basePath
          }${SSO_CALLBACK_PATH_ROUTE}`,
          redirectUrlComplete: context.clerk.buildAfterSignUpUrl({
            params: context.router?.searchParams(),
          }),
        },
      })),
    },
    'AUTHENTICATE.SAML': {
      actions: sendTo(ThirdPartyMachineId, ({ context }) => ({
        type: 'REDIRECT',
        params: {
          strategy: 'saml',
          emailAddress: context.formRef.getSnapshot().context.fields.get('emailAddress')?.value,
          redirectUrl: `${
            context.router?.mode === ROUTING.virtual
              ? context.clerk.__unstable__environment?.displayConfig.signUpUrl
              : context.router?.basePath
          }${SSO_CALLBACK_PATH_ROUTE}`,
          redirectUrlComplete: context.clerk.buildAfterSignUpUrl({
            params: context.router?.searchParams(),
          }),
        },
      })),
    },
    'AUTHENTICATE.ENTERPRISE_SSO': {
      actions: sendTo(ThirdPartyMachineId, ({ context }) => ({
        type: 'REDIRECT',
        params: {
          strategy: 'enterprise_sso',
          emailAddress: context.formRef.getSnapshot().context.fields.get('emailAddress')?.value,
          redirectUrl: `${
            context.router?.mode === ROUTING.virtual
              ? context.clerk.__unstable__environment?.displayConfig.signUpUrl
              : context.router?.basePath
          }${SSO_CALLBACK_PATH_ROUTE}`,
          redirectUrlComplete: context.clerk.buildAfterSignUpUrl({
            params: context.router?.searchParams(),
          }),
        },
      })),
    },
    'AUTHENTICATE.WEB3': {
      actions: sendTo('start', ({ event }) => event),
    },
    'FORM.ATTACH': {
      description: 'Attach/re-attach the form to the router.',
      actions: enqueueActions(({ enqueue, event }) => {
        enqueue.assign({
          formRef: event.formRef,
        });

        // Reset the current step, to reset the form reference.
        enqueue.raise({ type: 'RESET.STEP' });
      }),
    },
    'NAVIGATE.PREVIOUS': '.Hist',
    'NAVIGATE.START': '.Start',
    LOADING: {
      actions: assign(({ event }) => ({
        loading: {
          isLoading: event.isLoading,
          step: event.step,
          strategy: event.strategy,
          action: event.action,
        },
      })),
    },
    RESET: '.Idle',
  },
  states: {
    Idle: {
      on: {
        INIT: {
          actions: assign(({ event }) => {
            const searchParams = event.router?.searchParams();

            return {
              clerk: event.clerk,
              router: event.router,
              signInPath: event.signInPath || SIGN_IN_DEFAULT_BASE_PATH,
              loading: {
                isLoading: false,
              },
              exampleMode: event.exampleMode || false,
              formRef: event.formRef,
              ticket:
                searchParams?.get(SEARCH_PARAMS.ticket) ||
                searchParams?.get(SEARCH_PARAMS.invitationToken) ||
                undefined,
            };
          }),
          target: 'Init',
        },
      },
    },
    Init: {
      entry: enqueueActions(({ context, enqueue, self }) => {
        if (!self.getSnapshot().children[ThirdPartyMachineId]) {
          enqueue.spawnChild('thirdPartyMachine', {
            id: ThirdPartyMachineId,
            systemId: ThirdPartyMachineId,
            input: {
              basePath: context.router?.basePath ?? SIGN_UP_DEFAULT_BASE_PATH,
              flow: 'signUp',
              formRef: context.formRef,
              parent: self,
            },
          });
        }
      }),
      always: [
        {
          guard: 'isLoggedInAndSingleSession',
          actions: [
            log('Already logged in'),
            {
              type: 'navigateExternal',
              params: ({ context }) => ({
                path: context.clerk.buildAfterSignUpUrl({
                  params: context.router?.searchParams(),
                }),
              }),
            },
          ],
        },
        {
          guard: 'needsCallback',
          target: 'Callback',
        },
        {
          guard: 'hasTicket',
          actions: { type: 'navigateInternal', params: { force: true, path: '/' } },
          target: 'Start',
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
          guard: 'isRestrictedWithoutTicket',
          target: 'Restricted',
        },
        {
          actions: { type: 'navigateInternal', params: { force: true, path: '/' } },
          target: 'Start',
        },
      ],
    },
    Start: {
      tags: ['step:start'],
      exit: 'clearFormErrors',
      invoke: {
        id: 'start',
        src: 'startMachine',
        input: ({ context, self }) => ({
          basePath: context.router?.basePath,
          formRef: context.formRef,
          parent: self,
          ticket: context.ticket,
        }),
        onDone: {
          actions: 'raiseNext',
        },
      },
      on: {
        'RESET.STEP': {
          actions: enqueueActions(({ enqueue, context }) => {
            enqueue('clearFormErrors');
            enqueue.sendTo('start', { type: 'SET_FORM', formRef: context.formRef });
          }),
        },
        NEXT: [
          {
            guard: 'isStatusComplete',
            actions: ['setActive', 'delayedReset'],
          },
          {
            guard: and(['hasTicket', 'statusNeedsContinue']),
            actions: { type: 'navigateInternal', params: { path: '/' } },
            target: 'Start',
            reenter: true,
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
      tags: ['step:continue'],
      invoke: {
        id: 'continue',
        src: 'continueMachine',
        input: ({ context, self }) => ({
          basePath: context.router?.basePath,
          formRef: context.formRef,
          parent: self,
        }),
        onDone: {
          actions: 'raiseNext',
        },
      },
      on: {
        'RESET.STEP': {
          target: 'Continue',
          reenter: true,
        },
        NEXT: [
          {
            guard: 'isStatusComplete',
            actions: ['setActive', 'delayedReset'],
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
      tags: ['step:verification'],
      invoke: {
        id: 'verification',
        src: 'verificationMachine',
        input: ({ context, self }) => ({
          attributes: context.clerk.__unstable__environment?.userSettings.attributes,
          basePath: context.router?.basePath,
          formRef: context.formRef,
          parent: self,
          resource: context.clerk.client.signUp,
        }),
        onDone: {
          actions: 'raiseNext',
        },
      },
      always: [
        {
          guard: 'hasCreatedSession',
          actions: [
            ({ context }) => ({
              type: 'setActive',
              params: { sessionId: context.router?.searchParams().get(SEARCH_PARAMS.createdSession) },
            }),
            'delayedReset',
          ],
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
        'RESET.STEP': {
          target: 'Verification',
          reenter: true,
        },
        NEXT: [
          {
            guard: 'isStatusComplete',
            actions: ['setActive', 'delayedReset'],
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
      tags: ['step:callback'],
      entry: sendTo(ThirdPartyMachineId, { type: 'CALLBACK' }),
      on: {
        NEXT: [
          {
            guard: 'isStatusComplete',
            actions: ['setActive', 'delayedReset'],
          },
          {
            description: 'Handle a case where the user has already been authenticated via ClerkJS',
            guard: 'hasAuthenticatedViaClerkJS',
            actions: [{ type: 'setActive', params: { useLastActiveSession: true } }, 'delayedReset'],
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
    Restricted: {
      tags: ['step:restricted'],
      on: {
        NEXT: 'Start',
      },
    },
    Error: {
      tags: ['step:error'],
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
