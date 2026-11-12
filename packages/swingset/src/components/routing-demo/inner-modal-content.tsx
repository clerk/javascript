'use client';

import { Button } from '@clerk/mosaic/components/button';
import { Card } from '@clerk/mosaic/components/card';
import type { ModalContentProps } from '@clerk/mosaic/modals/modal.types';
import { useRouterScope } from '@clerk/mosaic/routing/use-router';

const routes = { index: '', details: 'details' } as const;

export default function InnerModalContent({ close, path, routing }: ModalContentProps<undefined>) {
  const { route, go } = useRouterScope(routes, { routing, path, root: 'index' });

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>{route === 'details' ? 'Inner modal, details' : 'Inner modal'}</Card.Title>
        <Card.Description>
          Stacked on the demo modal with its own entry under {path}. A press outside it, or Escape, closes this one and
          leaves the one beneath.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <Button
          variant='outline'
          onClick={() => go(route === 'details' ? 'index' : 'details')}
        >
          {route === 'details' ? 'Back to the first step' : 'Show details'}
        </Button>
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
