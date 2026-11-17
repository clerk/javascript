'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { LivePageHeader } from '../../../../live-page-header';

function CallbackParams() {
  const entries = [...useSearchParams().entries()];
  if (entries.length === 0) {
    return <p className='text-muted-foreground text-sm'>Clerk redirected here without any parameters.</p>;
  }
  return (
    <dl className='grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm'>
      {entries.map(([name, value]) => (
        <div
          key={name}
          className='contents'
        >
          <dt className='font-medium'>{name}</dt>
          <dd className='break-all font-mono text-xs'>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function OAuthConsentCallbackPage() {
  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
      <LivePageHeader title='OAuthConsent callback'>
        What Clerk sent to the redirect URI after the consent screen. Approving returns a <code>code</code>; denying
        returns an <code>error</code>.
      </LivePageHeader>
      <Suspense>
        <CallbackParams />
      </Suspense>
      <Link
        href='/live/misc/o-auth-consent'
        className='text-sm underline underline-offset-4'
      >
        Back to consent
      </Link>
    </div>
  );
}
