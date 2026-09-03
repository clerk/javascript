import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { Dialog } from '../dialog';
import { Drawer } from './drawer';

function Sheet({ defaultOpen = true }: { defaultOpen?: boolean }) {
  return (
    <Drawer.Root defaultOpen={defaultOpen}>
      <Drawer.Trigger>Open</Drawer.Trigger>
      <Drawer.Popup data-testid='popup'>
        <Drawer.Title>Filters</Drawer.Title>
        <Drawer.Description>Narrow the list.</Drawer.Description>
        <Drawer.Close>Done</Drawer.Close>
      </Drawer.Popup>
    </Drawer.Root>
  );
}

describe('Drawer', () => {
  it('renders a named, described sheet with a grip, over a scrim', () => {
    render(
      <MosaicProvider>
        <Sheet />
      </MosaicProvider>,
    );

    const sheet = screen.getByRole('dialog', { name: 'Filters' });
    expect(sheet).toHaveAccessibleDescription('Narrow the list.');
    expect(sheet).toHaveClass('cl-drawer-popup');
    expect(sheet.querySelector('[data-drawer-handle]')).toHaveClass('cl-drawer-handle');
    expect(sheet.querySelector('.cl-drawer-grip')).toBeInTheDocument();
    expect(document.querySelector('.cl-drawer-backdrop')).not.toHaveAttribute('data-nested');
    expect(document.querySelector('.cl-drawer-viewport')).toContainElement(sheet);
  });

  it('reflects its height as a data attribute', () => {
    render(
      <MosaicProvider>
        <Drawer.Root defaultOpen>
          <Drawer.Popup height='full'>
            <Drawer.Title>Filters</Drawer.Title>
          </Drawer.Popup>
        </Drawer.Root>
      </MosaicProvider>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('data-height', 'full');
  });

  it('opens from its trigger and closes from inside', async () => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <Sheet defaultOpen={false} />
      </MosaicProvider>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  // A sheet opened from inside a profile dialog is the same relationship as a prompt opened there,
  // and takes the same, nested scrim.
  it('takes the nested scrim inside a modal dialog, and the base one inside an inline dialog', () => {
    const modal = render(
      <MosaicProvider>
        <Dialog.Root defaultOpen>
          <Dialog.Popup size='profile'>
            <Sheet />
          </Dialog.Popup>
        </Dialog.Root>
      </MosaicProvider>,
    );
    expect(document.querySelector('.cl-drawer-backdrop')).toHaveAttribute('data-nested');
    modal.unmount();

    render(
      <MosaicProvider>
        <Dialog.Root inline>
          <Dialog.Popup size='profile'>
            <Sheet />
          </Dialog.Popup>
        </Dialog.Root>
      </MosaicProvider>,
    );
    expect(document.querySelector('.cl-drawer-backdrop')).not.toHaveAttribute('data-nested');
  });
});
