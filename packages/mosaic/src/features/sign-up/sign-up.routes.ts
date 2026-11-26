import type { SignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';

import type { RouteName } from '../../routing/routes';
import type { AuthFlowOutcome } from '../auth-flow/auth-flow.types';

export type SignUpTaskKey = 'choose-organization';

export const signUpRoutes = {
  start: '',
  continue: 'continue',
  verifyEmail: 'verify-email-address',
  verifyPhone: 'verify-phone-number',
  continueVerifyEmail: 'continue/verify-email-address',
  continueVerifyPhone: 'continue/verify-phone-number',
  enterpriseConnections: 'enterprise-connections',
  protectCheck: 'protect-check',
  continueProtectCheck: 'continue/protect-check',
  taskChooseOrganization: 'tasks/choose-organization',
} as const;

export type SignUpRoute = RouteName<typeof signUpRoutes>;

export function detailsRouteFor(route: SignUpRoute): 'start' | 'continue' {
  return route === 'continue' ||
    route === 'continueVerifyEmail' ||
    route === 'continueVerifyPhone' ||
    route === 'continueProtectCheck'
    ? 'continue'
    : 'start';
}

export function routeFor(step: SignUpNextStep, from: SignUpRoute): SignUpRoute | undefined {
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
      return underContinue ? 'continueProtectCheck' : 'protectCheck';
    case 'transfer':
    case 'complete':
    case 'unknown':
      return undefined;
  }
}

function allowedRoute(route: SignUpRoute, step: SignUpNextStep): boolean {
  if (route === 'start' || step.type === 'complete' || step.type === 'transfer') {
    return true;
  }
  if (
    route === 'continue' &&
    (step.type === 'verify_email' || step.type === 'verify_phone' || step.type === 'enterprise_sso')
  ) {
    return true;
  }
  return route === routeFor(step, route);
}

function stepRoute(route: SignUpRoute, step: SignUpNextStep): SignUpRoute | undefined {
  if (step.type === 'unknown') {
    return undefined;
  }
  return allowedRoute(route, step) ? route : routeFor(step, route);
}

export function shownRoute(
  route: SignUpRoute,
  outcome: AuthFlowOutcome<SignUpTaskKey>,
  step: SignUpNextStep,
): SignUpRoute | undefined {
  switch (outcome.type) {
    case 'resource':
      return stepRoute(route, step);
    case 'task':
      return 'taskChooseOrganization';
    case 'hold':
    case 'leave':
    case 'done':
      return route;
  }
}
