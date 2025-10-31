import type { SignInStatus } from '@clerk/shared/types';
import { joinURL } from '@clerk/shared/url';
import { isWebAuthnAutofillSupported } from '@clerk/shared/webauthn';
import type { NonReducibleUnknown } from 'xstate';
import { and, assign, enqueueActions, fromPromise, log, not, or, raise, sendTo, setup } from 'xstate';

import {
  CHOOSE_SESSION_PATH_ROUTE,
  ERROR_CODES,
  ROUTING,
  SEARCH_PARAMS,
  SIGN_IN_DEFAULT_BASE_PATH,
  SIGN_UP_DEFAULT_BASE_PATH,
  SSO_CALLBACK_PATH_ROUTE,
} from '~/internals/constants';
import { ClerkElementsError, ClerkElementsRuntimeError } from '~/internals/errors';
import { ThirdPartyMachine, ThirdPartyMachineId } from '~/internals/machines/third-party';
import { shouldUseVirtualRouting } from '~/internals/machines/utils/next';

import { FormMachine } from '../form';
import { SignInResetPasswordMachine } from './reset-password.machine';
import type {
  SignInRouterContext,
  SignInRouterEvents,
  SignInRouterNextEvent,
  SignInRouterSchema,
  SignInRouterSessionSetActiveEvent,
} from './router.types';
import { SignInStartMachine } from './start.machine';
import { SignInFirstFactorMachine, SignInSecondFactorMachine } from './verification.machine';

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
    firstFactorMachine: SignInFirstFactorMachine,
    formMachine: FormMachine,
    resetPasswordMachine: SignInResetPasswordMachine,
    startMachine: SignInStartMachine,
    secondFactorMachine: SignInSecondFactorMachine,
    thirdPartyMachine: ThirdPartyMachine,
    webAuthnAutofillSupport: fromPromise(() => isWebAuthnAutofillSupported()),
  },
  actions: {
    clearFormErrors: sendTo(({ context }) => context.formRef, { type: 'ERRORS.CLEAR' }),
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
    setActive: enqueueActions(({ enqueue, check, context, event }) => {
      if (check('isExampleMode')) {
        return;
      }

      const id = (event as SignInRouterSessionSetActiveEvent)?.id;
      const lastActiveSessionId = context.clerk.client.lastActiveSessionId;
      const createdSessionId = ((event as SignInRouterNextEvent)?.resource || context.clerk.client.signIn)
        .createdSessionId;

      const session = id || createdSessionId || lastActiveSessionId || null;

      void context.clerk.setActive({
        session,
        redirectUrl: context.clerk.buildAfterSignInUrl({
          params: context.router?.searchParams(),
        }),
      });

      enqueue.raise({ type: 'RESET' }, { delay: 2000 }); // Reset machine after 2s delay.
    }),
    setError: assign({
      error: (_, { error }: { error?: ClerkElementsError }) => {
        if (error) {
          return error;
        }
        return new ClerkElementsRuntimeError('Unknown error');
      },
    }),
    setFormErrors: ({ context }, params: { error: Error }) =>
      sendTo(context.formRef, {
        type: 'ERRORS.SET',
        error: params.error,
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
          error = new ClerkElementsError(errorOrig.code, errorOrig.longMessage || '');
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
    transfer: ({ context }) => {
      const searchParams = new URLSearchParams({ __clerk_transfer: '1' });
      context.router?.push(`${context.signUpPath}?${searchParams}`);
    },
  },
  guards: {
    hasAuthenticatedViaClerkJS: ({ context }) =>
      Boolean(context.clerk.client.signIn.status === null && context.clerk.client.lastActiveSessionId),
    hasOAuthError: ({ context }) => Boolean(context.clerk?.client?.signIn?.firstFactorVerification?.error),
    hasResource: ({ context }) => Boolean(context.clerk?.client?.signIn?.status),
    hasTicket: ({ context }) => Boolean(context.ticket),

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
    needsChooseSession: isCurrentPath(CHOOSE_SESSION_PATH_ROUTE),
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
      actions: sendTo(ThirdPartyMachineId, ({ context, event }) => ({
        type: 'REDIRECT',
        params: {
          strategy: event.strategy,
          redirectUrl: `${
            context.router?.mode === ROUTING.virtual
              ? context.clerk.__unstable__environment?.displayConfig.signInUrl
              : context.router?.basePath
          }${SSO_CALLBACK_PATH_ROUTE}`,
          redirectUrlComplete: context.clerk.buildAfterSignInUrl({
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
          identifier: context.formRef.getSnapshot().context.fields.get('identifier')?.value,
          redirectUrl: `${
            context.router?.mode === ROUTING.virtual
              ? context.clerk.__unstable__environment?.displayConfig.signInUrl
              : context.router?.basePath
          }${SSO_CALLBACK_PATH_ROUTE}`,
          redirectUrlComplete: context.clerk.buildAfterSignInUrl({
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
          identifier: context.formRef.getSnapshot().context.fields.get('identifier')?.value,
          redirectUrl: `${
            context.router?.mode === ROUTING.virtual
              ? context.clerk.__unstable__environment?.displayConfig.signInUrl
              : context.router?.basePath
          }${SSO_CALLBACK_PATH_ROUTE}`,
          redirectUrlComplete: context.clerk.buildAfterSignInUrl({
            params: context.router?.searchParams(),
          }),
        },
      })),
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
      invoke: {
        id: 'webAuthnAutofill',
        src: 'webAuthnAutofillSupport',
        onDone: {
          actions: assign({ webAuthnAutofillSupport: ({ event }) => event.output }),
        },
      },
      on: {
        INIT: {
          actions: assign(({ event }) => {
            const searchParams = event.router?.searchParams();

            return {
              clerk: event.clerk,
              exampleMode: event.exampleMode || false,
              formRef: event.formRef,
              loading: {
                isLoading: false,
              },
              router: event.router,
              signUpPath: event.signUpPath || SIGN_UP_DEFAULT_BASE_PATH,
              ticket: searchParams?.get(SEARCH_PARAMS.ticket) || undefined,
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
              basePath: context.router?.basePath ?? SIGN_IN_DEFAULT_BASE_PATH,
              flow: 'signIn',
              formRef: context.formRef,
              parent: self,
            },
          });
        }
      }),
      always: [
        {
          guard: 'needsCallback',
          target: 'Callback',
        },
        {
          guard: 'needsChooseSession',
          target: 'ChooseSession',
        },
        {
          guard: 'isComplete',
          actions: 'setActive',
        },
        {
          guard: 'isLoggedInAndSingleSession',
          actions: [
            log('Already logged in'),
            {
              type: 'navigateExternal',
              params: ({ context }) => ({
                path: context.clerk.buildAfterSignInUrl({
                  params: context.router?.searchParams(),
                }),
              }),
            },
          ],
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
        {
          guard: 'hasTicket',
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
          target: 'Start',
          reenter: true,
        },
        'AUTHENTICATE.PASSKEY': {
          actions: sendTo('start', ({ event }) => event),
        },
        'AUTHENTICATE.PASSKEY.AUTOFILL': {
          actions: sendTo('start', ({ event }) => event),
        },
        'AUTHENTICATE.WEB3': {
          actions: sendTo('start', ({ event }) => event),
        },
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
          {
            guard: 'statusNeedsNewPassword',
            actions: { type: 'navigateInternal', params: { path: '/reset-password' } },
            target: 'ResetPassword',
          },
        ],
      },
    },
    FirstFactor: {
      tags: ['step:first-factor', 'step:verifications'],
      invoke: {
        id: 'firstFactor',
        src: 'firstFactorMachine',
        input: ({ context, self }) => ({
          formRef: context.formRef,
          parent: self,
          basePath: context.router?.basePath,
        }),
        onDone: {
          actions: 'raiseNext',
        },
      },
      on: {
        'AUTHENTICATE.PASSKEY': {
          actions: sendTo('firstFactor', ({ event }) => event),
        },
        'RESET.STEP': {
          target: 'FirstFactor',
          reenter: true,
        },
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
          tags: ['step:choose-strategy'],
          on: {
            'NAVIGATE.PREVIOUS': {
              description: 'Go to Idle, and also tell firstFactor to go to Pending',
              target: 'Idle',
              actions: sendTo('firstFactor', { type: 'NAVIGATE.PREVIOUS' }),
            },
          },
        },
        ForgotPassword: {
          tags: ['step:forgot-password'],
          on: {
            'NAVIGATE.PREVIOUS': 'Idle',
          },
        },
      },
    },
    SecondFactor: {
      tags: ['step:second-factor', 'step:verifications'],
      invoke: {
        id: 'secondFactor',
        src: 'secondFactorMachine',
        input: ({ context, self }) => ({
          formRef: context.formRef,
          parent: self,
        }),
        onDone: {
          actions: 'raiseNext',
        },
      },
      on: {
        'RESET.STEP': {
          target: 'SecondFactor',
          reenter: true,
        },
        NEXT: [
          {
            guard: 'isComplete',
            actions: 'setActive',
          },
          {
            guard: 'statusNeedsNewPassword',
            actions: { type: 'navigateInternal', params: { path: '/reset-password' } },
            target: 'ResetPassword',
          },
        ],
        'STRATEGY.UPDATE': {
          description: 'Send event to verification machine to update the current strategy.',
          actions: sendTo('secondFactor', ({ event }) => event),
          target: '.Idle',
        },
      },
      initial: 'Idle',
      states: {
        Idle: {
          on: {
            'NAVIGATE.CHOOSE_STRATEGY': {
              description: 'Navigate to choose strategy screen.',
              actions: sendTo('secondFactor', ({ event }) => event),
              target: 'ChoosingStrategy',
            },
          },
        },
        ChoosingStrategy: {
          tags: ['step:choose-strategy'],
          on: {
            'NAVIGATE.PREVIOUS': {
              description: 'Go to Idle, and also tell firstFactor to go to Pending',
              target: 'Idle',
              actions: sendTo('secondFactor', { type: 'NAVIGATE.PREVIOUS' }),
            },
          },
        },
      },
    },
    ResetPassword: {
      tags: ['step:reset-password'],
      invoke: {
        id: 'resetPassword',
        src: 'resetPasswordMachine',
        input: ({ context, self }) => ({
          formRef: context.formRef,
          parent: self,
        }),
        onDone: {
          actions: 'raiseNext',
        },
      },
      on: {
        'RESET.STEP': {
          target: 'ResetPassword',
          reenter: true,
        },
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
    Callback: {
      tags: ['step:callback'],
      entry: sendTo(ThirdPartyMachineId, { type: 'CALLBACK' }),
      on: {
        NEXT: [
          {
            guard: 'hasOAuthError',
            actions: ['setFormOAuthErrors', { type: 'navigateInternal', params: { force: true, path: '/' } }],
            target: 'Start',
          },
          {
            guard: or(['isLoggedIn', 'isComplete', 'hasAuthenticatedViaClerkJS']),
            actions: 'setActive',
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
    ChooseSession: {
      tags: ['step:choose-session'],
      on: {
        'SESSION.SET_ACTIVE': {
          actions: {
            type: 'setActive',
            params: ({ event }) => ({ id: event.id }),
          },
        },
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
