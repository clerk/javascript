import { snakeToCamel } from '@clerk/shared/underscore';
import { joinURL } from '@clerk/shared/url';
import type { SignInStrategy, SignUpResource, SignUpStatus, VerificationStatus } from '@clerk/types';
import type { NonReducibleUnknown } from 'xstate';
import { and, assertEvent, assign, enqueueActions, log, not, or, raise, sendTo, setup } from 'xstate';

import {
  ERROR_CODES,
  ROUTING,
  SEARCH_PARAMS,
  SIGN_IN_DEFAULT_BASE_PATH,
  SIGN_UP_DEFAULT_BASE_PATH,
  SSO_CALLBACK_PATH_ROUTE,
} from '~/internals/constants';
import { ClerkElementsError, ClerkElementsRuntimeError } from '~/internals/errors';
import type { FormDefaultValues } from '~/internals/machines/form';
import { ThirdPartyMachine, ThirdPartyMachineId } from '~/internals/machines/third-party';
import { shouldUseVirtualRouting } from '~/internals/machines/utils/next';

import type { BaseRouterLoadingStep } from '../types';
import { assertActorEventDone, assertActorEventError } from '../utils/assert';
import type { StartAttemptParams } from './actors';
import {
  startAttempt,
  startAttemptWeb3,
  verificationAttempt,
  verificationAttemptEmailLink,
  verificationPrepare,
} from './actors';
import type {
  SignUpRouterContext,
  SignUpRouterEvents,
  SignUpRouterNextEvent,
  SignUpRouterSchema,
} from './router.types';
import { SignUpVerificationMachine } from './verification.machine';

export const SignUpRouterMachineId = 'SignUpRouter';
export type TSignUpRouterMachine = typeof SignUpRouterMachine;

type PrefillFieldsKeys = keyof Pick<
  SignUpResource,
  'username' | 'firstName' | 'lastName' | 'emailAddress' | 'phoneNumber'
