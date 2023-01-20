import { type InstanceType } from './clerk';

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
