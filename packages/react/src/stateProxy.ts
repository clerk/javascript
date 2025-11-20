import { inBrowser } from '@clerk/shared/browser';
import type {
  BillingSubscriptionPlanPeriod,
  CheckoutSignalValue,
  Clerk,
  ForPayerType,
  SignInErrors,
  SignUpErrors,
  State,
  WaitlistErrors,
  WaitlistResource,
} from '@clerk/shared/types';

import { errorThrower } from './errors/errorThrower';
import type { IsomorphicClerk } from './isomorphicClerk';

const defaultSignInErrors = (): SignInErrors => ({
  fields: {
    identifier: null,
    password: null,
    code: null,
  },
  raw: null,
  global: null,
});

const defaultSignUpErrors = (): SignUpErrors => ({
  fields: {
    firstName: null,
    lastName: null,
    emailAddress: null,
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

const defaultWaitlistErrors = (): WaitlistErrors => ({
  fields: {
    emailAddress: null,
  },
  raw: null,
  global: null,
});

type CheckoutSignalProps = {
  for?: ForPayerType;
  planPeriod: BillingSubscriptionPlanPeriod;
  planId: string;
};

export class StateProxy implements State {
  constructor(private isomorphicClerk: IsomorphicClerk) {}

  private readonly signInSignalProxy = this.buildSignInProxy();
  private readonly signUpSignalProxy = this.buildSignUpProxy();
  private readonly waitlistSignalProxy = this.buildWaitlistProxy();

  signInSignal() {
    return this.signInSignalProxy;
  }
  signUpSignal() {
    return this.signUpSignalProxy;
  }
  waitlistSignal() {
    return this.waitlistSignalProxy;
  }

  get __internal_waitlist() {
    return this.state.__internal_waitlist;
  }

  checkoutSignal(params: CheckoutSignalProps) {
    return this.buildCheckoutProxy(params);
  }

  private buildSignInProxy() {
    const gateProperty = this.gateProperty.bind(this);
    const target = () => this.client.signIn.__internal_future;

    return {
      errors: defaultSignInErrors(),
      fetchStatus: 'idle' as const,
      signIn: {
        status: 'needs_identifier' as const,
        availableStrategies: [],
        isTransferable: false,
        get id() {
          return gateProperty(target, 'id', undefined);
        },
        get supportedFirstFactors() {
          return gateProperty(target, 'supportedFirstFactors', []);
        },
        get supportedSecondFactors() {
          return gateProperty(target, 'supportedSecondFactors', []);
        },
        get secondFactorVerification() {
          return gateProperty(target, 'secondFactorVerification', {
            status: null,
            error: null,
            expireAt: null,
            externalVerificationRedirectURL: null,
            nonce: null,
            attempts: null,
            message: null,
            strategy: null,
            verifiedAtClient: null,
            verifiedFromTheSameClient: () => false,
            __internal_toSnapshot: () => {
              throw new Error('__internal_toSnapshot called before Clerk is loaded');
            },
            pathRoot: '',
            reload: () => {
              throw new Error('__internal_toSnapshot called before Clerk is loaded');
            },
          });
        },
        get identifier() {
          return gateProperty(target, 'identifier', null);
        },
        get createdSessionId() {
          return gateProperty(target, 'createdSessionId', null);
        },
        get userData() {
          return gateProperty(target, 'userData', {});
        },
        get firstFactorVerification() {
          return gateProperty(target, 'firstFactorVerification', {
            status: null,
            error: null,
            expireAt: null,
            externalVerificationRedirectURL: null,
            nonce: null,
            attempts: null,
            message: null,
            strategy: null,
            verifiedAtClient: null,
            verifiedFromTheSameClient: () => false,
            __internal_toSnapshot: () => {
              throw new Error('__internal_toSnapshot called before Clerk is loaded');
            },
            pathRoot: '',
            reload: () => {
              throw new Error('__internal_toSnapshot called before Clerk is loaded');
            },
          });
        },
        get hasBeenFinalized() {
          return gateProperty(target, 'hasBeenFinalized', false);
        },

        create: this.gateMethod(target, 'create'),
        password: this.gateMethod(target, 'password'),
        sso: this.gateMethod(target, 'sso'),
        finalize: this.gateMethod(target, 'finalize'),

        emailCode: this.wrapMethods(() => target().emailCode, ['sendCode', 'verifyCode'] as const),
        emailLink: this.wrapStruct(
          () => target().emailLink,
          ['sendLink', 'waitForVerification'] as const,
          ['verification'] as const,
          { verification: null },
        ),
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
        ticket: this.gateMethod(target, 'ticket'),
        passkey: this.gateMethod(target, 'passkey'),
        web3: this.gateMethod(target, 'web3'),
      },
    };
  }

  private buildSignUpProxy() {
    const gateProperty = this.gateProperty.bind(this);
    const gateMethod = this.gateMethod.bind(this);
    const wrapMethods = this.wrapMethods.bind(this);
    const target = () => this.client.signUp.__internal_future;

    return {
      errors: defaultSignUpErrors(),
      fetchStatus: 'idle' as const,
      signUp: {
        get id() {
          return gateProperty(target, 'id', undefined);
        },
        get requiredFields() {
          return gateProperty(target, 'requiredFields', []);
        },
        get optionalFields() {
          return gateProperty(target, 'optionalFields', []);
        },
        get missingFields() {
          return gateProperty(target, 'missingFields', []);
        },
        get username() {
          return gateProperty(target, 'username', null);
        },
        get firstName() {
          return gateProperty(target, 'firstName', null);
        },
        get lastName() {
          return gateProperty(target, 'lastName', null);
        },
        get emailAddress() {
          return gateProperty(target, 'emailAddress', null);
        },
        get phoneNumber() {
          return gateProperty(target, 'phoneNumber', null);
        },
        get web3Wallet() {
          return gateProperty(target, 'web3Wallet', null);
        },
        get hasPassword() {
          return gateProperty(target, 'hasPassword', false);
        },
        get unsafeMetadata() {
          return gateProperty(target, 'unsafeMetadata', {});
        },
        get createdSessionId() {
          return gateProperty(target, 'createdSessionId', null);
        },
        get createdUserId() {
          return gateProperty(target, 'createdUserId', null);
        },
        get abandonAt() {
          return gateProperty(target, 'abandonAt', null);
        },
        get legalAcceptedAt() {
          return gateProperty(target, 'legalAcceptedAt', null);
        },
        get locale() {
          return gateProperty(target, 'locale', null);
        },
        get status() {
          return gateProperty(target, 'status', 'missing_requirements');
        },
        get unverifiedFields() {
          return gateProperty(target, 'unverifiedFields', []);
        },
        get isTransferable() {
          return gateProperty(target, 'isTransferable', false);
        },
        get hasBeenFinalized() {
          return gateProperty(target, 'hasBeenFinalized', false);
        },

        create: gateMethod(target, 'create'),
        update: gateMethod(target, 'update'),
        sso: gateMethod(target, 'sso'),
        password: gateMethod(target, 'password'),
        ticket: gateMethod(target, 'ticket'),
        web3: gateMethod(target, 'web3'),
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

  private buildWaitlistProxy() {
    const gateProperty = this.gateProperty.bind(this);
    const gateMethod = this.gateMethod.bind(this);
    const target = (): WaitlistResource => {
      return this.state.__internal_waitlist;
    };

    return {
      errors: defaultWaitlistErrors(),
      fetchStatus: 'idle' as const,
      waitlist: {
        pathRoot: '/waitlist',
        get id() {
          return gateProperty(target, 'id', '');
        },
        get createdAt() {
          return gateProperty(target, 'createdAt', null);
        },
        get updatedAt() {
          return gateProperty(target, 'updatedAt', null);
        },

        join: gateMethod(target, 'join'),
        reload: gateMethod(target, 'reload'),
      },
    };
  }

  private buildCheckoutProxy(params: CheckoutSignalProps): CheckoutSignalValue {
    const gateProperty = this.gateProperty.bind(this);
    const targetCheckout = () => this.checkout(params);
    const target = () => targetCheckout().checkout;

    return {
      errors: {
        raw: null,
        global: null,
      },
      fetchStatus: 'idle' as const,
      checkout: {
        get status() {
          return gateProperty(target, 'status', 'needs_initialization') as 'needs_initialization';
        },
        get externalClientSecret() {
          return gateProperty(target, 'externalClientSecret', null) as null;
        },
        get externalGatewayId() {
          return gateProperty(target, 'externalGatewayId', null) as null;
        },
        get paymentMethod() {
          return gateProperty(target, 'paymentMethod', null) as null;
        },
        get plan() {
          return gateProperty(target, 'plan', null) as null;
        },
        get planPeriod() {
          return gateProperty(target, 'planPeriod', null) as null;
        },
        get totals() {
          return gateProperty(target, 'totals', null) as null;
        },
        get isImmediatePlanChange() {
          return gateProperty(target, 'isImmediatePlanChange', false) as null;
        },
        get freeTrialEndsAt() {
          return gateProperty(target, 'freeTrialEndsAt', null) as null;
        },
        get payer() {
          return gateProperty(target, 'payer', null) as null;
        },
        get planPeriodStart() {
          return gateProperty(target, 'planPeriodStart', null) as null;
        },
        get needsPaymentMethod() {
          return gateProperty(target, 'needsPaymentMethod', null) as null;
        },

        start: this.gateMethod<ReturnType<typeof target>, 'start'>(target, 'start'),
        confirm: this.gateMethod<ReturnType<typeof target>, 'confirm'>(target, 'confirm'),
        finalize: this.gateMethod<ReturnType<typeof target>, 'finalize'>(target, 'finalize'),
      },
    };
  }

  __internal_effect(_: () => void): () => void {
    throw new Error('__internal_effect called before Clerk is loaded');
  }
  __internal_computed<T>(_: (prev?: T) => T): () => T {
    throw new Error('__internal_computed called before Clerk is loaded');
  }

  private get state() {
    const s = this.isomorphicClerk.__internal_state;
    if (!s) {
      throw new Error('Clerk state not ready');
    }
    return s;
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
    if (!c) {
      throw new Error('Clerk checkout not ready');
    }
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

  private wrapMethods<T extends object, K extends readonly (keyof T & string)[]>(
    getTarget: () => T,
    keys: K,
  ): Pick<T, K[number]> {
    return Object.fromEntries(keys.map(k => [k, this.gateMethod(getTarget, k)])) as Pick<T, K[number]>;
  }

  private wrapStruct<T extends object, M extends readonly (keyof T)[], G extends readonly (keyof T)[]>(
    getTarget: () => T,
    methods: M,
    getters: G,
    fallbacks: Pick<T, G[number]>,
  ): Pick<T, M[number] | G[number]> & {
    [K in M[number]]: T[K] extends (...args: any[]) => any ? T[K] : never;
  } & {
    [K in G[number]]: T[K] extends (...args: any[]) => any ? never : T[K];
  } {
    const out: any = {};
    for (const m of methods) {
      out[m] = this.gateMethod(getTarget, m as any);
    }
    for (const g of getters) {
      Object.defineProperty(out, g, {
        get: () => this.gateProperty(getTarget, g as any, (fallbacks as any)[g]),
        enumerable: true,
      });
    }
    return out;
  }
}
