import { inBrowser } from '@clerk/shared/browser';
import type {
  __experimental_CheckoutInstance,
  CheckoutFutureResource,
  Clerk,
  CommerceSubscriptionPlanPeriod,
  Errors,
  ForPayerType,
  NullableCheckoutSignal,
  State,
} from '@clerk/types';

import { errorThrower } from './errors/errorThrower';
import type { IsomorphicClerk } from './isomorphicClerk';

const defaultErrors = (): Errors => ({
  fields: {
    firstName: null,
    lastName: null,
    emailAddress: null,
    identifier: null,
    phoneNumber: null,
    password: null,
    username: null,
    code: null,
    captcha: null,
    legalAccepted: null,
  },
  raw: null,
  global: null,
});

type CheckoutSignalProps = {
  for?: ForPayerType;
  planPeriod: CommerceSubscriptionPlanPeriod;
  planId: string;
};

export class StateProxy implements State {
  constructor(private isomorphicClerk: IsomorphicClerk) {}

  private readonly signInSignalProxy = this.buildSignInProxy();
  private readonly signUpSignalProxy = this.buildSignUpProxy();

  signInSignal() {
    return this.signInSignalProxy;
  }
  signUpSignal() {
    return this.signUpSignalProxy;
  }

  checkoutSignal(params: CheckoutSignalProps) {
    return this.buildCheckoutProxy(params);
  }

  checkoutSignalV2(params: CheckoutSignalProps) {
    return this.buildCheckoutProxyV2(params);
  }

  private buildSignInProxy() {
    const target = () => this.client.signIn.__internal_future;

    return {
      errors: defaultErrors(),
      fetchStatus: 'idle' as const,
      signIn: {
        status: 'needs_identifier' as const,
        availableStrategies: [],
        isTransferable: false,

        create: this.gateMethod(target, 'create'),
        password: this.gateMethod(target, 'password'),
        sso: this.gateMethod(target, 'sso'),
        finalize: this.gateMethod(target, 'finalize'),

        emailCode: this.wrapMethods(() => target().emailCode, ['sendCode', 'verifyCode'] as const),
        resetPasswordEmailCode: this.wrapMethods(() => target().resetPasswordEmailCode, [
          'sendCode',
          'verifyCode',
          'submitPassword',
        ] as const),
        phoneCode: this.wrapMethods(() => target().phoneCode, ['sendCode', 'verifyCode'] as const),
        mfa: this.wrapMethods(() => target().mfa, [
          'sendPhoneCode',
          'verifyPhoneCode',
          'verifyTOTP',
          'verifyBackupCode',
        ] as const),
      },
    };
  }

  private buildSignUpProxy() {
    const gateProperty = this.gateProperty.bind(this);
    const gateMethod = this.gateMethod.bind(this);
    const wrapMethods = this.wrapMethods.bind(this);
    const target = () => this.client.signUp.__internal_future;

    return {
      errors: defaultErrors(),
      fetchStatus: 'idle' as const,
      signUp: {
        get status() {
          return gateProperty(target, 'status', 'missing_requirements');
        },
        get unverifiedFields() {
          return gateProperty(target, 'unverifiedFields', []);
        },
        get isTransferable() {
          return gateProperty(target, 'isTransferable', false);
        },

        create: gateMethod(target, 'create'),
        update: gateMethod(target, 'update'),
        sso: gateMethod(target, 'sso'),
        password: gateMethod(target, 'password'),
        finalize: gateMethod(target, 'finalize'),

        verifications: wrapMethods(() => target().verifications, [
          'sendEmailCode',
          'verifyEmailCode',
          'sendPhoneCode',
          'verifyPhoneCode',
        ] as const),
      },
    };
  }

  // private buildCheckoutProxy(params: CheckoutSignalProps) {
  //   const gateProperty = this.gateProperty.bind(this);
  //   const gateMethod = this.gateMethod.bind(this);
  //   const target = () => this.checkout(params).getState();

  //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //   const targetCheckout = () => this.checkout(params).getState().checkout!;
  //   const targetMethods = () => this.checkout(params);

  //   return {
  //     error: null,
  //     fetchStatus: 'idle' as const,
  //     getState: gateMethod(targetMethods, 'getState'),
  //     subscribe: gateMethod(targetMethods, 'subscribe'),
  //     checkout: {
  //       get status() {
  //         return gateProperty(target, 'status', 'needs_initialization');
  //       },
  //       get isStarting() {
  //         return gateProperty(target, 'isStarting', false);
  //       },
  //       get isConfirming() {
  //         return gateProperty(target, 'isConfirming', false);
  //       },
  //       get externalClientSecret() {
  //         // @ts-expect-error
  //         return gateProperty(targetCheckout, 'externalClientSecret', null);
  //       },
  //       get externalGatewayId() {
  //         // @ts-expect-error
  //         return gateProperty(targetCheckout, 'externalGatewayId', null);
  //       },
  //       get paymentSource() {
  //         return gateProperty(targetCheckout, 'paymentSource', undefined);
  //       },
  //       get plan() {
  //         // @ts-expect-error
  //         return gateProperty(targetCheckout, 'plan', null);
  //       },
  //       get planPeriod() {
  //         // @ts-expect-error
  //         return gateProperty(targetCheckout, 'planPeriod', null);
  //       },

  //       start: gateMethod(targetMethods, 'start'),
  //       confirm: gateMethod(targetMethods, 'confirm'),
  //       clear: gateMethod(targetMethods, 'clear'),
  //       finalize: gateMethod(targetMethods, 'finalize'),
  //     },
  //   };
  // }

