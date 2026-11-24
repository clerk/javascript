'use client';

import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import type { RoutingOptions } from '@clerk/mosaic/routing/router-adapter';

import { DemoPage } from '@/components/routing-demo/demo-page';
import { HostLinks, hostUrl } from '@/components/routing-demo/host-links';
import { InviteFlow } from '@/components/routing-demo/invite-flow';
import { ModeNav, useModeParam } from '@/components/routing-demo/mode-nav';
import { nextRouterAdapter } from '@/lib/mosaic-next-router-adapter';

const pagePath = '/routing/side-by-side';
const modes = ['virtual', 'hash', 'query'] as const;
const routing: RoutingOptions = { adapter: nextRouterAdapter };

export default function SideBySidePage() {
  const mode = useModeParam(modes);

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
              params <code className='font-mono text-xs'>team</code> and{' '}
              <code className='font-mono text-xs'>sidebar</code>, and navigating one leaves the other where it is.
            </p>
            <p>
              <code className='font-mono text-xs'>path</code> is not offered here. The pathname says one thing, so one
              component at most can keep its step there; a second one on the same page needs another mode.
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
            {
              label: 'Both invites under way',
              href: hostUrl({
                mode,
                pagePath,
                entries: [
                  { base: '/team', parts: 'teammates/ada' },
                  { base: '/sidebar', parts: 'teammates/grace' },
                ],
              }),
            },
          ]}
        />
        <div className='grid gap-4 sm:grid-cols-2'>
          <InviteFlow
            key={`team:${mode}`}
            label='Invite from the team page'
            routing={mode}
            path='/team'
          />
          <InviteFlow
            key={`sidebar:${mode}`}
            label='Invite from the sidebar'
            routing={mode}
            path='/sidebar'
          />
        </div>
      </DemoPage>
    </MosaicProvider>
  );
}
