'use client';

import { Button } from '@clerk/mosaic/components/button';
import { Card } from '@clerk/mosaic/components/card';
import type { ModalContentProps } from '@clerk/mosaic/modals/modal.types';
import { isRouteName } from '@clerk/mosaic/routing/routes';
import { useRouterScope } from '@clerk/mosaic/routing/use-router';

import { RoutedTabs } from './routed-tabs';
import type { TabsModalOptions } from './tabs-modal';

const routes = { members: '', invitations: 'invitations', settings: 'settings' } as const;

export default function TabsModalContent({ close, path, routing }: ModalContentProps<TabsModalOptions>) {
  const { route, go } = useRouterScope(routes, { routing, path, root: 'members' });
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>Tabs in a modal</Card.Title>
        <Card.Description>
          The open tab is the modal&apos;s segment under {path}, so in the hash and query modes a reload brings back the
          modal on this tab, and the handle can open it on a tab.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <RoutedTabs
          value={route}
          onValueChange={value => isRouteName(routes, value) && go(value)}
          tabs={[
            { value: 'members', label: 'Members', content: 'Everyone in the organization.' },
            { value: 'invitations', label: 'Invitations', content: 'Who has been invited and not yet joined.' },
            { value: 'settings', label: 'Settings', content: 'How membership works here.' },
          ]}
        />
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
