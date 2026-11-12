'use client';

import { Button } from '@clerk/mosaic/components/button';
import { MosaicRoutingScope } from '@clerk/mosaic/routing/routing-scope';
import type { MosaicRoutingMode } from '@clerk/mosaic/routing/use-mosaic-location';
import { useRouter, useRouterScope } from '@clerk/mosaic/routing/use-router';

export const wizardRoutes = { start: '', item: 'items/:item', done: 'done' } as const;

function NestedReadout() {
  const { route, params } = useRouter(wizardRoutes);
  return (
    <p className='text-muted-foreground text-xs'>
      A nested <code className='font-mono'>useRouter</code> inside the scope sees:{' '}
      <code className='font-mono'>
        {route === undefined ? 'nothing' : route === 'item' ? `item ${params.item}` : route}
      </code>
    </p>
  );
}

/** A three-step flow with nothing in it, routed like any Mosaic component: the step lives in the location. */
export function Wizard({ label, routing, path }: { label: string; routing: MosaicRoutingMode; path?: string }) {
  const { route, params, go, scope } = useRouterScope(wizardRoutes, { routing, path, root: 'start' });

  return (
    <section className='flex flex-col gap-3 rounded-lg border p-4'>
      <div className='flex flex-wrap items-baseline justify-between gap-2'>
        <h2 className='text-sm font-medium'>{label}</h2>
        <code className='text-muted-foreground font-mono text-xs'>
          {routing}
          {path ? ` under ${path}` : ''}
        </code>
      </div>
      <p className='text-sm'>
        {route === 'start' ? 'Pick an item.' : route === 'item' ? `Looking at item ${params.item}.` : 'Done.'}
      </p>
      <div className='flex flex-wrap gap-2'>
        {route === 'start' ? (
          <>
            <Button onClick={() => go('item', { item: 'a' })}>Item A</Button>
            <Button onClick={() => go('item', { item: 'b' })}>Item B</Button>
          </>
        ) : null}
        {route === 'item' ? (
          <>
            <Button onClick={() => go('done')}>Finish</Button>
            <Button
              variant='outline'
              onClick={() => go('start')}
            >
              Back to the start
            </Button>
          </>
        ) : null}
        {route === 'done' ? (
          <Button
            variant='outline'
            onClick={() => go('start')}
          >
            Start over
          </Button>
        ) : null}
      </div>
      <MosaicRoutingScope scope={scope}>
        <NestedReadout />
      </MosaicRoutingScope>
    </section>
  );
}
