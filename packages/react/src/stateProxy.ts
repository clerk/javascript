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

interface PropertyConfig<TTarget> {
  [key: string]: { key: keyof TTarget; defaultValue: any };
}

interface MethodConfig<TTarget> {
  [key: string]: keyof TTarget & string;
}

interface StructConfig<TTarget> {
  [key: string]: {
    getTarget: () => TTarget;
    methods: readonly (keyof TTarget & string)[];
    getters?: readonly (keyof TTarget)[];
    fallbacks?: Partial<TTarget>;
  };
}

interface ResourceProxyConfig<TTarget, TResourceName extends string> {
  resourceName: TResourceName;
  target: () => TTarget;
  resourceProperties?: PropertyConfig<TTarget>;
  resourceMethods?: MethodConfig<TTarget>;
  resourceStructs?: StructConfig<TTarget>;
  resourceDefaults?: Partial<TTarget>;
}

export class StateProxy implements State {
  constructor(private isomorphicClerk: IsomorphicClerk) {}

  private readonly signInSignalProxy = this.createResourceProxy({
    resourceName: 'signIn',
    target: () => this.client.signIn.__internal_future,
    resourceProperties: {
      id: { key: 'id', defaultValue: undefined },
      supportedFirstFactors: { key: 'supportedFirstFactors', defaultValue: [] },
      supportedSecondFactors: { key: 'supportedSecondFactors', defaultValue: [] },
      secondFactorVerification: {
        key: 'secondFactorVerification',
        defaultValue: {
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
        },
      },
      identifier: { key: 'identifier', defaultValue: null },
      createdSessionId: { key: 'createdSessionId', defaultValue: null },
      userData: { key: 'userData', defaultValue: {} },
      firstFactorVerification: {
        key: 'firstFactorVerification',
        defaultValue: {
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
        },
      },
    },
    resourceMethods: {
      create: 'create',
      password: 'password',
      sso: 'sso',
      finalize: 'finalize',
      ticket: 'ticket',
      passkey: 'passkey',
      web3: 'web3',
    },
    resourceStructs: {
      emailCode: {
        getTarget: () => this.client.signIn.__internal_future.emailCode,
        methods: ['sendCode', 'verifyCode'] as const,
      },
      emailLink: {
        getTarget: () => this.client.signIn.__internal_future.emailLink,
        methods: ['sendLink', 'waitForVerification'] as const,
        getters: ['verification'] as const,
        fallbacks: { verification: null },
      },
      resetPasswordEmailCode: {
        getTarget: () => this.client.signIn.__internal_future.resetPasswordEmailCode,
        methods: ['sendCode', 'verifyCode', 'submitPassword'] as const,
      },
      phoneCode: {
        getTarget: () => this.client.signIn.__internal_future.phoneCode,
        methods: ['sendCode', 'verifyCode'] as const,
      },
      mfa: {
        getTarget: () => this.client.signIn.__internal_future.mfa,
        methods: ['sendPhoneCode', 'verifyPhoneCode', 'verifyTOTP', 'verifyBackupCode'] as const,
      },
    },
    resourceDefaults: {
      status: 'needs_identifier',
      availableStrategies: [],
      isTransferable: false,
    },
  });

