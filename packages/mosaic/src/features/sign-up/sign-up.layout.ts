import type { SignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';

import type { RouteName } from '../../routing/routes';

export const signUpRoutes = {
  start: '',
  continue: 'continue',
  verifyEmail: 'verify-email-address',
  verifyPhone: 'verify-phone-number',
  enterpriseConnections: 'enterprise-connections',
  protectCheck: 'protect-check',
} as const;

export type SignUpRoute = RouteName<typeof signUpRoutes>;

export function routeFor(step: SignUpNextStep): SignUpRoute | undefined {
  switch (step.type) {
    case 'start':
      return 'start';
    case 'fields':
      return 'continue';
    case 'verify_email':
      return 'verifyEmail';
    case 'verify_phone':
      return 'verifyPhone';
    case 'enterprise_sso':
      return 'enterpriseConnections';
    case 'protect':
      return 'protectCheck';
    case 'transfer':
    case 'complete':
    case 'unknown':
      return undefined;
  }
}

export function allowedRoute(route: SignUpRoute, step: SignUpNextStep): boolean {
  if (route === 'start' || step.type === 'complete' || step.type === 'transfer') {
    return true;
  }
  if (route === 'continue' && (step.type === 'verify_email' || step.type === 'verify_phone')) {
    return true;
  }
  return route === routeFor(step);
}
