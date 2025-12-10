'use client';

import { OrganizationSwitcher, useAuth, useOrganizationList } from '@clerk/nextjs';
import { OrganizationMembershipResource, SetActive } from '@clerk/shared/types';
import { Suspense, useState, useTransition } from 'react';

// Quick and dirty promise cache to enable Suspense "fetching"
const cachedPromises = new Map<string, Promise<unknown>>();
const getCachedPromise = (key: string, value: string | undefined | null, delay: number = 1000) => {
  if (cachedPromises.has(`${key}-${value}-${delay}`)) {
    return cachedPromises.get(`${key}-${value}-${delay}`)!;
  }
  const promise = new Promise(resolve => {
    setTimeout(() => {
      const returnValue = `Fetched value: ${value}`;
      (promise as any).status = 'fulfilled';
      (promise as any).value = returnValue;
      resolve(returnValue);
    }, delay);
  });
  cachedPromises.set(`${key}-${value}-${delay}`, promise);
  return promise;
};

export default function TransitionsPage() {
  return (
    <div style={{ margin: '40px' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: '60px',
          alignItems: 'center',
        }}
      >
        <TransitionController />
        <TransitionSwitcher />
        <div>
          <div style={{ backgroundColor: 'white' }}>
            <OrganizationSwitcher fallback={<div>Loading...</div>} />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <AuthStatePresenter />
        <Suspense fallback={<div data-testid='fetcher-fallback'>Loading...</div>}>
          <Fetcher />
        </Suspense>
      </div>
    </div>
  );
}

// This is a hack to be able to control the start and stop of a transition by using a promise
function TransitionController() {
  const [transitionPromise, setTransitionPromise] = useState<Promise<unknown> | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <div>
      <button
        onClick={() => {
          if (pending) {
            (transitionPromise as any).resolve();
            setTransitionPromise(null);
          } else {
            let resolve;
            const promise = new Promise(r => {
              resolve = r;
            });
            // We save the resolve on the promise itself so we can later resolve it manually
            (promise as any).resolve = resolve;
            setTransitionPromise(promise);

            // Async transition functions were introduced in React 19, but test outcome is the same regardless
            // @ts-expect-error
            startTransition(async () => {
              await promise;
            });
          }
        }}
      >
        {pending ? 'Finish transition' : 'Start transition'}
      </button>
    </div>
  );
}

function TransitionSwitcher() {
  const { isLoaded, userMemberships, setActive } = useOrganizationList({ userMemberships: true });

  if (!isLoaded || !userMemberships.data) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
      {userMemberships.data.map(membership => (
        <TransitionSwitcherButton
          key={membership.organization.id}
          membership={membership}
          setActive={setActive}
        />
      ))}
    </div>
  );
}

function TransitionSwitcherButton({
  membership,
  setActive,
}: {
  membership: OrganizationMembershipResource;
  setActive: SetActive;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => {
        // Async transition functions were introduced in React 19, but test outcome is the same regardless
        // @ts-expect-error
        startTransition(async () => {
          // Note that this does not currently work, as setActive does not support transitions,
          // we are using it to verify the existing behavior.
          await setActive({ organization: membership.organization.id });
        });
      }}
    >
      {pending ? 'Switching...' : `Switch to ${membership.organization.name} in transition`}
    </button>
  );
}

function AuthStatePresenter() {
  const { orgId, sessionId, userId } = useAuth();

  return (
    <div>
      <h1>Auth state</h1>
      <div>
        SessionId: <span data-testid='session-id'>{String(sessionId)}</span>
      </div>
      <div>
        UserId: <span data-testid='user-id'>{String(userId)}</span>
      </div>
      <div>
        OrgId: <span data-testid='org-id'>{String(orgId)}</span>
      </div>
    </div>
  );
}

function Fetcher() {
  const { orgId } = useAuth();

  if (!orgId) {
    return null;
  }

  const promise = getCachedPromise('fetcher', orgId, 1000);
  if (promise && (promise as any).status !== 'fulfilled') {
    throw promise;
  }

  return (
    <div>
      <h1>Fetcher</h1>
      <div data-testid='fetcher-result'>{(promise as any).value}</div>
    </div>
  );
}
