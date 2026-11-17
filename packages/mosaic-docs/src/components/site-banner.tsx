import { site } from '@/lib/site';

export function SiteBanner() {
  return (
    <div className='border-border text-muted-foreground flex h-9 shrink-0 items-center justify-center border-b px-4 text-xs'>
      <p className='truncate'>
        Looking for Clerk’s docs? Head to{' '}
        <a
          href={site.clerkDocsUrl}
          target='_blank'
          rel='noreferrer'
          className='hover:text-foreground underline underline-offset-2 transition-colors'
        >
          clerk.com/docs
          <span className='sr-only'> (opens in a new tab)</span>
        </a>
      </p>
    </div>
  );
}
