'use client';

import { Button } from '@clerk/mosaic/components/button';
import { useModal } from '@clerk/mosaic/modals/use-modal';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import type { MosaicRouting } from '@clerk/mosaic/routing/router-adapter';
import Link from 'next/link';

import { DemoPage } from '@/components/routing-demo/demo-page';
import { ModeNav, useModeParam } from '@/components/routing-demo/mode-nav';
import { TabsArrivingLater, TabsInLocation, TabsInStep } from '@/components/routing-demo/tabs-cases';
import { tabsModal } from '@/components/routing-demo/tabs-modal';
import { buttonVariants } from '@/components/ui/button';
import { nextRouterAdapter } from '@/lib/mosaic-next-router-adapter';

const pagePath = '/routing/multiple-tabs';
const modes = ['virtual', 'hash', 'query'] as const;
type Mode = (typeof modes)[number];

// Links a host could render, one per case, in the shape the mode gives them.
const links: Record<Exclude<Mode, 'virtual'>, { label: string; href: string }[]> = {
  hash: [
    { label: 'A tab the table does not know', href: `${pagePath}?mode=hash#tabs=bogus` },
    { label: 'Item B on its activity tab', href: `${pagePath}?mode=hash#item=items/b/activity` },
    { label: 'The billing tab, before the tabs are known', href: `${pagePath}?mode=hash#later=billing` },
    { label: 'The modal on its settings tab', href: `${pagePath}?mode=hash#modal.tabs=settings` },
  ],
  query: [
    { label: 'A tab the table does not know', href: `${pagePath}?mode=query&p.tabs=bogus` },
    { label: 'Item B on its activity tab', href: `${pagePath}?mode=query&p.item=items/b/activity` },
    { label: 'The billing tab, before the tabs are known', href: `${pagePath}?mode=query&p.later=billing` },
    { label: 'The modal on its settings tab', href: `${pagePath}?mode=query&p.modal.tabs=settings` },
  ],
};

function TabsModalButtons() {
  const modal = useModal(tabsModal);
  return (
    <section className='flex flex-col gap-3 rounded-lg border p-4'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-sm font-medium'>Tabs in a modal</h2>
        <p className='text-muted-foreground text-sm'>
          The modal&apos;s entry is its open tab. Opening on a tab writes that tab as the entry before the content
          mounts, the same way a profile modal opens on a page.
        </p>
      </div>
      <div className='flex flex-wrap gap-2'>
        <Button onClick={() => modal.open()}>Open the modal</Button>
        <Button
          variant='outline'
          onClick={() => modal.open({ tab: 'invitations' })}
        >
          Open it on Invitations
        </Button>
      </div>
    </section>
  );
}

export default function MultipleTabsPage() {
  const mode = useModeParam(modes);
  const routing: MosaicRouting = { adapter: nextRouterAdapter, modals: mode === 'virtual' ? undefined : mode };

  return (
    <MosaicProvider
      key={mode}
      routing={routing}
    >
      <tabsModal.Host>
        <DemoPage
          title='Several sets of tabs'
          intro={
            <p>
              Tabs are the simplest routed thing: the active tab is a route name, picking one is{' '}
              <code className='font-mono text-xs'>go</code>, and the tab control is told which one is active. Four
              places a tab can sit, each with its own base on this page, so hash and query hold them all at once. Path
              mode holds one segment per page, so it has a page of its own.
            </p>
          }
        >
          <ModeNav
            label='Routing'
            modes={modes}
            mode={mode}
            href={option => `${pagePath}?mode=${option}`}
          />
          {mode === 'virtual' ? null : (
            <div className='flex flex-wrap items-center gap-2'>
              <span className='text-muted-foreground text-sm'>Links from the host:</span>
              {links[mode].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
          <TabsInLocation
            key={`tabs:${mode}`}
            routing={mode}
          />
          <TabsInStep
            key={`item:${mode}`}
            routing={mode}
          />
          <TabsArrivingLater
            key={`later:${mode}`}
            routing={mode}
          />
          <TabsModalButtons />
        </DemoPage>
      </tabsModal.Host>
    </MosaicProvider>
  );
}
