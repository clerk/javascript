'use client';

import { Button } from '@clerk/mosaic/components/button';
import { Card } from '@clerk/mosaic/components/card';
import type { ModalContentProps } from '@clerk/mosaic/modals/modal.types';
import { useModal } from '@clerk/mosaic/modals/use-modal';
import { useRouterScope } from '@clerk/mosaic/routing/use-router';

import type { DomainModalOptions } from './demo-modal';
import { dnsHelpModal } from './demo-modal';

const routes = { index: '', verify: 'verify' } as const;

export default function DomainModalContent({ close, path, routing }: ModalContentProps<DomainModalOptions>) {
  const { route, go } = useRouterScope(routes, { routing, path, root: 'index' });
  const help = useModal(dnsHelpModal);

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>{route === 'verify' ? 'Verify ownership' : 'Add a domain'}</Card.Title>
        <Card.Description>
          {route === 'verify'
            ? 'Add the TXT record to your DNS, then verify. This step has its own entry, so Back returns to the domain.'
            : `Open while its entry exists under ${path}, routed in ${routing} mode. Its step is part of the entry.`}
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div className='flex flex-col gap-2'>
          {route === 'verify' ? (
            <code className='bg-muted rounded px-2 py-1 font-mono text-xs'>clerk-verify=8f3a…c21e</code>
          ) : (
            <code className='bg-muted rounded px-2 py-1 font-mono text-xs'>auth.example.com</code>
          )}
          <Button
            variant='outline'
            onClick={() => go(route === 'verify' ? 'index' : 'verify')}
          >
            {route === 'verify' ? 'Back to the domain' : 'Continue to verification'}
          </Button>
          <Button onClick={() => help.open()}>Need help with DNS?</Button>
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
