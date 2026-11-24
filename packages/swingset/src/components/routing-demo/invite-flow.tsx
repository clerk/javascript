'use client';

import { Button } from '@clerk/mosaic/components/button';
import { MosaicRoutingScope } from '@clerk/mosaic/routing/routing-scope';
import type { RoutingMode } from '@clerk/mosaic/routing/use-mosaic-location';
import { useRouter, useRouterScope } from '@clerk/mosaic/routing/use-router';

export const inviteRoutes = { start: '', teammate: 'teammates/:teammate', sent: 'sent' } as const;

const teammates: Record<string, string> = { ada: 'Ada Lovelace', grace: 'Grace Hopper' };
const nameOf = (id: string | undefined) => (id === undefined ? undefined : (teammates[id] ?? id));

function NestedReadout() {
  const { route, params } = useRouter(inviteRoutes);
  return (
    <p className='text-muted-foreground text-xs'>
      A nested <code className='font-mono'>useRouter</code> inside the scope sees:{' '}
      <code className='font-mono'>
        {route === undefined ? 'nothing' : route === 'teammate' ? `teammate ${params.teammate}` : route}
      </code>
    </p>
  );
}

/** A three-step invite flow with nothing behind it, routed like any Mosaic component: the step lives in the location. */
export function InviteFlow({ label, routing, path }: { label: string; routing: RoutingMode; path?: string }) {
  const { route, params, go, scope } = useRouterScope(inviteRoutes, { routing, path, root: 'start' });
  const teammate = nameOf(params.teammate);

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
        {route === 'start'
          ? 'Who should get an invite?'
          : route === 'teammate'
            ? `Inviting ${teammate} as a member.`
            : 'Invite sent.'}
      </p>
      <div className='flex flex-wrap gap-2'>
        {route === 'start'
          ? Object.entries(teammates).map(([id, name]) => (
              <Button
                key={id}
                onClick={() => go('teammate', { teammate: id })}
              >
                {name}
              </Button>
            ))
          : null}
        {route === 'teammate' ? (
          <>
            <Button onClick={() => go('sent')}>Send the invite</Button>
            <Button
              variant='outline'
              onClick={() => go('start')}
            >
              Pick someone else
            </Button>
          </>
        ) : null}
        {route === 'sent' ? (
          <Button
            variant='outline'
            onClick={() => go('start')}
          >
            Invite someone else
          </Button>
        ) : null}
      </div>
      <MosaicRoutingScope scope={scope}>
        <NestedReadout />
      </MosaicRoutingScope>
    </section>
  );
}
