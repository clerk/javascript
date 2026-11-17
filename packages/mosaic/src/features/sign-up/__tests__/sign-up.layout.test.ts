import type { SignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import { describe, expect, it } from 'vitest';

import type { SignUpRoute } from '../sign-up.layout';
import { allowedRoute, routeFor } from '../sign-up.layout';

const verifyEmail: SignUpNextStep = { type: 'verify_email', target: 'ada@example.com', sent: true };
const verifyPhone: SignUpNextStep = { type: 'verify_phone', target: '+15555550142', sent: true };
const fields: SignUpNextStep = { type: 'fields', fields: ['username'] };

function screen(route: SignUpRoute, step: SignUpNextStep): SignUpRoute | undefined {
  return allowedRoute(route, step) ? route : routeFor(step);
}

describe('sign-up screen', () => {
  it.each<[string, SignUpRoute, SignUpNextStep, SignUpRoute | undefined]>([
    ['stays on the step route', 'verifyEmail', verifyEmail, 'verifyEmail'],
    ['lets the user edit fields while the email verifies', 'continue', verifyEmail, 'continue'],
    ['lets the user edit fields while the phone verifies', 'continue', verifyPhone, 'continue'],
    ['moves a deep link ahead of the attempt to the step route', 'verifyEmail', fields, 'continue'],
    ['moves a route the attempt has not reached back to start', 'protectCheck', { type: 'start' }, 'start'],
    ['moves a verify route to the other verify route', 'verifyPhone', verifyEmail, 'verifyEmail'],
    ['always allows start', 'start', verifyEmail, 'start'],
    [
      'keeps the screen while the sign-up completes',
      'verifyEmail',
      { type: 'complete', createdSessionId: 'sess_1' },
      'verifyEmail',
    ],
    ['keeps the screen while the sign-up transfers', 'continue', { type: 'transfer' }, 'continue'],
    ['sends protect to its route', 'continue', { type: 'protect' }, 'protectCheck'],
    ['keeps start while enterprise SSO is pending', 'start', { type: 'enterprise_sso' }, 'start'],
    ['sends enterprise SSO to its route', 'continue', { type: 'enterprise_sso' }, 'enterpriseConnections'],
    ['has no route for an unknown step', 'verifyEmail', { type: 'unknown' }, undefined],
  ])('%s', (_, route, step, expected) => {
    expect(screen(route, step)).toBe(expected);
  });
});
