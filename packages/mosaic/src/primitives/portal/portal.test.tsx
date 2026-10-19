import { cleanup, render, screen, waitFor } from '@testing-library/react';
import type { ReactElement, ReactNode, RefObject } from 'react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { Autocomplete } from '../autocomplete';
import { Combobox } from '../combobox';
import { Dialog } from '../dialog';
import { Drawer } from '../drawer';
import { Menu } from '../menu';
import { Popover } from '../popover';
import { Select } from '../select';
import { Toast } from '../toast';
import { Tooltip } from '../tooltip';
import { PortalProvider, useGetPortalContainer } from './index';

type Root = HTMLElement | null | RefObject<HTMLElement | null>;

const overlays: Array<[string, (children: ReactNode, root?: Root) => ReactElement]> = [
  [
    'dialog',
    (children, root) => (
      <Dialog.Root defaultOpen>
        <Dialog.Portal root={root}>{children}</Dialog.Portal>
      </Dialog.Root>
    ),
  ],
  [
    'drawer',
    (children, root) => (
      <Drawer.Root defaultOpen>
        <Drawer.Portal root={root}>{children}</Drawer.Portal>
      </Drawer.Root>
    ),
  ],
  [
    'popover',
    (children, root) => (
      <Popover.Root defaultOpen>
        <Popover.Portal root={root}>{children}</Popover.Portal>
      </Popover.Root>
    ),
  ],
  [
    'menu',
    (children, root) => (
      <Menu.Root defaultOpen>
        <Menu.Portal root={root}>{children}</Menu.Portal>
      </Menu.Root>
    ),
  ],
  [
    'select',
    (children, root) => (
      <Select.Root defaultOpen>
        <Select.Portal root={root}>{children}</Select.Portal>
      </Select.Root>
    ),
  ],
  [
    'combobox',
    (children, root) => (
      <Combobox.Root defaultOpen>
        <Combobox.Portal root={root}>{children}</Combobox.Portal>
      </Combobox.Root>
    ),
  ],
  [
    'autocomplete',
    (children, root) => (
      <Autocomplete.Root defaultOpen>
        <Autocomplete.Portal root={root}>{children}</Autocomplete.Portal>
      </Autocomplete.Root>
    ),
  ],
  [
    'tooltip',
    (children, root) => (
      <Tooltip.Root defaultOpen>
        <Tooltip.Portal root={root}>{children}</Tooltip.Portal>
      </Tooltip.Root>
    ),
  ],
  [
    'toast',
    (children, root) => (
      <Toast.Provider>
        <Toast.Portal root={root}>{children}</Toast.Portal>
      </Toast.Provider>
    ),
  ],
];

afterEach(cleanup);

