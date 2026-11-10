import type { SignInStep } from './sign-in.types';

export function stepKey(step: SignInStep): string {
  switch (step.kind) {
    case 'identifier':
    case 'sign-up':
      return step.kind;
    case 'secret':
      return `secret:${step.secret}`;
    case 'new-password':
      return `new-password:${step.reason}`;
    case 'code':
    case 'choice':
    case 'notice':
      return `${step.kind}:${step.purpose}`;
  }
}
