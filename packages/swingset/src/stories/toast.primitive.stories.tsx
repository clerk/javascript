import { Toast } from '@clerk/mosaic/primitives/toast';

import type { StoryMeta } from '@/lib/types';

// Headless primitives ship no styles. This single demo renders the primitive raw —
// unstyled — so it faithfully reflects what the primitive provides: behavior, state,
// and ARIA wiring via the `data-*` attributes each part emits, with zero appearance.

export const meta: StoryMeta = {
  group: 'Primitives',
  status: 'stable',
  title: 'Toast',
  source: 'packages/mosaic/src/primitives/toast/index.ts',
};

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return (
    <>
      {toasts.map(toast => (
        <Toast.Root
          key={toast.id}
          toast={toast}
        >
          <Toast.Content>
            <Toast.Title />
            <Toast.Description />
          </Toast.Content>
          <Toast.Action />
          <Toast.Close aria-label='Close'>×</Toast.Close>
        </Toast.Root>
      ))}
    </>
  );
}

function Triggers() {
  const manager = Toast.useToastManager();
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        type='button'
        onClick={() => manager.add({ title: 'Saved', description: 'Your changes were saved.' })}
      >
        Add toast
      </button>
      <button
        type='button'
        onClick={() =>
          manager.add({
            title: 'Email removed',
            type: 'undoable',
            actionProps: { children: 'Undo', onClick: () => manager.add({ title: 'Restored', timeout: 2000 }) },
          })
        }
      >
        Add toast with action
      </button>
      <button
        type='button'
        onClick={() =>
          void manager
            .promise(new Promise<void>(resolve => setTimeout(resolve, 1500)), {
              loading: 'Saving…',
              success: 'Profile saved',
              error: 'Could not save',
            })
            .catch(() => {})
        }
      >
        Add promise toast
      </button>
    </div>
  );
}

export function Default() {
  return (
    <Toast.Provider>
      <Triggers />
      <Toast.Viewport>
        <ToastList />
      </Toast.Viewport>
    </Toast.Provider>
  );
}
