import type { SignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';

import type { RouteName } from '../../routing/routes';

export type SignUpTaskKey = 'choose-organization';

export type SignUpFlowStep = SignUpNextStep | { type: 'task'; key: SignUpTaskKey } | { type: 'leaving' };

export const signUpRoutes = {
  start: '',
  continue: 'continue',
  verifyEmail: 'verify-email-address',
  verifyPhone: 'verify-phone-number',
  continueVerifyEmail: 'continue/verify-email-address',
  continueVerifyPhone: 'continue/verify-phone-number',
  enterpriseConnections: 'enterprise-connections',
  protectCheck: 'protect-check',
  taskChooseOrganization: 'tasks/choose-organization',
} as const;

export type SignUpRoute = RouteName<typeof signUpRoutes>;

export function detailsRouteFor(route: SignUpRoute): 'start' | 'continue' {
  return route === 'continue' || route === 'continueVerifyEmail' || route === 'continueVerifyPhone'
    ? 'continue'
    : 'start';
}

export function routeFor(step: SignUpFlowStep, from: SignUpRoute): SignUpRoute | undefined {
  const underContinue = detailsRouteFor(from) === 'continue';
  switch (step.type) {
    case 'start':
      return 'start';
    case 'fields':
      return 'continue';
    case 'verify_email':
      return underContinue ? 'continueVerifyEmail' : 'verifyEmail';
    case 'verify_phone':
      return underContinue ? 'continueVerifyPhone' : 'verifyPhone';
    case 'enterprise_sso':
      return 'enterpriseConnections';
    case 'protect':
      return 'protectCheck';
    case 'task':
      return 'taskChooseOrganization';
    case 'transfer':
    case 'complete':
    case 'leaving':
    case 'unknown':
      return undefined;
  }
}

export function allowedRoute(route: SignUpRoute, step: SignUpFlowStep): boolean {
  if (step.type === 'task') {
    return route === routeFor(step, route);
  }
  if (route === 'start' || step.type === 'complete' || step.type === 'transfer' || step.type === 'leaving') {
    return true;
  }
  if (route === 'continue' && (step.type === 'verify_email' || step.type === 'verify_phone')) {
    return true;
  }
  return route === routeFor(step, route);
}
