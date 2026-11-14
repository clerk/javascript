import { ClerkUILogo } from '@/components/marketing/clerk-logo';
import { VersionBadge } from '@/components/marketing/version-badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { Container } from '@/components/ui/container';

const CLERK = 'https://clerk.com';

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Authentication', href: `${CLERK}/user-authentication` },
      { label: 'Multi-tenancy', href: `${CLERK}/multi-tenancy` },
      { label: 'Billing', href: `${CLERK}/billing` },
      { label: 'MCP server', href: `${CLERK}/mcp` },
      { label: 'CLI', href: `${CLERK}/cli` },
      { label: 'Agents', href: `${CLERK}/agents` },
    ],
  },
  {
    title: 'SDKs',
    links: [
      { label: 'React', href: `${CLERK}/react-authentication` },
      { label: 'Next.js', href: `${CLERK}/nextjs-authentication` },
      { label: 'Expo', href: `${CLERK}/expo-authentication` },
      { label: 'View all', href: `${CLERK}/docs#explore-by-frontend-framework` },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: `${CLERK}/docs` },
      { label: 'Changelog', href: `${CLERK}/changelog` },
      { label: 'Glossary', href: `${CLERK}/glossary` },
      { label: 'Feature requests', href: 'https://feedback.clerk.com/roadmap' },
      { label: 'Startups', href: `${CLERK}/startups` },
      { label: 'Students', href: `${CLERK}/github-student-developer-pack` },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: `${CLERK}/company` },
      { label: 'Careers', href: `${CLERK}/careers` },
      { label: 'Blog', href: `${CLERK}/blog` },
      { label: 'Contact', href: `${CLERK}/contact` },
      { label: 'Brand assets', href: `${CLERK}/brand-assets` },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms and conditions', href: `${CLERK}/legal/standard-terms` },
      { label: 'Privacy policy', href: `${CLERK}/legal/privacy` },
      { label: 'Website terms of use', href: `${CLERK}/legal/website-terms` },
      { label: 'Security', href: `${CLERK}/security` },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className='relative z-10 pb-16'>
      <Container>
        <div className='border-border border-t pt-8'>
          <nav aria-label='Footer'>
            <ul className='grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-6'>
              <li className='col-span-full flex items-center gap-2 self-start xl:col-auto'>
                <a
                  href={CLERK}
                  aria-label='Clerk home'
                  className='text-foreground -ml-px block w-fit'
                >
                  <ClerkUILogo className='h-4' />
                </a>
                <VersionBadge />
              </li>
              {COLUMNS.map(column => (
                <li key={column.title}>
                  <h2 className='body-3 text-gray-600 dark:text-gray-400'>{column.title}</h2>
                  <ul className='stack-1 mt-4'>
                    {column.links.map(link => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className='label-3 text-foreground -my-0.5 block w-fit py-0.5 transition-colors hover:text-gray-600 dark:hover:text-gray-300'
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
          <div className='border-border mt-12 flex items-center justify-between gap-4 border-t pt-4'>
            <p className='body-3 text-gray-600 dark:text-gray-400'>© {new Date().getFullYear()} Clerk, Inc.</p>
            <ThemeToggle className='size-8' />
          </div>
        </div>
      </Container>
    </footer>
  );
}
