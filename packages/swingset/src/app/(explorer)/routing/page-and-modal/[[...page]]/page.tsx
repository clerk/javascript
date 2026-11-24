'use client';

import { Button } from '@clerk/mosaic/components/button';
import { useModal } from '@clerk/mosaic/modals/use-modal';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import type { MosaicRouting } from '@clerk/mosaic/routing/router-adapter';
import { isRouteName } from '@clerk/mosaic/routing/routes';
import type { MosaicRoutingMode } from '@clerk/mosaic/routing/use-mosaic-location';
import { useRouterScope } from '@clerk/mosaic/routing/use-router';

import { dnsHelpModal, domainModal } from '@/components/routing-demo/demo-modal';
import { DemoPage } from '@/components/routing-demo/demo-page';
import { HostLinks, hostUrl } from '@/components/routing-demo/host-links';
import { inviteModal } from '@/components/routing-demo/invite-modal';
import { ModeNav, useModeParam } from '@/components/routing-demo/mode-nav';
import { RoutedTabs } from '@/components/routing-demo/routed-tabs';
import { nextRouterAdapter } from '@/lib/mosaic-next-router-adapter';

const pagePath = '/routing/page-and-modal';
const pageModes = ['virtual', 'path', 'hash', 'query'] as const;
const modalModes = ['virtual', 'hash', 'query'] as const;
type ModalMode = (typeof modalModes)[number];

const pageRoutes = { members: '', domains: 'domains' } as const;

function MembersTab() {
  const invite = useModal(inviteModal);
  return (
    <div className='flex flex-col gap-3'>
      <p>Everyone in the organization. Inviting someone opens a modal with its own entry.</p>
      <div>
        <Button onClick={() => invite.open()}>Invite a teammate</Button>
      </div>
    </div>
  );
}

function DomainsTab() {
  const domain = useModal(domainModal);
  return (
    <div className='flex flex-col gap-3'>
      <p>
        The domains this organization owns. Adding one opens a modal that can be opened straight on its second step.
      </p>
      <div className='flex flex-wrap gap-2'>
        <Button onClick={() => domain.open()}>Add a domain</Button>
        <Button
          variant='outline'
          onClick={() => domain.open({ step: 'verify' })}
        >
          Open at verification
        </Button>
      </div>
    </div>
  );
}

function PageTabs({ mode }: { mode: MosaicRoutingMode }) {
  const { route, go } = useRouterScope(pageRoutes, {
    routing: mode,
    path: mode === 'path' ? pagePath : '/page',
    root: 'members',
  });
  return (
    <RoutedTabs
      value={route}
      onValueChange={value => isRouteName(pageRoutes, value) && go(value)}
      tabs={[
        { value: 'members', label: 'Members', content: <MembersTab /> },
        { value: 'domains', label: 'Domains', content: <DomainsTab /> },
      ]}
    />
  );
}

export default function PageWithModalsPage() {
  const pageMode = useModeParam(pageModes);
  const modalMode = useModeParam(modalModes, 'modal');
  const routing: MosaicRouting = {
    adapter: nextRouterAdapter,
    modals: modalMode === 'virtual' ? undefined : modalMode,
  };
  const href = (page: MosaicRoutingMode, modal: ModalMode) => `${pagePath}?mode=${page}&modal=${modal}`;
  const query = { modal: modalMode };
  const pageBase = pageMode === 'path' ? pagePath : '/page';
  const sameMode = pageMode === modalMode && pageMode !== 'virtual';

  return (
    <MosaicProvider
      key={`${pageMode}:${modalMode}`}
      routing={routing}
    >
      <inviteModal.Host>
        <dnsHelpModal.Host>
          <domainModal.Host>
            <DemoPage
              title='A page with modals'
              intro={
                <>
                  <p>
                    Everything together: a page whose tab is its segment, and modals opened from inside it, each with an
                    entry of its own beside the page&apos;s. In the URL modes a reload restores the tab and the modal,
                    and Back closes the modal before it changes the tab. The invite modal mounts the same component as
                    the page on the first demo, routed under the modal&apos;s base instead.
                  </p>
                  <p>
                    The page and the modals pick their mode separately, so a page in the pathname can keep its modals in
                    the query string, which is what the live user button page does. Modals never use the pathname: it
                    holds one segment, and that one is the page&apos;s.
                  </p>
                </>
              }
            >
              <ModeNav
                label='Page'
                modes={pageModes}
                mode={pageMode}
                href={option => href(option, modalMode)}
              />
              <ModeNav
                label='Modals'
                modes={modalModes}
                mode={modalMode}
                href={option => href(pageMode, option)}
              />
              <HostLinks
                links={[
                  {
                    label: 'The domains tab',
                    href: hostUrl({ mode: pageMode, pagePath, entries: [{ base: pageBase, parts: 'domains' }], query }),
                  },
                  {
                    label: 'The invite modal, inviting Grace',
                    href: hostUrl({
                      mode: modalMode,
                      pagePath,
                      entries: [{ base: '/modal/invite', parts: 'teammates/grace' }],
                      query: { mode: pageMode, modal: modalMode },
                    }),
                  },
                  {
                    label: 'The domains tab with the domain modal at verification',
                    href: sameMode
                      ? hostUrl({
                          mode: pageMode,
                          pagePath,
                          entries: [
                            { base: pageBase, parts: 'domains' },
                            { base: '/modal/domain', parts: 'verify' },
                          ],
                          query,
                        })
                      : undefined,
                  },
                ]}
              />
              <PageTabs
                key={pageMode}
                mode={pageMode}
              />
            </DemoPage>
          </domainModal.Host>
        </dnsHelpModal.Host>
      </inviteModal.Host>
    </MosaicProvider>
  );
}
