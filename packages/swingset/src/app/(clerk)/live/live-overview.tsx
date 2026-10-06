'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import type { EnvironmentResource } from '@clerk/shared/types';
import { ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';

export function LiveOverview({
  frontendApi,
  instanceType,
  hasSecretKey,
  dashboardUrl,
  deployment,
}: {
  frontendApi: string | null;
  instanceType: string | null;
  hasSecretKey: boolean;
  dashboardUrl: string | null;
  deployment: { label: string; dashboardUrl: string | null } | null;
}) {
  const clerk = useClerk();
  const { isLoaded, isSignedIn, user } = useUser();
  // The environment resource isn't part of the public Clerk interface; reach through the internal getter.
  const environment = (clerk as unknown as { __internal_environment?: EnvironmentResource | null })
    .__internal_environment;
  const applicationName = environment?.displayConfig.applicationName;

  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-xl font-semibold'>Live Sandbox</h1>
        <p className='text-muted-foreground text-sm'>
          Flows in this sandbox run against the real Clerk application configured in{' '}
          <code className='font-mono text-xs'>packages/swingset/.env.local</code>.
        </p>
      </div>

      <section className='flex flex-col gap-2'>
        <h2 className='text-sm font-medium'>Application</h2>
        <dl className='grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1.5 text-sm'>
          <dt className='text-muted-foreground'>Name</dt>
          <dd>
            {!isLoaded ? (
              'Loading…'
            ) : dashboardUrl ? (
              <a
                href={dashboardUrl}
                target='_blank'
                rel='noreferrer'
                className='text-foreground underline underline-offset-4'
              >
                {applicationName ?? 'Unknown'}
                <ExternalLinkIcon className='ml-1 inline size-3 align-[-1px]' />
              </a>
            ) : (
              (applicationName ?? 'Unknown')
            )}
          </dd>
          <dt className='text-muted-foreground'>Frontend API</dt>
          <dd className='font-mono text-xs leading-5'>{frontendApi ?? '—'}</dd>
          <dt className='text-muted-foreground'>Instance</dt>
          <dd>{instanceType ?? '—'}</dd>
          <dt className='text-muted-foreground'>Deployment</dt>
          <dd>
            {!deployment ? (
              '—'
            ) : deployment.dashboardUrl ? (
              <>
                {deployment.label} —{' '}
                <a
                  href={deployment.dashboardUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='text-foreground underline underline-offset-4'
                >
                  {deployment.dashboardUrl.replace('https://', '')}
                </a>
              </>
            ) : (
              deployment.label
            )}
          </dd>
          <dt className='text-muted-foreground'>Secret key</dt>
          <dd>{hasSecretKey ? 'Set' : 'Not set (optional — needed for SSO and OAuth redirects)'}</dd>
        </dl>
      </section>

      <section className='flex flex-col gap-2'>
        <h2 className='text-sm font-medium'>Session</h2>
        {!isLoaded ? (
          <p className='text-muted-foreground text-sm'>Loading…</p>
        ) : isSignedIn ? (
          <p className='text-muted-foreground text-sm'>
            Signed in as {user.primaryEmailAddress?.emailAddress ?? user.id}. Pick a flow from the sidebar.
          </p>
        ) : (
          <p className='text-muted-foreground text-sm'>
            You are signed out.{' '}
            <Link
              href='/sign-in'
              className='text-foreground underline underline-offset-4'
            >
              Sign in
            </Link>{' '}
            to run the flows.
          </p>
        )}
      </section>
    </div>
  );
}
