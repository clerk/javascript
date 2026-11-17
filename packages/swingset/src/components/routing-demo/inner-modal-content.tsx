'use client';

import { Button } from '@clerk/mosaic/components/button';
import { Card } from '@clerk/mosaic/components/card';
import type { ModalContentProps } from '@clerk/mosaic/modals/modal.types';
import { useRouterScope } from '@clerk/mosaic/routing/use-router';

const routes = { index: '', example: 'example' } as const;

export default function DnsHelpModalContent({ close, path, routing }: ModalContentProps<undefined>) {
  const { route, go } = useRouterScope(routes, { routing, path, root: 'index' });

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>{route === 'example' ? 'An example record' : 'DNS help'}</Card.Title>
        <Card.Description>
          Stacked on the domain modal with its own entry under {path}. A press outside it, or Escape, closes this one
          and leaves the one beneath.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div className='flex flex-col gap-2'>
          {route === 'example' ? (
            <code className='bg-muted rounded px-2 py-1 font-mono text-xs'>
              _clerk.auth.example.com TXT &quot;clerk-verify=8f3a…c21e&quot;
            </code>
          ) : null}
          <Button
            variant='outline'
            onClick={() => go(route === 'example' ? 'index' : 'example')}
          >
            {route === 'example' ? 'Back' : 'Show an example record'}
          </Button>
        </div>
      </Card.Content>
      <Card.Footer>
        <Button
          variant='ghost'
          onClick={close}
        >
          Close
        </Button>
      </Card.Footer>
    </Card.Root>
  );
}
