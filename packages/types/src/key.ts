import type { InstanceType } from './clerk';

export type PublishableKey = {
  frontendApi: string;
  instanceType: InstanceType;
};

export type PublishableKeyOrFrontendApi =
  | {
      /**
       * @deprecated Use `publishableKey` instead.
       */
      frontendApi?: never;
      publishableKey: string;
    }
  | {
      /**
       * @deprecated Use `publishableKey` instead.
       */
      frontendApi: string;
      publishableKey?: never;
    };

export type SecretKeyOrApiKey =
  | {
      secretKey?: never;
      /**
       * @deprecated Use `secretKey` instead.
       */
      apiKey: string;
    }
  | {
      secretKey: string;
      /**
       * @deprecated Use `secretKey` instead.
       */
      apiKey?: never;
    };
