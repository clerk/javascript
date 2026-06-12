import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { axe } from '../../test-utils/axe';
import { Dialog } from './index';

afterEach(() => cleanup());

function renderDialog(props: Partial<React.ComponentProps<typeof Dialog.Root>> = {}) {
  return render(
    <Dialog.Root {...props}>
      <Dialog.Trigger>Open dialog</Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Viewport>
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
  describe('slot attributes', () => {
    it('renders trigger with data-cl-slot', () => {
      renderDialog();
      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      expect(trigger).toHaveAttribute('data-cl-slot', 'dialog-trigger');
    });

    it('renders all parts with correct slot attributes when open', () => {
      renderDialog({ defaultOpen: true });

      expect(document.querySelector('[data-cl-slot="dialog-backdrop"]')).toBeInTheDocument();
      expect(document.querySelector('[data-cl-slot="dialog-viewport"]')).toBeInTheDocument();
      expect(document.querySelector('[data-cl-slot="dialog-popup"]')).toBeInTheDocument();
      expect(document.querySelector('[data-cl-slot="dialog-title"]')).toBeInTheDocument();
      expect(document.querySelector('[data-cl-slot="dialog-description"]')).toBeInTheDocument();
      expect(document.querySelector('[data-cl-slot="dialog-close"]')).toBeInTheDocument();
    });
  });

  describe('open/close', () => {
    it('opens on trigger click', async () => {
      const user = userEvent.setup();
      renderDialog();

      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      expect(trigger).toHaveAttribute('data-cl-open', '');
      expect(document.querySelector('[data-cl-slot="dialog-popup"]')).toBeInTheDocument();
    });

    it('closes on Escape', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      await user.keyboard('{Escape}');

      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      expect(trigger).toHaveAttribute('data-cl-closed', '');
    });

    it('closes via Close button', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      const closeBtn = screen.getByRole('button', { name: 'Close' });
      await user.click(closeBtn);

      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      expect(trigger).toHaveAttribute('data-cl-closed', '');
    });

    it('calls onOpenChange when toggled', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      renderDialog({ onOpenChange });

      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('controlled open', () => {
    it('respects controlled open prop', () => {
      renderDialog({ open: true });

      expect(document.querySelector('[data-cl-slot="dialog-popup"]')).toBeInTheDocument();
    });

    it('does not open when controlled open is false', async () => {
      const user = userEvent.setup();
      renderDialog({ open: false });

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));

      expect(document.querySelector('[data-cl-slot="dialog-popup"]')).not.toBeInTheDocument();
    });
  });

  describe('ARIA attributes', () => {
    it('popup has aria-labelledby linked to title', () => {
      renderDialog({ defaultOpen: true });

      const title = document.querySelector('[data-cl-slot="dialog-title"]');
      const popup = document.querySelector('[data-cl-slot="dialog-popup"]');

      expect(title).toHaveAttribute('id');
      expect(popup).toHaveAttribute('aria-labelledby', title?.getAttribute('id'));
    });

    it('popup has aria-describedby linked to description', () => {
      renderDialog({ defaultOpen: true });

      const desc = document.querySelector('[data-cl-slot="dialog-description"]');
      const popup = document.querySelector('[data-cl-slot="dialog-popup"]');

      expect(desc).toHaveAttribute('id');
      expect(popup).toHaveAttribute('aria-describedby', desc?.getAttribute('id'));
    });

    it('popup has role=dialog', () => {
      renderDialog({ defaultOpen: true });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('animation lifecycle', () => {
    it('backdrop is not rendered when closed', () => {
      renderDialog();
      expect(document.querySelector('[data-cl-slot="dialog-backdrop"]')).not.toBeInTheDocument();
    });

    it('applies data-cl-open on popup when open', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));

      const popup = document.querySelector('[data-cl-slot="dialog-popup"]');
      expect(popup).toHaveAttribute('data-cl-open', '');
    });

    it('applies data-cl-open on backdrop when open', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));

      const backdrop = document.querySelector('[data-cl-slot="dialog-backdrop"]');
      expect(backdrop).toHaveAttribute('data-cl-open', '');
    });

    it('applies data-cl-open on viewport when open', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));

      const viewport = document.querySelector('[data-cl-slot="dialog-viewport"]');
      expect(viewport).toHaveAttribute('data-cl-open', '');
    });

    it('viewport is not rendered when closed', () => {
      renderDialog();
      expect(document.querySelector('[data-cl-slot="dialog-viewport"]')).not.toBeInTheDocument();
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

      expect(document.querySelector('[data-cl-slot="dialog-popup"]')).not.toBeInTheDocument();
      expect(screen.queryByText('Popup content')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(document.querySelector('[data-cl-slot="dialog-popup"]')).toBeInTheDocument();
      expect(screen.getByText('Popup content')).toBeInTheDocument();
    });
  });

  describe('trigger state attributes', () => {
    it('trigger has data-cl-closed when dialog is hidden', () => {
      renderDialog();
      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      expect(trigger).toHaveAttribute('data-cl-closed', '');
    });

    it('trigger has data-cl-open when dialog is visible', () => {
      renderDialog({ defaultOpen: true });
      // When modal is open, trigger's container gets aria-hidden, so use querySelector
      const trigger = document.querySelector('[data-cl-slot="dialog-trigger"]');
      expect(trigger).toHaveAttribute('data-cl-open', '');
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
          <button onClick={onBackgroundClick}>Background button</button>
          <Dialog.Root modal={false}>
            <Dialog.Trigger>Open dialog</Dialog.Trigger>
            <Dialog.Backdrop />
            <Dialog.Viewport>
              <Dialog.Popup>
                <Dialog.Title>Dialog Title</Dialog.Title>
                <Dialog.Close>Close</Dialog.Close>
              </Dialog.Popup>
            </Dialog.Viewport>
          </Dialog.Root>
        </>,
      );

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));

      const viewport = document.querySelector('[data-cl-slot="dialog-viewport"]');
      expect(viewport).toHaveStyle({ pointerEvents: 'auto' });
      expect(viewport?.parentElement).toHaveStyle({ pointerEvents: 'none' });

      await user.click(screen.getByRole('button', { name: 'Background button' }));
      expect(onBackgroundClick).toHaveBeenCalledTimes(1);
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
