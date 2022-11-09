import { type InstanceType } from '@clerk/types';

export function isTestInstance(instanceType: InstanceType) {
  return instanceType === 'test';
}

export function isLiveInstance(instanceType: InstanceType) {
  return instanceType === 'live';
}
