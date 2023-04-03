import type { InstanceType } from './clerk';

export type PublishableKey = {
  frontendApi: string;
  instanceType: InstanceType;
};

export type PublishableKeyOrFrontendApi =
  | {
      frontendApi?: never;
      publishableKey: string;
    }
  | {
      frontendApi: string;
      publishableKey?: never;
    };

export type SecretKeyOrApiKey =
  | {
      secretKey?: never;
      apiKey: string;
    }
  | {
      secretKey: string;
      apiKey?: never;
    };
