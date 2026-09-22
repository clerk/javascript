import { Button } from '@clerk/mosaic/components/button';
import { Icon } from '@clerk/mosaic/components/icon';
import { Toast } from '@clerk/mosaic/components/toast';
import { useRef } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './toast.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'wip',
  title: 'Toast',
  source: 'packages/mosaic/src/components/toast/toast.tsx',
};

function Triggers() {
  const manager = Toast.useToastManager();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', paddingBlock: '3rem' }}>
      <Button
        variant='outline'
        onClick={() => manager.add({ title: '2 invites sent', type: 'success' })}
      >
        Success
      </Button>
      <Button
        variant='outline'
        onClick={() => manager.add({ title: 'Could not send invites', type: 'error' })}
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
            title: 'Invitation revoked',
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

export function Default() {
  return (
    <Toast.Provider>
      <Triggers />
      <Toast.Viewport />
    </Toast.Provider>
  );
}

const anchoredToastManager = Toast.createToastManager();

function CopyButton() {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  function handleCopy() {
    anchoredToastManager.add({
      description: 'Copied',
      type: 'success',
      timeout: 1500,
      positionerProps: { anchor: buttonRef.current },
    });
  }

  return (
    <Button
      ref={buttonRef}
      variant='ghost'
      shape='square'
      aria-label='Copy'
      onClick={handleCopy}
    >
      <Icon name='clipboard' />
    </Button>
  );
}

export function Anchored() {
  return (
    <Toast.Provider toastManager={anchoredToastManager}>
      <div style={{ display: 'flex', justifyContent: 'center', paddingBlock: '3rem' }}>
        <CopyButton />
      </div>
      <Toast.AnchoredViewport />
    </Toast.Provider>
  );
}
