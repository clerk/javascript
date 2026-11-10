import type { SignInStep } from './sign-in.types';

export function stepKey(step: SignInStep): string {
  switch (step.kind) {
    case 'identifier':
    case 'sign-up':
      return step.kind;
    case 'credential':
      return `credential:${step.credential}`;
    case 'new-password':
      return `new-password:${step.reason}`;
    case 'code':
    case 'choice':
    case 'notice':
      return `${step.kind}:${step.purpose}`;
  }
}
