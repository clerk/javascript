'use client';

import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import type { MosaicRouting } from '@clerk/mosaic/routing/router-adapter';

import { DemoPage } from '@/components/routing-demo/demo-page';
import { ModeNav, useModeParam } from '@/components/routing-demo/mode-nav';
import { Wizard } from '@/components/routing-demo/wizard';
import { nextRouterAdapter } from '@/lib/mosaic-next-router-adapter';

const pagePath = '/routing/side-by-side';
const modes = ['virtual', 'hash', 'query', 'path'] as const;
const routing: MosaicRouting = { adapter: nextRouterAdapter };

export default function SideBySidePage() {
  const mode = useModeParam(modes);
  const base = (name: string) => (mode === 'path' ? `${pagePath}/${name}` : `/${name}`);

  return (
    <MosaicProvider
      key={mode}
      routing={routing}
    >
      <DemoPage
        title='Side by side'
        intro={
          <>
            <p>
              Two components on one page, each routing on its own under its own base. In{' '}
              <code className='font-mono text-xs'>virtual</code>, <code className='font-mono text-xs'>hash</code> and{' '}
              <code className='font-mono text-xs'>query</code> they are independent: each has its own entry, here the
              params <code className='font-mono text-xs'>left</code> and{' '}
              <code className='font-mono text-xs'>right</code>, and navigating one leaves the other where it is.
            </p>
            <p>
              <code className='font-mono text-xs'>path</code> cannot do this. The pathname says one thing, so one
              component at most can keep its step there. Here both are given a base under this page,{' '}
              <code className='font-mono text-xs'>{pagePath}/left</code> and{' '}
              <code className='font-mono text-xs'>{pagePath}/right</code>: navigating one moves the pathname out from
              under the other, which shows its first step and warns in the console. Give the other component another
              mode.
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
        <div className='grid gap-4 sm:grid-cols-2'>
          <Wizard
            key={`left:${mode}`}
            label='Left'
            routing={mode}
            path={base('left')}
          />
          <Wizard
            key={`right:${mode}`}
            label='Right'
            routing={mode}
            path={base('right')}
          />
        </div>
      </DemoPage>
    </MosaicProvider>
  );
}
