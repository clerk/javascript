import Link from 'next/link';

import { GitHubLink } from '@/components/github-link';
import { docHref, docKinds, docsOfKind } from '@/lib/docs';
import { site } from '@/lib/site';

const groups = [
  {
    title: 'Docs',
    items: [
      { title: 'Setup', href: '/docs/setup' },
      ...docKinds.flatMap(({ kind, title }) => {
        const [first] = docsOfKind(kind);
        return first ? [{ title, href: docHref(first) }] : [];
      }),
    ],
  },
  {
    title: 'Resources',
    items: [
      { title: 'Changelog', href: site.changelogUrl },
      { title: 'GitHub', href: site.githubUrl },
      { title: 'llms.txt', href: '/llms.txt' },
    ],
  },
];

export function LandingFooterLinks() {
  return (
    <nav
      aria-label='Footer'
      className='max-w-350 mx-auto grid w-full grid-cols-2 gap-x-8 gap-y-10 px-6 py-16 sm:grid-cols-3 sm:py-20 lg:grid-cols-7'
    >
      {groups.map(group => (
        <div key={group.title}>
          <p className='text-foreground text-sm font-medium'>{group.title}</p>
          <ul className='mt-4 space-y-3'>
            {group.items.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className='text-muted-foreground hover:text-foreground text-sm transition-colors'
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function LandingFooter() {
  return (
    <footer className='max-w-350 mx-auto w-full px-6 pb-16 sm:pb-20'>
      <div className='border-border flex flex-col items-center gap-4 border-t pt-8 sm:grid sm:grid-cols-3 sm:items-center'>
        <Link
          href='/'
          className='text-foreground flex items-center gap-2 font-medium sm:justify-self-start'
        >
          {site.name}
        </Link>
        <p className='text-muted-foreground text-center text-xs'>{site.copyright}</p>
        <div className='-my-2.25 sm:-me-2.25 flex items-center gap-1 sm:justify-self-end'>
          <GitHubLink iconClassName='size-4' />
        </div>
      </div>
    </footer>
  );
}
