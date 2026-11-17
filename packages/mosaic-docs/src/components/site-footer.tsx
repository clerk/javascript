import { GitHubLink } from '@/components/github-link';
import { site } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className='border-border border-t px-4 md:px-6'>
      <div className='flex min-h-16 flex-wrap items-center gap-x-6 gap-y-3 py-3 md:grid md:grid-cols-[1fr_auto_1fr]'>
        <p className='text-muted-foreground text-sm md:col-start-2'>{site.copyright}</p>
        <div className='-my-2.25 -me-2.25 ms-auto flex items-center gap-1 md:col-start-3'>
          <GitHubLink iconClassName='size-4.5' />
        </div>
      </div>
    </footer>
  );
}
