import type { SignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import { describe, expect, it } from 'vitest';

import type { SignUpFlowStep, SignUpRoute } from '../sign-up.routes';
import { detailsRouteFor, routeFor, shownRoute } from '../sign-up.routes';

const verifyEmail: SignUpNextStep = { type: 'verify_email', target: 'ada@example.com', sent: true };
const verifyPhone: SignUpNextStep = { type: 'verify_phone', target: '+15555550142', sent: true };
const fields: SignUpNextStep = { type: 'fields', fields: ['username'] };
const task: SignUpFlowStep = { type: 'task', key: 'choose-organization' };

describe('sign-up shown route', () => {
  it.each<[string, SignUpRoute, SignUpFlowStep, SignUpRoute | undefined]>([
    ['stays on the step route', 'verifyEmail', verifyEmail, 'verifyEmail'],
    ['lets the user edit fields while the email verifies', 'continue', verifyEmail, 'continue'],
    ['lets the user edit fields while the phone verifies', 'continue', verifyPhone, 'continue'],
    ['moves a deep link ahead of the attempt to the step route', 'verifyEmail', fields, 'continue'],
    ['moves a route the attempt has not reached back to start', 'protectCheck', { type: 'start' }, 'start'],
    ['moves a verify route to the other verify route', 'verifyPhone', verifyEmail, 'verifyEmail'],
    [
      'stays under continue when the email verifies from there',
      'continueVerifyEmail',
      verifyEmail,
      'continueVerifyEmail',
    ],
    [
      'keeps the phone under continue after the email verifies there',
      'continueVerifyEmail',
      verifyPhone,
      'continueVerifyPhone',
    ],
    ['returns to continue for fields missing after a verify under it', 'continueVerifyPhone', fields, 'continue'],
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
    ['sends a session task to its route', 'verifyEmail', task, 'taskChooseOrganization'],
    ['moves the form to the task while one is pending', 'start', task, 'taskChooseOrganization'],
    [
      'keeps the task screen while the flow leaves',
      'taskChooseOrganization',
      { type: 'leaving' },
      'taskChooseOrganization',
    ],
    ['moves a task route back to start once signed out', 'taskChooseOrganization', { type: 'start' }, 'start'],
  ])('%s', (_, route, step, expected) => {
    expect(shownRoute(route, step)).toBe(expected);
  });
});

describe('sign-up route after a submit', () => {
  it.each<[string, SignUpRoute, SignUpNextStep, SignUpRoute]>([
    ['verifies at the base after start', 'start', verifyEmail, 'verifyEmail'],
    ['verifies under continue after continue', 'continue', verifyEmail, 'continueVerifyEmail'],
    ['verifies the phone under continue after continue', 'continue', verifyPhone, 'continueVerifyPhone'],
  ])('%s', (_, from, step, expected) => {
    expect(routeFor(step, from)).toBe(expected);
  });
});

describe('sign-up details route', () => {
  it.each<[SignUpRoute, 'start' | 'continue']>([
    ['verifyEmail', 'start'],
    ['verifyPhone', 'start'],
    ['continueVerifyEmail', 'continue'],
    ['continueVerifyPhone', 'continue'],
  ])('goes back from %s to %s', (route, expected) => {
    expect(detailsRouteFor(route)).toBe(expected);
  });
});
