import type { InstanceType } from './instance';

export type PublishableKey = {
  frontendApi: string;
  instanceType: InstanceType;
};

export type EphemeralAccount = {
  publishableKey: string;
  secretKey: string;
  expiresAt: number;
};
