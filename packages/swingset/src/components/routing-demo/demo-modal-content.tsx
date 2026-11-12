'use client';

import { Button } from '@clerk/mosaic/components/button';
import { Card } from '@clerk/mosaic/components/card';
import type { ModalContentProps } from '@clerk/mosaic/modals/modal.types';
import { useModal } from '@clerk/mosaic/modals/use-modal';
import { useRouterScope } from '@clerk/mosaic/routing/use-router';

import type { DemoModalOptions } from './demo-modal';
import { innerModal } from './demo-modal';

const routes = { index: '', details: 'details' } as const;

export default function DemoModalContent({ close, path, routing }: ModalContentProps<DemoModalOptions>) {
  const { route, go } = useRouterScope(routes, { routing, path, root: 'index' });
  const inner = useModal(innerModal);

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>{route === 'details' ? 'Demo modal, details' : 'Demo modal'}</Card.Title>
        <Card.Description>
          {route === 'details'
            ? 'The second step of the same modal. Back returns to the first one.'
            : `Open while its entry exists under ${path}, routed in ${routing} mode. Its step is part of the entry.`}
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div className='flex flex-col gap-2'>
          <Button
            variant='outline'
            onClick={() => go(route === 'details' ? 'index' : 'details')}
          >
            {route === 'details' ? 'Back to the first step' : 'Show details'}
          </Button>
          <Button onClick={() => inner.open()}>Open another modal on top</Button>
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
