import type { SignUpStatus } from '@clerk/types';
import type { NonReducibleUnknown } from 'xstate';
import { and, assign, enqueueActions, log, not, or, raise, setup, stopChild } from 'xstate';

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
    clearSpawnedRoutes: raise({ type: 'ROUTE.CLEAR' }),
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
    // isFieldMissing: ({ context }, { field }: { field: SignUpField }) =>
    //   context.clerk.client.signUp.missingFields.includes(field),

    // USED -------------------------------------------------------------------------------------

    areFieldsMissing: ({ context }) => context.clerk.client.signUp.missingFields.length > 0,
    areFieldsUnverified: ({ context }) => context.clerk.client.signUp.unverifiedFields.length > 0,

    isStatusAbandoned: needsStatus('abandoned'),
    isStatusComplete: ({ context, event }) => {
      const resource = (event as SignUpRouterNextEvent)?.resource;
      const signIn = context.clerk.client.signUp;

      return (
        (resource?.status === 'complete' && Boolean(resource?.createdSessionId)) ||
        (signIn.status === 'complete' && Boolean(signIn.createdSessionId))
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
  /** @xstate-layout N4IgpgJg5mDOIC5QGUCWUB2BVADgJQHsBXAFzACcBiCAjMAOlhIEMz61NdDSKBtABgC6iUDgKxUJVLREgAHogCcARgAc9ZQCYAbAGYALFsWrNu5doA0IAJ6Jl-AOz1NAVheat+l1u8mAvn5WHNj4xGRUAAp4AKIAagLCSCBiElIySQoIyvb0qoqKDqr6mqrKui76pVa2CJqKuvRmri7aLvn6XsoBQegh3OGUeADyWAAq0fQxAOIAksjjeAmyKZLSGLKZiqb0Dmaq-Ka62vXKDtV2mt0gwVxhFIMj4-RYAHLTcwtLSStp6xlKWno2gc-G0ZX4Xk0oLONguin4GgcLgMXn0ugc5kugWuvVuPCowzGEwAwgAZaIAQUWQmW4lW6VAm3K9C8IKK9jRp1U5yyykU+noW34ajqJxKVxuoXx9BmGEklC+ojpvw2iGBPMqDWFp3yqmODjqFQluKl4RlcpICuUiSVqTWqtqyJZXl0EJcbPKih5bnUZVKB20ejB2WNnFNFHN8t4mhtyWV9v+tUqzuRbo9bQ1wMaSIhBm8lTcDlDfTu5Ejlt4uljPwTjMQrgaHVTrP4qk9PPR2iB2WMxV09W0xbxZtlUf01fjDPk9adTddLbbGdhCAcgechRBUP4BSRQ-DZdHFZcE7tU8yDZT8-drfby+0yfh2XsBRcjjqe-6EeQLHIlpe0QADVGRU41PP46wQV8EVODEDHvLQwX5HkDUUXIHFXH1735NwP1Ldgfz-QDgOtWkwIdJEu1BVxtBMMoShcZC1BZbdV17NxFHcXDpW-Zhf0of8gOjE96XA6cVxaegqJaWjdHonlSgaQN9GMTQ6ho-Qi2xSVPzLYlaCkDAiDAfiiJAmszzsDEEX0IN+HRDw2wcfQeRU5i+RKbR+G3cxFC4s09IwAyjJMwSSO+SdRMyMoJKhFx9k0JFygNGEalKdQSg8XwsOMQctJNHT6FiChUAAM1QABjVg1hC4CaXCsjE2yLzGihI4VFKCoCnkkpJLbXRVDS1k-IjIryFKiqqtoGreDC20RIdaKu1i+LEvdBKXLKehkV2e8zG0VwIWG3TmAAGxOgAjZhyoAa2muq5pVRMoMRWCbMMHRNBcts0NXMFHBo-bcp6MMCuJU6Lqu26BOI4THogijJP26SPFk1QGOXeFUP2DSEtklovCO+gwbOy6bummNSPmxMEakmiUbk5d7CzJSCn4Co1FXXRCeJiGydGPAKReZAADFompWHazE9jBULdCWjsqFlHkgagVUjo9Wo+xVEJ6JyHIAgqGhsyIodC85zTG8l1S7ItvyYUDlXDwOICbEMAICA4FkbTS0puGxL5Hk1GULaDjaDovLcSpCcPX3JainI8gKIoSmiyoleXd11HQtPA3vPRkUJnjf1jizIO+tmcfKdxHEqeTXQ0VGaL2vldm5-TUEMsAS8iyzCha05W2MVi0cD1tNCBd1lEMNmPBo7W8pBvDRvGyq-fMnveTaLb3B8110Rs3QXJ63R+s80Fylo3yF5LaUedJ67u4dFpUOOZF+Sc9x9kPxnWwFOjVF2J-bIBNr7DgjLrfW5BH6NQhLkMwBRwSZ3qOjVKBgWRpWyK+J8ahCYAAlUBMGgRBM2LoLaLi9MuHQ6gTBuHKLJBKyh3CaQCEAA */
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
      actions: enqueueActions(({ context, enqueue, event, self }) => {
        const { clerk, router } = context;
        const { id, logic, input } = event;

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
  // onDone: {
  //   actions: 'clearSpawnedRoutes',
  // },
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
