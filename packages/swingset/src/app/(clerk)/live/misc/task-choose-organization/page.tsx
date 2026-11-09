'use client';

import { TaskChooseOrganization } from '@clerk/mosaic/features/task-choose-organization/task-choose-organization';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useSession } from '@clerk/nextjs';
import Link from 'next/link';

import { LivePageHeader } from '../../../live-page-header';

export default function TaskChooseOrganizationLivePage() {
  const { isLoaded, session } = useSession();
  const hasTask = session?.currentTask?.key === 'choose-organization';

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='Task: choose organization'>
          Resolves the real choose-organization session task: selecting or creating an organization makes it active and
          goes on to the next task or back to the live overview. It needs a session with the task pending, which an
          application that requires an organization gives every user without one.
        </LivePageHeader>
        {isLoaded && !session ? (
          <p className='text-muted-foreground text-sm'>
            <Link
              href='/sign-in'
              className='text-foreground underline underline-offset-4'
            >
              Sign in
            </Link>{' '}
            to use the live harness.
          </p>
        ) : null}
        {isLoaded && session && !hasTask ? (
          <p className='text-muted-foreground text-sm'>This session has no choose-organization task to resolve.</p>
        ) : null}
        {hasTask ? (
          <TaskChooseOrganization
            redirectUrlComplete='/live'
            fallback={<p className='text-muted-foreground text-sm'>Loading…</p>}
          />
        ) : null}
      </div>
    </MosaicProvider>
  );
}
