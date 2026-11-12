'use client';

import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import type { MosaicRouting } from '@clerk/mosaic/routing/router-adapter';
import type { MosaicRoutingMode } from '@clerk/mosaic/routing/use-mosaic-location';
import Link from 'next/link';

import { DemoPage } from '@/components/routing-demo/demo-page';
import { ModeNav, useModeParam } from '@/components/routing-demo/mode-nav';
import { Wizard } from '@/components/routing-demo/wizard';
import { buttonVariants } from '@/components/ui/button';
import { nextRouterAdapter } from '@/lib/mosaic-next-router-adapter';

const pagePath = '/routing/modes';
const modes = ['virtual', 'path', 'hash', 'query'] as const;
const routing: MosaicRouting = { adapter: nextRouterAdapter };

const deepLinks: Record<MosaicRoutingMode, string | undefined> = {
  virtual: undefined,
  path: `${pagePath}/items/b?mode=path`,
  hash: `${pagePath}?mode=hash#wizard=items/b`,
  query: `${pagePath}?mode=query&p.wizard=items/b`,
};

export default function RoutingModesPage() {
  const mode = useModeParam(modes);
  const deepLink = deepLinks[mode];

  return (
    <MosaicProvider
      key={mode}
      routing={routing}
    >
      <DemoPage
        title='The modes'
        intro={
          <>
            <p>
              One component, four places for its step. In <code className='font-mono text-xs'>virtual</code> the URL
              never changes and Back leaves the page. In the others the step is in the URL: Back moves through the
              steps, a reload keeps the step, and a link can open a step directly.
            </p>
            <p>
              In <code className='font-mono text-xs'>path</code> the component is mounted at{' '}
              <code className='font-mono text-xs'>{pagePath}</code>, which is a catch-all route here, and its step is
              the rest of the pathname. In <code className='font-mono text-xs'>hash</code> and{' '}
              <code className='font-mono text-xs'>query</code> it is one param named after the base, here{' '}
              <code className='font-mono text-xs'>/wizard</code>.
            </p>
          </>
        }
      >
        <ModeNav
          label='Routing'
          modes={modes}
          mode={mode}
          href={option => `${pagePath}?mode=${option}`}
        />
        {deepLink ? (
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-muted-foreground text-sm'>A link from the host, straight to item B:</span>
            <Link
              href={deepLink}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              <code className='font-mono text-xs'>{deepLink}</code>
            </Link>
          </div>
        ) : null}
        <Wizard
          key={mode}
          label='Wizard'
          routing={mode}
          path={mode === 'path' ? pagePath : '/wizard'}
        />
      </DemoPage>
    </MosaicProvider>
  );
}
