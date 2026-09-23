import { Button } from '@clerk/mosaic/components/button';
import { Icon } from '@clerk/mosaic/components/icon';
import { useToastManager } from '@clerk/mosaic/components/toast';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './toast.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'wip',
  title: 'Toast',
  source: 'packages/mosaic/src/components/toast/toast.tsx',
};

export function Default() {
  const manager = useToastManager();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', paddingBlock: '3rem' }}>
      <Button
        variant='outline'
        onClick={() => manager.add({ label: '2 invites sent', type: 'success' })}
      >
        Success
      </Button>
      <Button
        variant='outline'
        onClick={() => manager.add({ id: 'send-invites-error', label: 'Could not send invites', type: 'error' })}
      >
        Error
      </Button>
      <Button
        variant='outline'
        onClick={() =>
          void manager
            .promise(new Promise<void>(resolve => setTimeout(resolve, 1500)), {
              loading: 'Sending invites…',
              success: '2 invites sent',
              error: 'Could not send invites',
            })
            .catch(() => {})
        }
      >
        Promise
      </Button>
      <Button
        variant='outline'
        onClick={() =>
          manager.add({
            label: 'Invitation revoked',
            description: 'jane@example.com can no longer join.',
            type: 'success',
          })
        }
      >
        With description
      </Button>
    </div>
  );
}

export function Anchored() {
  const manager = useToastManager();
  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingBlock: '3rem' }}>
      <Button
        variant='ghost'
        shape='square'
        aria-label='Copy'
        onClick={event =>
          manager.add({
            id: 'copy',
            description: 'Copied',
            type: 'success',
            timeout: 1500,
            positionerProps: { anchor: event.currentTarget },
          })
        }
      >
        <Icon name='clipboard' />
      </Button>
    </div>
  );
}
