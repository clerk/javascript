import type { Clerk, HandleOAuthCallbackParams } from '@clerk/shared/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HashRouter, PathRouter, Route, useRouter, VirtualRouter } from '../../../router';
import { buildCombinedFlowOAuthCallbackParams, buildSignInOAuthCallbackParams } from '../buildOAuthCallbackParams';

vi.mock('@clerk/shared/react', () => {
  return {
    useClerk: () => {
      return {
        navigate: () => Promise.resolve(),
      } as unknown as Clerk;
    },
  };
});

const rootParams = buildSignInOAuthCallbackParams({
  signUpUrl: '/sign-in#/create',
  signInUrl: '/sign-in',
  signUpContinueUrl: '/sign-in#/create/continue',
  signUpProtectCheckUrl: '/sign-in#/create/protect-check',
  isCombinedFlow: true,
} as any);

const createParams = buildCombinedFlowOAuthCallbackParams({
  signUpUrl: '/sign-in#/create',
  signInUrl: '/sign-in',
  secondFactorUrl: '/sign-in#/factor-two',
} as any);

const destinations = {
  signInProtectCheckUrl: 'protect-check',
  firstFactorUrl: 'factor-one',
  secondFactorUrl: 'factor-two',
  resetPasswordUrl: 'reset-password',
  continueSignUpUrl: 'create/continue',
  verifyEmailAddressUrl: 'create/verify-email-address',
  verifyPhoneNumberUrl: 'create/verify-phone-number',
  signUpProtectCheckUrl: 'create/protect-check',
} as const;

type Destination = keyof typeof destinations;

const starts: Array<[string, HandleOAuthCallbackParams]> = [
  ['create/sso-callback', createParams],
  ['sso-callback', rootParams],
  ['protect-check', rootParams],
];

const cases = starts.flatMap(([start, params]) =>
  (Object.keys(destinations) as Destination[])
    .filter(key => !(start === destinations[key]))
    .map(key => [start, key, destinations[key], params[key] as string] as const),
);

const Marker = ({ at }: { at: string }) => <p>{`at:${at}`}</p>;

const NavigateButton = ({ to }: { to: string }) => {
  const router = useRouter();
  return (
    <button
      type='button'
      onClick={() => void router.navigate(to)}
    >
      go
    </button>
  );
};

const SignInRoutes = ({ start, to }: { start: string; to: string }) => {
  const button = (at: string) => (start === at ? <NavigateButton to={to} /> : null);
  return (
    <>
      <Route path='factor-one'>
        <Marker at='factor-one' />
      </Route>
      <Route path='factor-two'>
        <Marker at='factor-two' />
      </Route>
      <Route path='reset-password'>
        <Marker at='reset-password' />
      </Route>
      <Route path='protect-check'>
        <Marker at='protect-check' />
        {button('protect-check')}
      </Route>
      <Route path='sso-callback'>{button('sso-callback')}</Route>
      <Route path='create'>
        <Route path='continue'>
          <Marker at='create/continue' />
        </Route>
        <Route path='verify-email-address'>
          <Marker at='create/verify-email-address' />
        </Route>
        <Route path='verify-phone-number'>
          <Marker at='create/verify-phone-number' />
        </Route>
        <Route path='protect-check'>
          <Marker at='create/protect-check' />
        </Route>
        <Route path='sso-callback'>{button('create/sso-callback')}</Route>
      </Route>
    </>
  );
};

const routers: Array<[string, (start: string, to: string) => React.ReactElement]> = [
  [
    'path routing mounted at the root',
    (start, to) => {
      window.history.replaceState({}, '', `/sign-in/${start}`);
      return (
        <PathRouter basePath='/sign-in'>
          <SignInRoutes
            start={start}
            to={to}
          />
        </PathRouter>
      );
    },
  ],
  [
    'path routing mounted at a nested path',
    (start, to) => {
      window.history.replaceState({}, '', `/auth/sign-in/${start}`);
      return (
        <PathRouter basePath='/auth/sign-in'>
          <SignInRoutes
            start={start}
            to={to}
          />
        </PathRouter>
      );
    },
  ],
  [
    'path routing reached with a trailing slash',
    (start, to) => {
      window.history.replaceState({}, '', `/sign-in/${start}/`);
      return (
        <PathRouter basePath='/sign-in'>
          <SignInRoutes
            start={start}
            to={to}
          />
        </PathRouter>
      );
    },
  ],
  [
    'hash routing',
    (start, to) => {
      window.history.replaceState({}, '', `/#/${start}`);
      return (
        <HashRouter>
          <SignInRoutes
            start={start}
            to={to}
          />
        </HashRouter>
      );
    },
  ],
  [
    'virtual routing',
    (start, to) => {
      window.history.replaceState({}, '', '/');
      return (
        <VirtualRouter startPath={`/sign-in/${start}`}>
          <Route path='sign-in'>
            <SignInRoutes
              start={start}
              to={to}
            />
          </Route>
        </VirtualRouter>
      );
    },
  ],
];

describe('combined-flow SSO callback and protect-check navigation', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  describe.each(routers)('with %s', (_, renderRouter) => {
    it.each(cases)('from %s, %s reaches the %s step', async (start, _key, destination, to) => {
      render(renderRouter(start, to));
      expect(screen.queryByText(`at:${destination}`)).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'go' }));

      expect(await screen.findByText(`at:${destination}`)).toBeInTheDocument();
    });
  });
});