  private buildCheckoutProxy(params: CheckoutSignalProps): __experimental_CheckoutInstance {
    const gateAsyncMethod = this.gateMethod.bind(this);
    const gateListenerMethod = this.gateListenerMethod.bind(this);
    const target = () => this.checkout(params);
    const gateSyncMethod = this.gateSyncMethod.bind(this);

    return {
      confirm: gateAsyncMethod(target, 'confirm'),
      start: gateAsyncMethod(target, 'start'),
      clear: gateAsyncMethod(target, 'clear'),
      finalize: gateAsyncMethod(target, 'finalize'),
      subscribe: gateListenerMethod(target, 'subscribe'),
      getState: gateSyncMethod(target, 'getState', {
        isStarting: false,
        isConfirming: false,
        error: null,
        checkout: null,
        fetchStatus: 'idle',
        status: 'needs_initialization',
      }),
    };
  }

  private buildCheckoutProxyV2(params: CheckoutSignalProps): NullableCheckoutSignal {
    const gateProperty = this.gateProperty.bind(this);
    const targetCheckout = () => this.checkoutV2(params);

    console.log('targetCheckout', targetCheckout());
    const target = () => targetCheckout().checkout as CheckoutFutureResource;

    return {
      errors: {
        raw: null,
        global: null,
      },
      fetchStatus: 'idle' as const,
      // @ts-expect-error - CheckoutFutureResource is not yet defined
      checkout: {
        get status() {
          return gateProperty(target, 'status', 'needs_initialization');
        },
        get externalClientSecret() {
          return gateProperty(target, 'externalClientSecret', null);
        },
        get externalGatewayId() {
          return gateProperty(target, 'externalGatewayId', null);
        },
        get paymentSource() {
          return gateProperty(target, 'paymentSource', undefined);
        },
        get plan() {
          return gateProperty(target, 'plan', null);
        },
        get planPeriod() {
          return gateProperty(target, 'planPeriod', null);
        },
        get totals() {
          return gateProperty(target, 'totals', null);
        },
        get isImmediatePlanChange() {
          return gateProperty(target, 'isImmediatePlanChange', false);
        },
        get freeTrialEndsAt() {
          return gateProperty(target, 'freeTrialEndsAt', null);
        },
        get payer() {
          return gateProperty(target, 'payer', null);
        },

        start: this.gateMethod<ReturnType<typeof target>, 'start'>(target, 'start'),
        confirm: this.gateMethod<ReturnType<typeof target>, 'confirm'>(target, 'confirm'),
      },
    };
  }

  __internal_effect(_: () => void): () => void {
    throw new Error('__internal_effect called before Clerk is loaded');
  }
  __internal_computed<T>(_: (prev?: T) => T): () => T {
    throw new Error('__internal_computed called before Clerk is loaded');
  }

  private get client() {
    const c = this.isomorphicClerk.client;
    if (!c) {
      throw new Error('Clerk client not ready');
    }
    return c;
  }

  private get checkout(): Clerk['__experimental_checkout'] {
    const c = this.isomorphicClerk.__experimental_checkout as Clerk['__experimental_checkout'];
    if (!c) throw new Error('Clerk checkout not ready');
    return c;
  }

  private get checkoutV2(): Clerk['__experimental_checkoutV2'] {
    const c = this.isomorphicClerk.__experimental_checkoutV2 as Clerk['__experimental_checkoutV2'];
    if (!c) throw new Error('Clerk checkout not ready');
    return c;
  }

  private gateProperty<T extends object, K extends keyof T>(getTarget: () => T, key: K, defaultValue: T[K]) {
    return (() => {
      if (!inBrowser() || !this.isomorphicClerk.loaded) {
        return defaultValue;
      }
      const t = getTarget();
      return t[key];
    })();
  }

  private gateMethod<T extends object, K extends keyof T & string>(getTarget: () => T, key: K) {
    type F = Extract<T[K], (...args: unknown[]) => unknown>;
    return (async (...args: Parameters<F>): Promise<ReturnType<F>> => {
      if (!inBrowser()) {
        return errorThrower.throw(`Attempted to call a method (${key}) that is not supported on the server.`);
      }
      if (!this.isomorphicClerk.loaded) {
        await new Promise<void>(resolve => this.isomorphicClerk.addOnLoaded(resolve));
      }
      const t = getTarget();
      return (t[key] as (...args: Parameters<F>) => ReturnType<F>).apply(t, args);
    }) as F;
  }

  private gateListenerMethod<T extends object, K extends keyof T>(
    getTarget: () => T,
    key: T[K] extends (...args: any[]) => void ? K : never,
  ): T[K] {
    // This method should only be used with keys that point to void-returning functions
    type F = Extract<T[K], (...args: any[]) => void>;
    return ((...args: Parameters<F>) => {
      const resolve = () => {
        const t = getTarget();
        return (t[key] as F)(...args);
      };

      if (!this.isomorphicClerk.loaded) {
        this.isomorphicClerk.addOnLoaded(resolve);
        return;
      }

      resolve();
    }) as T[K];
  }

  private gateSyncMethod<
    T extends object,
    K extends keyof T & string,
    Fun extends Extract<T[K], (...args: unknown[]) => unknown>,
  >(getTarget: () => T, key: K, defaultValue: ReturnType<Fun>) {
    return ((...args: Parameters<Fun>): ReturnType<Fun> => {
      if (!this.isomorphicClerk.loaded) {
        return defaultValue;
      }
      const t = getTarget();
      return (t[key] as (...args: Parameters<Fun>) => ReturnType<Fun>).apply(t, args);
    }) as Fun;
  }

  private wrapMethods<T extends object, K extends readonly (keyof T & string)[]>(
    getTarget: () => T,
    keys: K,
  ): Pick<T, K[number]> {
    return Object.fromEntries(keys.map(k => [k, this.gateMethod(getTarget, k)])) as Pick<T, K[number]>;
  }
}