describe.each(overlays)('%s portal', (_name, renderOverlay) => {
  const content = <div data-testid='content' />;

  it('portals into document.body without a provider', async () => {
    render(<div data-testid='app'>{renderOverlay(content)}</div>);

    const node = await screen.findByTestId('content');
    expect(screen.getByTestId('app')).not.toContainElement(node);
    expect(document.body).toContainElement(node);
  });

  it('portals into a ref container', async () => {
    function App() {
      const ref = React.useRef<HTMLDivElement>(null);
      return (
        <>
          <div
            ref={ref}
            data-testid='container'
          />
          <PortalProvider container={ref}>{renderOverlay(content)}</PortalProvider>
        </>
      );
    }
    render(<App />);

    expect(screen.getByTestId('container')).toContainElement(await screen.findByTestId('content'));
  });

  it('portals into a ref attached by an ancestor after the first render', async () => {
    function App() {
      const ref = React.useRef<HTMLDivElement>(null);
      return (
        <div
          ref={ref}
          data-testid='container'
        >
          <PortalProvider container={ref}>{renderOverlay(content)}</PortalProvider>
        </div>
      );
    }
    render(<App />);

    const node = await screen.findByTestId('content');
    expect(screen.getByTestId('container')).toContainElement(node);
    expect(node.closest('[data-floating-ui-portal]')?.parentElement).toBe(screen.getByTestId('container'));
  });

  it('portals into an element container', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<PortalProvider container={container}>{renderOverlay(content)}</PortalProvider>);

    expect(container).toContainElement(await screen.findByTestId('content'));
    container.remove();
  });

  it('waits for a container that is not ready yet', async () => {
    function App() {
      const [container, setContainer] = React.useState<HTMLElement | null>(null);
      return (
        <>
          <button
            type='button'
            onClick={() => setContainer(document.getElementById('late'))}
          />
          <div
            id='late'
            data-testid='container'
          />
          <PortalProvider container={container}>{renderOverlay(content)}</PortalProvider>
        </>
      );
    }
    render(<App />);

    expect(screen.queryByTestId('content')).toBeNull();
    screen.getByRole('button', { hidden: true }).click();
    await waitFor(() => expect(screen.getByTestId('container')).toContainElement(screen.getByTestId('content')));
  });

  it('waits for a ref container that renders later', async () => {
    function App() {
      const ref = React.useRef<HTMLDivElement>(null);
      const [shown, setShown] = React.useState(false);
      return (
        <>
          <button
            type='button'
            onClick={() => setShown(true)}
          />
          {shown && (
            <div
              ref={ref}
              data-testid='container'
            />
          )}
          <PortalProvider container={ref}>{renderOverlay(content)}</PortalProvider>
        </>
      );
    }
    render(<App />);

    expect(screen.queryByTestId('content')).toBeNull();
    screen.getByRole('button', { hidden: true }).click();
    await waitFor(() => expect(screen.getByTestId('container')).toContainElement(screen.getByTestId('content')));
  });

  it('uses the innermost provider', async () => {
    const outer = document.createElement('div');
    const inner = document.createElement('div');
    document.body.append(outer, inner);
    render(
      <PortalProvider container={outer}>
        <PortalProvider container={inner}>{renderOverlay(content)}</PortalProvider>
      </PortalProvider>,
    );

    expect(inner).toContainElement(await screen.findByTestId('content'));
    outer.remove();
    inner.remove();
  });

  it('lets an explicit root win over the provider', async () => {
    const provided = document.createElement('div');
    const explicit = document.createElement('div');
    document.body.append(provided, explicit);
    render(<PortalProvider container={provided}>{renderOverlay(content, explicit)}</PortalProvider>);

    expect(explicit).toContainElement(await screen.findByTestId('content'));
    provided.remove();
    explicit.remove();
  });
});

describe.each([
  ['menu', overlays[3][1]],
  ['select', overlays[4][1]],
])('%s nested in a dialog', (_name, renderOverlay) => {
  it("portals into the dialog's portal node, not the provider container", async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    render(
      <PortalProvider container={container}>
        <Dialog.Root defaultOpen>
          <Dialog.Portal>
            <div data-testid='dialog'>{renderOverlay(<div data-testid='nested' />)}</div>
          </Dialog.Portal>
        </Dialog.Root>
      </PortalProvider>,
    );

    const dialog = await screen.findByTestId('dialog');
    const nested = await screen.findByTestId('nested');
    const dialogPortalNode = dialog.closest('[data-floating-ui-portal]');
    expect(dialogPortalNode).not.toBeNull();
    expect(nested.closest('[data-floating-ui-portal]')?.parentElement).toBe(dialogPortalNode);
    expect(container).toContainElement(dialog);
    container.remove();
  });
});

describe('useGetPortalContainer', () => {
  function ContainerProbe(props: { onResolve: (container: HTMLElement | null | undefined) => void }): null {
    const getContainer = useGetPortalContainer();
    React.useEffect(() => {
      props.onResolve(getContainer?.());
    });
    return null;
  }

  it('returns undefined without a provider', () => {
    let resolved: HTMLElement | null | undefined = null;
    render(<ContainerProbe onResolve={value => (resolved = value)} />);

    expect(resolved).toBeUndefined();
  });

  it('returns the provider container inside a Mosaic portal', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    let resolved: HTMLElement | null | undefined;
    render(
      <PortalProvider container={container}>
        <Dialog.Root defaultOpen>
          <Dialog.Portal>
            <div data-testid='dialog'>
              <ContainerProbe onResolve={value => (resolved = value)} />
            </div>
          </Dialog.Portal>
        </Dialog.Root>
      </PortalProvider>,
    );

    await screen.findByTestId('dialog');
    expect(resolved).toBe(container);
    container.remove();
  });
});
