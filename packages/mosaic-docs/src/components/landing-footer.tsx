import Link from 'next/link';

import { GitHubLink } from '@/components/github-link';
import { navigation } from '@/lib/navigation';
import { site } from '@/lib/site';

export function LandingFooter() {
  return (
    <footer>
      <div className='mx-auto max-w-[1400px] px-6 py-16 sm:py-20'>
        <nav
          aria-label='Footer'
          className='grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-7'
        >
          {navigation.map(group => (
            <div
              key={group.title}
              className='min-w-0'
            >
              <p className='text-foreground text-sm font-medium'>{group.title}</p>
              <ul className='mt-4 space-y-3'>
                {group.items.map(item => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className='text-muted-foreground hover:text-foreground wrap-anywhere text-sm transition-colors'
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className='border-border mt-16 flex flex-col items-center gap-4 border-t pt-8 sm:grid sm:grid-cols-3 sm:items-center'>
          <Link
            href='/'
            className='text-foreground flex items-center gap-2 font-medium sm:justify-self-start'
          >
            {site.name}
          </Link>
          <p className='text-muted-foreground text-center text-xs'>{site.copyright}</p>
          <div className='-my-[9px] flex items-center gap-1 sm:-me-[9px] sm:justify-self-end'>
            <GitHubLink iconClassName='size-4' />
          </div>
        </div>
      </div>
    </footer>
  );
}
