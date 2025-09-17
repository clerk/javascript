import { inBrowser } from '@clerk/shared/browser';
import type { Errors, State } from '@clerk/types';

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

  private buildSignInProxy() {
    const gateProperty = this.gateProperty.bind(this);
    const target = () => this.client.signIn.__internal_future;

    return {
      errors: defaultErrors(),
      fetchStatus: 'idle' as const,
      signIn: {
        status: 'needs_identifier' as const,
        availableStrategies: [],
        isTransferable: false,
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
