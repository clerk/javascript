'use client';

import { Button } from '@clerk/mosaic/components/button';
import { useModal } from '@clerk/mosaic/modals/use-modal';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import type { MosaicRouting } from '@clerk/mosaic/routing/router-adapter';

import { dnsHelpModal, domainModal } from '@/components/routing-demo/demo-modal';
import { DemoPage } from '@/components/routing-demo/demo-page';
import { HostLinks, hostUrl } from '@/components/routing-demo/host-links';
import { ModeNav, useModeParam } from '@/components/routing-demo/mode-nav';
import { nextRouterAdapter } from '@/lib/mosaic-next-router-adapter';

const pagePath = '/routing/nested-modals';
const modes = ['virtual', 'hash', 'query'] as const;

function OpenButton() {
  const domain = useModal(domainModal);
  return (
    <div>
      <Button onClick={() => domain.open()}>Add a domain</Button>
    </div>
  );
}

export default function ModalPage() {
  const mode = useModeParam(modes);
  const routing: MosaicRouting = { adapter: nextRouterAdapter, modals: mode === 'virtual' ? undefined : mode };

  return (
    <MosaicProvider
      key={mode}
      routing={routing}
    >
      <dnsHelpModal.Host>
        <domainModal.Host>
          <DemoPage
            title='A modal'
            intro={
              <>
                <p>
                  A modal is open exactly while its entry exists, and its step is part of the entry. In the hash and
                  query modes that puts it in the URL: a reload opens it again on the same step, Back closes it, and the
                  handle can open it straight on a step.
                </p>
                <p>
                  It can have another modal on top. The DNS help button opens one with an entry of its own, so the URL
                  carries both and Back unwinds them one at a time. The two are hosted side by side rather than inside
                  each other, so the modal host keeps the order they opened in and lets only the top one take an outside
                  press or Escape.
                </p>
              </>
            }
          >
            <ModeNav
              label='Modals'
              modes={modes}
              mode={mode}
              href={option => `${pagePath}?mode=${option}`}
            />
            <OpenButton />
            <HostLinks
              links={[
                {
                  label: 'The modal at verification',
                  href: hostUrl({ mode, pagePath, entries: [{ base: '/modal/domain', parts: 'verify' }] }),
                },
                {
                  label: 'The help modal on top of it',
                  href: hostUrl({
                    mode,
                    pagePath,
                    entries: [
                      { base: '/modal/domain', parts: '' },
                      { base: '/modal/dnsHelp', parts: 'example' },
                    ],
                  }),
                },
              ]}
            />
          </DemoPage>
        </domainModal.Host>
      </dnsHelpModal.Host>
    </MosaicProvider>
  );
}
