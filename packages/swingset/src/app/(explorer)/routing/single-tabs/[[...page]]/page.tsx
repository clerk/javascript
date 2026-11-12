'use client';

import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import type { MosaicRouting } from '@clerk/mosaic/routing/router-adapter';
import { isRouteName } from '@clerk/mosaic/routing/routes';
import { useRouterScope } from '@clerk/mosaic/routing/use-router';
import Link from 'next/link';

import { DemoPage } from '@/components/routing-demo/demo-page';
import { ModeNav, useModeParam } from '@/components/routing-demo/mode-nav';
import { RoutedTabs } from '@/components/routing-demo/routed-tabs';
import { buttonVariants } from '@/components/ui/button';
import { nextRouterAdapter } from '@/lib/mosaic-next-router-adapter';

const pagePath = '/routing/single-tabs';
const modes = ['path', 'virtual', 'hash', 'query'] as const;
type Mode = (typeof modes)[number];
const routing: MosaicRouting = { adapter: nextRouterAdapter };

const routes = { members: '', invitations: 'invitations', settings: 'settings' } as const;

function Tabs({ mode }: { mode: Mode }) {
  const { route, go } = useRouterScope(routes, {
    routing: mode,
    path: mode === 'path' ? pagePath : '/tabs',
    root: 'members',
  });
  return (
    <RoutedTabs
      value={route}
      onValueChange={value => isRouteName(routes, value) && go(value)}
      tabs={[
        { value: 'members', label: 'Members', content: 'Everyone in the organization.' },
        { value: 'invitations', label: 'Invitations', content: 'Who has been invited and not yet joined.' },
        { value: 'settings', label: 'Settings', content: 'How membership works here.' },
      ]}
    />
  );
}

export default function SingleTabsPage() {
  const mode = useModeParam(modes);

  return (
    <MosaicProvider
      key={mode}
      routing={routing}
    >
      <DemoPage
        title='A single set of tabs'
        intro={
          <p>
            One set of tabs on the page, shown first in path mode, owning the pathname under{' '}
            <code className='font-mono text-xs'>{pagePath}</code>, a catch-all route. The first tab is the root, so it
            lives at the base itself, and the others are{' '}
            <code className='font-mono text-xs'>{pagePath}/invitations</code> and{' '}
            <code className='font-mono text-xs'>{pagePath}/settings</code>. Back moves between tabs, a reload keeps the
            tab, and a link from the host opens one directly. The other modes are here to compare the URL shapes;
            several sets of tabs on one page is the next case.
          </p>
        }
      >
        <ModeNav
          label='Routing'
          modes={modes}
          mode={mode}
          href={option => `${pagePath}?mode=${option}`}
        />
        {mode === 'path' ? (
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-muted-foreground text-sm'>Links from the host:</span>
            <Link
              href={`${pagePath}/settings?mode=path`}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              <code className='font-mono text-xs'>{pagePath}/settings</code>
            </Link>
            <Link
              href={`${pagePath}/bogus?mode=path`}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              <code className='font-mono text-xs'>{pagePath}/bogus</code>
            </Link>
          </div>
        ) : null}
        <Tabs
          key={mode}
          mode={mode}
        />
      </DemoPage>
    </MosaicProvider>
  );
}
