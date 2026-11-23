import { site } from '@/lib/site';

export function SiteBanner() {
  return (
    <div className='border-border text-muted-foreground flex min-h-9 shrink-0 items-center justify-center border-b px-4 py-2 text-center text-xs'>
      <p>
        Looking for Clerk’s docs? Head to{' '}
        <a
          href={site.clerkDocsUrl}
          target='_blank'
          rel='noreferrer'
          className='hover:text-foreground rounded-sm underline underline-offset-2 transition-colors'
        >
          clerk.com/docs
          <span className='sr-only'> (opens in a new tab)</span>
        </a>
      </p>
    </div>
  );
}
