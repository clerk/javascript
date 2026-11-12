'use client';

import { Button } from '@clerk/mosaic/components/button';
import { useModal } from '@clerk/mosaic/modals/use-modal';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import type { MosaicRouting } from '@clerk/mosaic/routing/router-adapter';

import { demoModal, innerModal } from '@/components/routing-demo/demo-modal';
import { DemoPage } from '@/components/routing-demo/demo-page';
import { ModeNav, useModeParam } from '@/components/routing-demo/mode-nav';
import { nextRouterAdapter } from '@/lib/mosaic-next-router-adapter';

const pagePath = '/routing/nested-modals';
const modes = ['virtual', 'hash', 'query'] as const;

function OpenButton() {
  const demo = useModal(demoModal);
  return (
    <div>
      <Button onClick={() => demo.open()}>Open the modal</Button>
    </div>
  );
}

export default function NestedModalsPage() {
  const mode = useModeParam(modes);
  const routing: MosaicRouting = { adapter: nextRouterAdapter, modals: mode === 'virtual' ? undefined : mode };

  return (
    <MosaicProvider
      key={mode}
      routing={routing}
    >
      <innerModal.Host>
        <demoModal.Host>
          <DemoPage
            title='A modal on a modal'
            intro={
              <>
                <p>
                  A modal that opens another modal on top of itself. Each keeps its own entry and its own step, so in
                  the hash and query modes the URL carries both, a reload restores both, and Back unwinds them one at a
                  time.
                </p>
                <p>
                  The two are hosted side by side, not inside each other, so the modal beneath cannot tell from the tree
                  that one is on top of it. The modal host keeps the order they opened in and lets only the top one take
                  an outside press or Escape.
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
          </DemoPage>
        </demoModal.Host>
      </innerModal.Host>
    </MosaicProvider>
  );
}
