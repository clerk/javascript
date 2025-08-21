import type { Errors, State } from '@clerk/types';

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
  raw: [],
  global: [],
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
    const target = () => this.client.signIn.__internal_future;

    return {
      errors: defaultErrors(),
      fetchStatus: 'idle' as const,
      signIn: {
        status: 'needs_identifier' as const,
        availableStrategies: [],

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
      },
    };
  }

  private buildSignUpProxy() {
    const target = () => this.client.signUp.__internal_future;

    return {
      errors: defaultErrors(),
      fetchStatus: 'idle' as const,
      signUp: {
        status: 'missing_requirements' as const,
        unverifiedFields: [],

        password: this.gateMethod(target, 'password'),
        finalize: this.gateMethod(target, 'finalize'),

        verifications: this.wrapMethods(() => target().verifications, ['sendEmailCode', 'verifyEmailCode'] as const),
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
    if (!c) throw new Error('Clerk client not ready');
    return c;
  }

  private gateMethod<T extends object, K extends keyof T & string>(getTarget: () => T, key: K) {
    type F = Extract<T[K], (...args: unknown[]) => unknown>;
    return (async (...args: Parameters<F>): Promise<ReturnType<F>> => {
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
}