  private readonly signUpSignalProxy = this.createResourceProxy({
    resourceName: 'signUp',
    target: () => this.client.signUp.__internal_future,
    resourceProperties: {
      id: { key: 'id', defaultValue: undefined },
      requiredFields: { key: 'requiredFields', defaultValue: [] },
      optionalFields: { key: 'optionalFields', defaultValue: [] },
      missingFields: { key: 'missingFields', defaultValue: [] },
      username: { key: 'username', defaultValue: null },
      firstName: { key: 'firstName', defaultValue: null },
      lastName: { key: 'lastName', defaultValue: null },
      emailAddress: { key: 'emailAddress', defaultValue: null },
      phoneNumber: { key: 'phoneNumber', defaultValue: null },
      web3Wallet: { key: 'web3Wallet', defaultValue: null },
      hasPassword: { key: 'hasPassword', defaultValue: false },
      unsafeMetadata: { key: 'unsafeMetadata', defaultValue: {} },
      createdSessionId: { key: 'createdSessionId', defaultValue: null },
      createdUserId: { key: 'createdUserId', defaultValue: null },
      abandonAt: { key: 'abandonAt', defaultValue: null },
      legalAcceptedAt: { key: 'legalAcceptedAt', defaultValue: null },
      locale: { key: 'locale', defaultValue: null },
      status: { key: 'status', defaultValue: 'missing_requirements' },
      unverifiedFields: { key: 'unverifiedFields', defaultValue: [] },
      isTransferable: { key: 'isTransferable', defaultValue: false },
    },
    resourceMethods: {
      create: 'create',
      update: 'update',
      sso: 'sso',
      password: 'password',
      ticket: 'ticket',
      web3: 'web3',
      finalize: 'finalize',
    },
    resourceStructs: {
      verifications: {
        getTarget: () => this.client.signUp.__internal_future.verifications,
        methods: ['sendEmailCode', 'verifyEmailCode', 'sendPhoneCode', 'verifyPhoneCode'] as const,
      },
    },
  });

  private readonly waitlistSignalProxy = this.createResourceProxy({
    resourceName: 'waitlist',
    target: (): { id?: string; createdAt: Date | null; updatedAt: Date | null; join: (params: any) => Promise<any> } => {
      if (!inBrowser() || !this.isomorphicClerk.loaded) {
        return {
          id: undefined,
          createdAt: null,
          updatedAt: null,
          join: () => Promise.resolve({ error: null }),
        };
      }
      const state = this.isomorphicClerk.__internal_state;
      const waitlist = state.__internal_waitlist;
      if (waitlist && '__internal_future' in waitlist) {
        return (waitlist as { __internal_future: any }).__internal_future;
      }
      return {
        id: undefined,
        createdAt: null,
        updatedAt: null,
        join: () => Promise.resolve({ error: null }),
      };
    },
    resourceProperties: {
      id: { key: 'id', defaultValue: undefined },
      createdAt: { key: 'createdAt', defaultValue: null },
      updatedAt: { key: 'updatedAt', defaultValue: null },
    },
    resourceMethods: {
      join: 'join',
    },
  });

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
    if (!inBrowser() || !this.isomorphicClerk.loaded) {
      return null;
    }
    return this.isomorphicClerk.__internal_state.__internal_waitlist;
  }

  private createResourceProxy<TTarget, TResourceName extends string>(
    config: ResourceProxyConfig<TTarget, TResourceName>,
  ): {
    errors: Errors;
    fetchStatus: 'idle';
    [K in TResourceName]: any;
  } {
    const gateProperty = this.gateProperty.bind(this);
    const gateMethod = this.gateMethod.bind(this);
    const wrapMethods = this.wrapMethods.bind(this);
    const wrapStruct = this.wrapStruct.bind(this);
    const target = config.target;

    const resource: any = { ...config.resourceDefaults };

    if (config.resourceProperties) {
      for (const [propName, { key, defaultValue }] of Object.entries(config.resourceProperties)) {
        Object.defineProperty(resource, propName, {
          get: () => gateProperty(target, key as keyof TTarget, defaultValue),
          enumerable: true,
        });
      }
    }

    if (config.resourceMethods) {
      for (const [methodName, methodKey] of Object.entries(config.resourceMethods)) {
        resource[methodName] = gateMethod(target, methodKey);
      }
    }

    if (config.resourceStructs) {
      for (const [structName, structConfig] of Object.entries(config.resourceStructs)) {
        resource[structName] = wrapStruct(
          structConfig.getTarget,
          structConfig.methods,
          structConfig.getters || [],
          structConfig.fallbacks || {},
        );
      }
    }

    return {
      errors: defaultErrors(),
      fetchStatus: 'idle' as const,
      [config.resourceName]: resource,
    } as any;
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
