'use client';

import { Button } from '@clerk/mosaic/components/button';
import { useModal } from '@clerk/mosaic/modals/use-modal';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import type { MosaicRouting } from '@clerk/mosaic/routing/router-adapter';
import type { MosaicRoutingMode } from '@clerk/mosaic/routing/use-mosaic-location';

import { demoModal, innerModal } from '@/components/routing-demo/demo-modal';
import { DemoPage } from '@/components/routing-demo/demo-page';
import { ModeNav, useModeParam } from '@/components/routing-demo/mode-nav';
import { Wizard } from '@/components/routing-demo/wizard';
import { nextRouterAdapter } from '@/lib/mosaic-next-router-adapter';

const pagePath = '/routing/page-and-modal';
const pageModes = ['virtual', 'path', 'hash', 'query'] as const;
const modalModes = ['virtual', 'path', 'hash', 'query'] as const;

function OpenButtons() {
  const demo = useModal(demoModal);
  return (
    <div className='flex flex-wrap gap-2'>
      <Button onClick={() => demo.open()}>Open the modal</Button>
      <Button
        variant='outline'
        onClick={() => demo.open({ step: 'details' })}
      >
        Open it on its details step
      </Button>
    </div>
  );
}

export default function PageAndModalPage() {
  const pageMode = useModeParam(pageModes);
  const modalMode = useModeParam(modalModes, 'modal');
  const routing: MosaicRouting = {
    adapter: nextRouterAdapter,
    modals: modalMode === 'virtual' ? undefined : { routing: modalMode, path: pagePath },
  };
  const href = (page: MosaicRoutingMode, modal: (typeof modalModes)[number]) =>
    `${pagePath}?mode=${page}&modal=${modal}`;

  return (
    <MosaicProvider
      key={`${pageMode}:${modalMode}`}
      routing={routing}
    >
      <innerModal.Host>
        <demoModal.Host>
          <DemoPage
            title='A page and a modal'
            intro={
              <>
                <p>
                  A routed component on the page and a modal over it, each with its own entry. The modal is open exactly
                  while its entry exists, so in the hash and query modes a reload keeps it open and Back closes it.
                  Opening on a step writes that step as the entry; the content mounts reading it.
                </p>
                <p>
                  The two never touch each other&apos;s entry: navigate inside one and the other&apos;s param stays as
                  it was. In the pathname the modal lives under this page, as{' '}
                  <code className='font-mono text-xs'>{pagePath}/modal/demo/details</code>, and closes back to it. The
                  pathname holds one segment, so page and modal cannot both be in path mode: the page would read the
                  modal&apos;s part as an unknown step and send it to the root, closing the modal.
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
              label='Modal'
              modes={modalModes}
              mode={modalMode}
              href={option => href(pageMode, option)}
            />
            <OpenButtons />
            <Wizard
              key={pageMode}
              label='Wizard on the page'
              routing={pageMode}
              path={pageMode === 'path' ? pagePath : '/wizard'}
            />
          </DemoPage>
        </demoModal.Host>
      </innerModal.Host>
    </MosaicProvider>
  );
}
