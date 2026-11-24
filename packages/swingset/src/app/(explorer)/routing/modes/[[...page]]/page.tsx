'use client';

import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import type { RoutingOptions } from '@clerk/mosaic/routing/router-adapter';

import { DemoPage } from '@/components/routing-demo/demo-page';
import { HostLinks, hostUrl } from '@/components/routing-demo/host-links';
import { InviteFlow } from '@/components/routing-demo/invite-flow';
import { ModeNav, useModeParam } from '@/components/routing-demo/mode-nav';
import { nextRouterAdapter } from '@/lib/mosaic-next-router-adapter';

const pagePath = '/routing/modes';
const modes = ['virtual', 'path', 'hash', 'query'] as const;
const routing: RoutingOptions = { adapter: nextRouterAdapter };

export default function RoutingModesPage() {
  const mode = useModeParam(modes);
  const link = (parts: string) =>
    hostUrl({ mode, pagePath, entries: [{ base: mode === 'path' ? pagePath : '/invite', parts }] });

  return (
    <MosaicProvider
      key={mode}
      routing={routing}
    >
      <DemoPage
        title='A page'
        intro={
          <>
            <p>
              One component, four places for its step. In <code className='font-mono text-xs'>virtual</code> the URL
              never changes and Back leaves the page, though a link can still open a step. In the others the step is in
              the URL: Back moves through the steps, a reload keeps the step, and a link can open a step directly.
            </p>
            <p>
              In <code className='font-mono text-xs'>path</code> the component is mounted at{' '}
              <code className='font-mono text-xs'>{pagePath}</code>, which is a catch-all route here, and its step is
              the rest of the pathname. In <code className='font-mono text-xs'>hash</code> and{' '}
              <code className='font-mono text-xs'>query</code> it is one param named after the base, here{' '}
              <code className='font-mono text-xs'>/invite</code>.
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
        <HostLinks
          links={[
            { label: 'Straight to inviting Grace', href: link('teammates/grace') },
            { label: 'The invite already sent', href: link('sent') },
          ]}
        />
        <InviteFlow
          key={mode}
          label='Invite a teammate'
          routing={mode}
          path={mode === 'path' ? pagePath : '/invite'}
        />
      </DemoPage>
    </MosaicProvider>
  );
}
