import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { axe } from '../../test-utils/axe';
import { Popover } from '../popover';
import { Dialog } from './index';

afterEach(() => cleanup());

// Headless parts no longer emit `data-cl-slot` — slot identity is applied by the styled
// (mosaic) layer. Tests locate the surface-only parts (backdrop, viewport, trigger) via
// `data-testid` and everything else via its accessible role or text.
function renderDialog(props: Partial<React.ComponentProps<typeof Dialog.Root>> = {}) {
  return render(
    <Dialog.Root {...props}>
      <Dialog.Trigger data-testid='dialog-trigger'>Open dialog</Dialog.Trigger>
      <Dialog.Backdrop data-testid='dialog-backdrop' />
      <Dialog.Viewport data-testid='dialog-viewport'>
        <Dialog.Popup>
          <Dialog.Title>Dialog Title</Dialog.Title>
          <Dialog.Description>Some dialog description</Dialog.Description>
          <p>Dialog body content</p>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Viewport>
    </Dialog.Root>,
  );
}

describe('Dialog', () => {
  describe('open/close', () => {
    it('opens on trigger click', async () => {
      const user = userEvent.setup();
      renderDialog();

      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      expect(trigger).toHaveAttribute('data-open', '');
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('closes on Escape', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      await user.keyboard('{Escape}');

      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      expect(trigger).toHaveAttribute('data-closed', '');
    });

    it('closes via Close button', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      const closeBtn = screen.getByRole('button', { name: 'Close' });
      await user.click(closeBtn);

      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      expect(trigger).toHaveAttribute('data-closed', '');
    });

    it('calls onOpenChange with details naming the trigger', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      renderDialog({ onOpenChange });

      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      expect(onOpenChange).toHaveBeenCalledWith(
        true,
        expect.objectContaining({ trigger, triggerId: expect.any(String) }),
      );
    });

    it('calls onOpenChange with a null trigger on dismissal', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true, onOpenChange });

      await user.keyboard('{Escape}');

      expect(onOpenChange).toHaveBeenCalledWith(false, expect.objectContaining({ trigger: null, triggerId: null }));
    });
  });

  describe('controlled open', () => {
    it('respects controlled open prop', () => {
      renderDialog({ open: true });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not open when controlled open is false', async () => {
      const user = userEvent.setup();
      renderDialog({ open: false });

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('ARIA attributes', () => {
    it('popup has aria-labelledby linked to title', () => {
      renderDialog({ defaultOpen: true });

      const title = screen.getByText('Dialog Title');
      const popup = screen.getByRole('dialog');

      expect(title).toHaveAttribute('id');
      expect(popup).toHaveAttribute('aria-labelledby', title.getAttribute('id'));
    });

    it('popup has aria-describedby linked to description', () => {
      renderDialog({ defaultOpen: true });

      const desc = screen.getByText('Some dialog description');
      const popup = screen.getByRole('dialog');

      expect(desc).toHaveAttribute('id');
      expect(popup).toHaveAttribute('aria-describedby', desc.getAttribute('id'));
    });

    it('popup has role=dialog', () => {
      renderDialog({ defaultOpen: true });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('animation lifecycle', () => {
    it('backdrop is not rendered when closed', () => {
      renderDialog();
      expect(screen.queryByTestId('dialog-backdrop')).not.toBeInTheDocument();
    });

    it('applies data-open on popup when open', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));

      expect(screen.getByRole('dialog')).toHaveAttribute('data-open', '');
    });

    it('applies data-open on backdrop when open', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));

      expect(screen.getByTestId('dialog-backdrop')).toHaveAttribute('data-open', '');
    });

    it('applies data-open on viewport when open', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));

      expect(screen.getByTestId('dialog-viewport')).toHaveAttribute('data-open', '');
    });

    it('viewport is not rendered when closed', () => {
      renderDialog();
      expect(screen.queryByTestId('dialog-viewport')).not.toBeInTheDocument();
    });
  });

  describe('content rendering', () => {
    it('renders children content when open', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));

      expect(screen.getByText('Dialog body content')).toBeInTheDocument();
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      expect(screen.getByText('Some dialog description')).toBeInTheDocument();
    });

    it('does not render content when closed', () => {
      renderDialog();
      expect(screen.queryByText('Dialog body content')).not.toBeInTheDocument();
    });

    it('does not render popup when closed and Portal is omitted', async () => {
      const user = userEvent.setup();
      render(
        <Dialog.Root>
          <Dialog.Trigger>Open</Dialog.Trigger>
          <Dialog.Popup>
            <p>Popup content</p>
          </Dialog.Popup>
        </Dialog.Root>,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText('Popup content')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Popup content')).toBeInTheDocument();
    });

    it('renders a part into an element passed to `render`', () => {
      function Title({ children, ...props }: { children?: React.ReactNode }) {
        return <h3 {...props}>{children}</h3>;
      }

      render(
        <Dialog.Root defaultOpen>
          <Dialog.Popup>
            <Dialog.Title render={<Title />}>Element title</Dialog.Title>
          </Dialog.Popup>
        </Dialog.Root>,
      );

      const title = screen.getByRole('heading', { name: 'Element title' });
      expect(title.tagName).toBe('H3');
      expect(title).toHaveAttribute('id');
    });
  });

  describe('trigger state attributes', () => {
    it('trigger has data-closed when dialog is hidden', () => {
      renderDialog();
      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      expect(trigger).toHaveAttribute('data-closed', '');
    });

    it('trigger has data-open when dialog is visible', () => {
      renderDialog({ defaultOpen: true });
      // When modal is open, the trigger's container gets aria-hidden, so query by test id.
      const trigger = screen.getByTestId('dialog-trigger');
      expect(trigger).toHaveAttribute('data-open', '');
    });
  });

  describe('modal behavior', () => {
    it('defaults to modal=true', () => {
      renderDialog({ defaultOpen: true });
      // Modal dialog should have role=dialog (already tested)
      // Focus should be trapped inside the dialog
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('non-modal dialog allows background interaction', async () => {
      const onBackgroundClick = vi.fn();
      const user = userEvent.setup();
      render(
        <>
          <button
            type='button'
            onClick={onBackgroundClick}
          >
            Background button
          </button>
          <Dialog.Root modal={false}>
            <Dialog.Trigger>Open dialog</Dialog.Trigger>
            <Dialog.Backdrop />
            <Dialog.Viewport data-testid='dialog-viewport'>
              <Dialog.Popup>
                <Dialog.Title>Dialog Title</Dialog.Title>
                <Dialog.Close>Close</Dialog.Close>
              </Dialog.Popup>
            </Dialog.Viewport>
          </Dialog.Root>
        </>,
      );

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));

      const viewport = screen.getByTestId('dialog-viewport');
      expect(viewport).toHaveStyle({ pointerEvents: 'auto' });
      expect(viewport.parentElement).toHaveStyle({ pointerEvents: 'none' });

      await user.click(screen.getByRole('button', { name: 'Background button' }));
      expect(onBackgroundClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('closedBy', () => {
    // The viewport is the element outside the popup that a light dismiss lands on.
    const pressOutside = async (user: ReturnType<typeof userEvent.setup>) =>
      user.click(screen.getByTestId('dialog-viewport'));

    it('defaults to dismissing on both Escape and outside press', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      await pressOutside(user);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closerequest dismisses on Escape but not outside press', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true, closedBy: 'closerequest' });

      await pressOutside(user);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('none dismisses on neither', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true, closedBy: 'none' });

      await pressOutside(user);
      await user.keyboard('{Escape}');

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('leaves the Close button working regardless of closedBy', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true, closedBy: 'none' });

      await user.click(screen.getByRole('button', { name: 'Close' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('leaves controlled open authoritative regardless of closedBy', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      renderDialog({ open: true, closedBy: 'none', onOpenChange });

      await pressOutside(user);
      await user.keyboard('{Escape}');

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('focus management', () => {
    it('moves focus into dialog on open', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));
      // FloatingFocusManager schedules focus via requestAnimationFrame
      await new Promise(r => requestAnimationFrame(r));

      const dialog = screen.getByRole('dialog');
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    it('returns focus to trigger on close via Escape', async () => {
      const user = userEvent.setup();
      renderDialog();

      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);
      await user.keyboard('{Escape}');

      expect(document.activeElement).toBe(trigger);
    });

    it('returns focus to trigger on close via Close button', async () => {
      const user = userEvent.setup();
      renderDialog();

      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      await user.click(screen.getByRole('button', { name: 'Close' }));

      expect(document.activeElement).toBe(trigger);
    });
  });

  describe('detached triggers (createHandle)', () => {
    it('opens a root from a trigger rendered outside it', async () => {
      const user = userEvent.setup();
      const handle = Dialog.createHandle();
      render(
        <>
          <Dialog.Trigger handle={handle}>Open detached</Dialog.Trigger>
          <Dialog.Root handle={handle}>
            <Dialog.Popup>
              <Dialog.Title>Detached</Dialog.Title>
              <Dialog.Close>Close</Dialog.Close>
            </Dialog.Popup>
          </Dialog.Root>
        </>,
      );

      const trigger = screen.getByRole('button', { name: 'Open detached' });
      expect(trigger).toHaveAttribute('data-closed', '');

      await user.click(trigger);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      // Queried by text: the open modal marks everything outside itself inert.
      expect(screen.getByText('Open detached')).toHaveAttribute('data-open', '');
    });

    it('returns focus to the detached trigger on Escape', async () => {
      const user = userEvent.setup();
      const handle = Dialog.createHandle();
      render(
        <>
          <Dialog.Trigger handle={handle}>Open detached</Dialog.Trigger>
          <Dialog.Root handle={handle}>
            <Dialog.Popup>
              <Dialog.Title>Detached</Dialog.Title>
              <Dialog.Close>Close</Dialog.Close>
            </Dialog.Popup>
          </Dialog.Root>
        </>,
      );

      const trigger = screen.getByRole('button', { name: 'Open detached' });
      await user.click(trigger);
      await user.keyboard('{Escape}');

      expect(document.activeElement).toBe(trigger);
    });

    it('supports imperative open and close, ignored while no root is attached', () => {
      const handle = Dialog.createHandle();

      // No root mounted: ignored, no crash.
      handle.open();
      expect(handle.isOpen).toBe(false);

      render(
        <Dialog.Root handle={handle}>
          <Dialog.Popup>
            <Dialog.Title>Imperative</Dialog.Title>
          </Dialog.Popup>
        </Dialog.Root>,
      );

      act(() => handle.open());
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(handle.isOpen).toBe(true);

      act(() => handle.close());
      expect(handle.isOpen).toBe(false);
    });
  });

  describe('multiple triggers and payload', () => {
    function renderMultiTrigger(rootProps: Partial<React.ComponentProps<typeof Dialog.Root<string>>> = {}) {
      const handle = Dialog.createHandle<string>();
      render(
        <>
          <Dialog.Trigger
            handle={handle}
            id='trigger-a'
            payload='payload-a'
          >
            Open A
          </Dialog.Trigger>
          <Dialog.Trigger
            handle={handle}
            id='trigger-b'
            payload='payload-b'
          >
            Open B
          </Dialog.Trigger>
          <Dialog.Root
            handle={handle}
            {...rootProps}
          >
            {({ payload }) => (
              <Dialog.Popup>
                <Dialog.Title>{payload ?? 'no payload'}</Dialog.Title>
                <Dialog.Close>Close</Dialog.Close>
              </Dialog.Popup>
            )}
          </Dialog.Root>
        </>,
      );
      return handle;
    }

    it('renders per-trigger content from the payload', async () => {
      const user = userEvent.setup();
      renderMultiTrigger();

      await user.click(screen.getByRole('button', { name: 'Open A' }));
      expect(screen.getByRole('dialog', { name: 'payload-a' })).toBeInTheDocument();

      await user.keyboard('{Escape}');
      await user.click(screen.getByRole('button', { name: 'Open B' }));
      expect(screen.getByRole('dialog', { name: 'payload-b' })).toBeInTheDocument();
    });

    it('attributes the open to the activated trigger only', async () => {
      const user = userEvent.setup();
      renderMultiTrigger();

      await user.click(screen.getByRole('button', { name: 'Open A' }));

      // Queried by text: the open modal marks everything outside itself inert.
      expect(screen.getByText('Open A')).toHaveAttribute('data-open', '');
      expect(screen.getByText('Open B')).toHaveAttribute('data-closed', '');
    });

    it('reports the activated trigger id through onOpenChange details', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      renderMultiTrigger({ onOpenChange });

      await user.click(screen.getByRole('button', { name: 'Open B' }));

      expect(onOpenChange).toHaveBeenCalledWith(true, expect.objectContaining({ triggerId: 'trigger-b' }));
    });

    it('resolves the payload from a controlled triggerId on programmatic open', () => {
      renderMultiTrigger({ open: true, triggerId: 'trigger-b' });

      expect(screen.getByRole('dialog', { name: 'payload-b' })).toBeInTheDocument();
    });
  });

  describe('initialFocus', () => {
    type InitialFocus = React.ComponentProps<typeof Dialog.Popup>['initialFocus'];

    function InitialFocusFixture({
      initialFocus,
      useInputRef,
    }: {
      initialFocus?: InitialFocus;
      useInputRef?: boolean;
    }) {
      const inputRef = React.useRef<HTMLInputElement | null>(null);
      return (
        <Dialog.Root>
          <Dialog.Trigger>Open dialog</Dialog.Trigger>
          <Dialog.Popup initialFocus={useInputRef ? inputRef : initialFocus}>
            <Dialog.Title>Title</Dialog.Title>
            <button type='button'>First</button>
            <input
              ref={inputRef}
              aria-label='Name'
            />
          </Dialog.Popup>
        </Dialog.Root>
      );
    }

    const settleFocus = () => new Promise(r => requestAnimationFrame(r));

    it('focuses a ref target instead of the first tabbable', async () => {
      const user = userEvent.setup();
      render(<InitialFocusFixture useInputRef />);

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));
      await settleFocus();

      expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Name' }));
    });

    it('does not move focus when false', async () => {
      const user = userEvent.setup();
      render(<InitialFocusFixture initialFocus={false} />);

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));
      await settleFocus();

      expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(false);
    });

    it('passes the interaction type to a function form', async () => {
      const user = userEvent.setup();
      const initialFocus = vi.fn(() => undefined);
      render(<InitialFocusFixture initialFocus={initialFocus} />);

      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      trigger.focus();
      await user.keyboard('{Enter}');
      await settleFocus();

      expect(initialFocus).toHaveBeenCalledWith('keyboard');
    });
  });

  describe('finalFocus', () => {
    type FinalFocus = React.ComponentProps<typeof Dialog.Popup>['finalFocus'];

    function FinalFocusFixture({ finalFocus, useTargetRef }: { finalFocus?: FinalFocus; useTargetRef?: boolean }) {
      const targetRef = React.useRef<HTMLButtonElement | null>(null);
      return (
        <>
          <button
            type='button'
            ref={targetRef}
          >
            Elsewhere
          </button>
          <Dialog.Root>
            <Dialog.Trigger>Open dialog</Dialog.Trigger>
            <Dialog.Popup finalFocus={useTargetRef ? targetRef : finalFocus}>
              <Dialog.Title>Title</Dialog.Title>
              <Dialog.Close>Close</Dialog.Close>
            </Dialog.Popup>
          </Dialog.Root>
        </>
      );
    }

    it('restores focus to a ref target on close', async () => {
      const user = userEvent.setup();
      render(<FinalFocusFixture useTargetRef />);

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));
      await user.keyboard('{Escape}');

      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Elsewhere' }));
    });

    it('resolves a function form with the close interaction type', async () => {
      const user = userEvent.setup();
      const finalFocus = vi.fn(() => undefined);
      render(<FinalFocusFixture finalFocus={finalFocus} />);

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));
      await user.keyboard('{Escape}');

      expect(finalFocus).toHaveBeenCalledWith('keyboard');
      // Default behaviour on `undefined`: back to the trigger.
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open dialog' }));
    });

    it('resolves the function form with the forwarded interaction type on Close press', async () => {
      const user = userEvent.setup();
      const finalFocus = vi.fn(() => undefined);
      render(<FinalFocusFixture finalFocus={finalFocus} />);

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));
      await user.click(screen.getByRole('button', { name: 'Close' }));

      expect(finalFocus).toHaveBeenCalledWith('mouse');
      // A Close press is not a dismissal, so the default still returns focus to the trigger.
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open dialog' }));
    });

    it('resolves the function form with an empty type on programmatic close', () => {
      const handle = Dialog.createHandle();
      const finalFocus = vi.fn(() => undefined);
      render(
        <Dialog.Root
          handle={handle}
          defaultOpen
        >
          <Dialog.Popup finalFocus={finalFocus}>
            <Dialog.Title>Title</Dialog.Title>
          </Dialog.Popup>
        </Dialog.Root>,
      );

      act(() => handle.close());

      expect(finalFocus).toHaveBeenCalledWith('');
    });
  });

  describe('role', () => {
    it('renders role=alertdialog when asked', () => {
      renderDialog({ defaultOpen: true, role: 'alertdialog' });

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('stacking', () => {
    // Two dialogs, the inner one rendered inside the outer's popup. `outer`/`inner` prefixes on
    // the test ids because both levels render the same parts.
    function renderStack({ outerOpen = true, innerOpen = true }: { outerOpen?: boolean; innerOpen?: boolean } = {}) {
      return render(
        <Dialog.Root open={outerOpen}>
          <Dialog.Backdrop data-testid='outer-backdrop' />
          <Dialog.Viewport>
            <Dialog.Popup data-testid='outer-popup'>
              <Dialog.Title>Outer</Dialog.Title>
              <Dialog.Root open={innerOpen}>
                <Dialog.Backdrop data-testid='inner-backdrop' />
                <Dialog.Viewport>
                  <Dialog.Popup data-testid='inner-popup'>
                    <Dialog.Title>Inner</Dialog.Title>
                  </Dialog.Popup>
                </Dialog.Viewport>
              </Dialog.Root>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Root>,
      );
    }

    it('marks the dialog on top stacked and the one beneath a stack base', () => {
      renderStack();

      expect(screen.getByTestId('inner-popup')).toHaveAttribute('data-stacked', '');
      expect(screen.getByTestId('inner-popup')).not.toHaveAttribute('data-stack-base');
      expect(screen.getByTestId('outer-popup')).toHaveAttribute('data-stack-base', '');
      expect(screen.getByTestId('outer-popup')).not.toHaveAttribute('data-stacked');
    });

    it('marks the stacked backdrop, so only one scrim in the stack paints', () => {
      renderStack();

      expect(screen.getByTestId('inner-backdrop')).toHaveAttribute('data-stacked', '');
      expect(screen.getByTestId('outer-backdrop')).not.toHaveAttribute('data-stacked');
    });

    it('drops the stack base marking when the dialog on top closes', () => {
      const { rerender } = renderStack();
      expect(screen.getByTestId('outer-popup')).toHaveAttribute('data-stack-base', '');

      rerender(
        <Dialog.Root open>
          <Dialog.Viewport>
            <Dialog.Popup data-testid='outer-popup'>
              <Dialog.Title>Outer</Dialog.Title>
              <Dialog.Root open={false}>
                <Dialog.Viewport>
                  <Dialog.Popup data-testid='inner-popup'>
                    <Dialog.Title>Inner</Dialog.Title>
                  </Dialog.Popup>
                </Dialog.Viewport>
              </Dialog.Root>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Root>,
      );

      expect(screen.getByTestId('outer-popup')).not.toHaveAttribute('data-stack-base');
    });

    it('is not stacked on a dialog that is closed', () => {
      // A confirmation root mounted beside its dialog's portal is inside the root but outlives
      // the open state; on its own it owns the scrim like any root-level dialog.
      render(
        <Dialog.Root open={false}>
          <Dialog.Root open>
            <Dialog.Backdrop data-testid='inner-backdrop' />
            <Dialog.Viewport>
              <Dialog.Popup data-testid='inner-popup'>
                <Dialog.Title>Inner</Dialog.Title>
              </Dialog.Popup>
            </Dialog.Viewport>
          </Dialog.Root>
        </Dialog.Root>,
      );

      expect(screen.getByTestId('inner-popup')).not.toHaveAttribute('data-stacked');
      expect(screen.getByTestId('inner-backdrop')).not.toHaveAttribute('data-stacked');
    });

    it('marks the middle of a three-deep stack as both', () => {
      render(
        <Dialog.Root open>
          <Dialog.Viewport>
            <Dialog.Popup data-testid='bottom-popup'>
              <Dialog.Title>Bottom</Dialog.Title>
              <Dialog.Root open>
                <Dialog.Viewport>
                  <Dialog.Popup data-testid='middle-popup'>
                    <Dialog.Title>Middle</Dialog.Title>
                    <Dialog.Root open>
                      <Dialog.Viewport>
                        <Dialog.Popup data-testid='top-popup'>
                          <Dialog.Title>Top</Dialog.Title>
                        </Dialog.Popup>
                      </Dialog.Viewport>
                    </Dialog.Root>
                  </Dialog.Popup>
                </Dialog.Viewport>
              </Dialog.Root>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Root>,
      );

      const middle = screen.getByTestId('middle-popup');
      expect(middle).toHaveAttribute('data-stacked', '');
      expect(middle).toHaveAttribute('data-stack-base', '');
      expect(screen.getByTestId('bottom-popup')).not.toHaveAttribute('data-stacked');
      expect(screen.getByTestId('top-popup')).not.toHaveAttribute('data-stack-base');
    });

    it('does not treat a floating but non-dialog ancestor as a stack', async () => {
      // The distinction `data-nested` cannot make: a dialog opened from a popover has a floating
      // ancestor, but it sits on the bare page and still owns its scrim.
      const user = userEvent.setup();
      render(
        <Popover.Root>
          <Popover.Trigger>Open popover</Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner>
              <Popover.Popup>
                <Dialog.Root>
                  <Dialog.Trigger>Open dialog</Dialog.Trigger>
                  <Dialog.Backdrop data-testid='dialog-backdrop' />
                  <Dialog.Viewport>
                    <Dialog.Popup data-testid='dialog-popup'>
                      <Dialog.Title>Dialog in a popover</Dialog.Title>
                    </Dialog.Popup>
                  </Dialog.Viewport>
                </Dialog.Root>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>,
      );

      await user.click(screen.getByRole('button', { name: 'Open popover' }));
      await user.click(screen.getByRole('button', { name: 'Open dialog' }));

      const popup = screen.getByTestId('dialog-popup');
      expect(popup).toHaveAttribute('data-nested', '');
      expect(popup).not.toHaveAttribute('data-stacked');
      expect(screen.getByTestId('dialog-backdrop')).not.toHaveAttribute('data-stacked');
    });
  });

  describe('accessibility (axe)', () => {
    it('has no violations when closed', async () => {
      const { container } = renderDialog();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations when open', async () => {
      renderDialog({ defaultOpen: true });
      // aria-command-name: FloatingFocusManager injects focus guard spans
      // with role="button" but no label — this is internal to floating-ui.
      // aria-hidden-focus: FloatingFocusManager marks the trigger inert when
      // modal is open — axe flags the still-focusable button, but this is the
      // intended Floating UI pattern for modal focus trapping.
      expect(
        await axe(document.body, {
          rules: {
            region: { enabled: false },
            'aria-command-name': { enabled: false },
            'aria-hidden-focus': { enabled: false },
          },
        }),
      ).toHaveNoViolations();
    });
  });
});