>;
const PREFILL_FIELDS: PrefillFieldsKeys[] = ['firstName', 'lastName', 'emailAddress', 'username', 'phoneNumber'];
const DISABLEABLE_FIELDS = ['emailAddress', 'phoneNumber'] as const;

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
    startAttempt,
    startAttemptWeb3,
    verificationAttempt,
    verificationAttemptEmailLink,
    verificationPrepare,

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

      const beforeEmit = () =>
        context.router?.push(context.router?.searchParams().get('redirect_url') || context.clerk.buildAfterSignUpUrl());
      void context.clerk.setActive({ session, beforeEmit });
    },
    delayedReset: raise({ type: 'RESET' }, { delay: 3000 }), // Reset machine after 3s delay.
    goToNextStep: raise(({ event }) => {
      assertActorEventDone<SignUpResource>(event);
      return { type: 'NEXT', resource: event?.output } as SignUpRouterNextEvent;
    }),
    markFormAsProgressive: ({ context }) => {
      const signUp = context.clerk.client.signUp;

      const missing = signUp.missingFields.map(snakeToCamel);
      const optional = signUp.optionalFields.map(snakeToCamel);
      const required = signUp.requiredFields.map(snakeToCamel);

      const progressiveFieldValues: FormDefaultValues = new Map();

      for (const key of required.concat(optional) as (keyof SignUpResource)[]) {
        if (key in signUp) {
          // @ts-expect-error - TS doesn't understand that key is a valid key of SignUpResource
          progressiveFieldValues.set(key, signUp[key]);
        }
      }

      sendTo(context.formRef, {
        type: 'MARK_AS_PROGRESSIVE',
        missing,
        optional,
        required,
        defaultValues: progressiveFieldValues,
      });
    },
    unmarkFormAsProgressive: ({ context }) => context.formRef.send({ type: 'UNMARK_AS_PROGRESSIVE' }),
    loadingBegin: assign((_, params: { step: BaseRouterLoadingStep; strategy?: SignInStrategy; action?: 'submit' }) => {
      const { step, strategy, action } = params;
      return {
        loading: {
          action,
          isLoading: true,
          step,
          strategy,
        },
      };
    }),
    loadingEnd: assign({
      loading: {
        action: undefined,
        isLoading: false,
        step: undefined,
        strategy: undefined,
      },
    }),
    setError: assign({
      error: (_, { error }: { error?: ClerkElementsError }) => {
        if (error) {
          return error;
        }
        return new ClerkElementsRuntimeError('Unknown error');
      },
    }),
    setFormDefaultValues: ({ context }) => {
      const signUp = context.clerk.client.signUp;
      const prefilledDefaultValues = new Map();

      for (const key of PREFILL_FIELDS) {
        if (key in signUp) {
          prefilledDefaultValues.set(key, signUp[key]);
        }
      }

      context.formRef.send({
        type: 'PREFILL_DEFAULT_VALUES',
        defaultValues: prefilledDefaultValues,
      });
    },
    setFormDisabledTicketFields: ({ context }) => {
      if (!context.ticket) {
        return;
      }

      const currentFields = context.formRef.getSnapshot().context.fields;

      for (const name of DISABLEABLE_FIELDS) {
        if (currentFields.has(name)) {
          sendTo(context.formRef, { type: 'FIELD.DISABLE', field: { name } });
        }
      }
    },
    setFormErrors: sendTo(
      ({ context }) => context.formRef,
      ({ event }) => {
        assertActorEventError(event);
        return {
          type: 'ERRORS.SET',
          error: event.error,
        };
      },
    ),
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
          redirectUrlComplete:
            context.router?.searchParams().get('redirect_url') || context.clerk.buildAfterSignUpUrl(),
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
          redirectUrlComplete:
            context.router?.searchParams().get('redirect_url') || context.clerk.buildAfterSignUpUrl(),
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
                path: context.router?.searchParams().get('redirect_url') || context.clerk.buildAfterSignUpUrl(),
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
          actions: { type: 'navigateInternal', params: { force: true, path: '/' } },
          target: 'Start',
        },
      ],
    },
    Start: {
      tags: ['step:start'],
      on: {
        'RESET.STEP': {
          target: 'Start',
          reenter: true,
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
      entry: 'setFormDefaultValues',
      exit: 'clearFormErrors',
      initial: 'Init',
      states: {
        Init: {
          description:
            'Handle ticket, if present; Else, default to Pending state. Per tickets, `Attempting` makes a `signUp.create` request allowing for an incomplete sign up to contain progressively filled fields on the Start step.',
          always: [
            {
              guard: 'hasTicket',
              target: 'Attempting',
            },
            {
              target: 'Pending',
            },
          ],
        },
        Pending: {
          tags: ['state:pending'],
          description: 'Waiting for user input',
          on: {
            SUBMIT: {
              guard: not('isExampleMode'),
              target: 'Attempting',
              reenter: true,
            },
            'AUTHENTICATE.WEB3': {
              guard: not('isExampleMode'),
              target: 'AttemptingWeb3',
              reenter: true,
            },
          },
        },
        Attempting: {
          tags: ['state:attempting', 'state:loading'],
          entry: {
            type: 'loadingBegin',
            params: {
              step: 'start',
            },
          },
          exit: 'loadingEnd',
          invoke: {
            id: 'startAttempt',
            src: 'startAttempt',
            input: ({ context }) => {
              // Standard fields
              const defaultParams = {
                clerk: context.clerk,
                fields: context.formRef.getSnapshot().context.fields,
              };

              // Handle ticket-specific flows
              const params: StartAttemptParams = context.ticket
                ? {
                    strategy: 'ticket',
                    ticket: context.ticket,
                  }
                : {};

              return { ...defaultParams, params };
            },
            onDone: {
              actions: ['setFormDisabledTicketFields', 'goToNextStep'],
            },
            onError: {
              actions: ['setFormDisabledTicketFields', 'setFormErrors'],
              target: 'Pending',
            },
          },
        },
        AttemptingWeb3: {
          tags: ['state:attempting', 'state:loading'],
          entry: {
            type: 'loadingBegin',
            params: {
              step: 'start',
            },
          },
          exit: 'loadingEnd',
          invoke: {
            id: 'startAttemptWeb3',
            src: 'startAttemptWeb3',
            input: ({ context, event }) => {
              assertEvent(event, 'AUTHENTICATE.WEB3');
              return {
                clerk: context.clerk,
                strategy: event.strategy,
              };
            },
            onDone: {
              actions: ['goToNextStep'],
            },
            onError: {
              actions: ['setFormErrors'],
              target: 'Pending',
            },
          },
        },
      },
    },
    Continue: {
      tags: ['step:continue'],
      entry: 'markFormAsProgressive',
      exit: 'unmarkFormAsProgressive',
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
      initial: 'Pending',
      states: {
        Pending: {
          tags: ['state:pending'],
          description: 'Waiting for user input',
          on: {
            SUBMIT: {
              target: 'Attempting',
              reenter: true,
            },
          },
        },
        Attempting: {
          tags: ['state:attempting', 'state:loading'],
          entry: {
            type: 'loadingBegin',
            params: {
              step: 'continue',
            },
          },
          exit: 'loadingEnd',
          invoke: {
            id: 'continueAttempt',
            src: 'startAttempt', // Re-use the same actor
            input: ({ context }) => ({
              clerk: context.clerk,
              fields: context.formRef.getSnapshot().context.fields,
            }),
            onDone: {
              actions: 'goToNextStep',
            },
            onError: {
              actions: 'setFormErrors',
              target: 'Pending',
            },
          },
        },
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
