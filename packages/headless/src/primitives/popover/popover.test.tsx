import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { axe } from '../../test-utils/axe';
import { Popover } from './index';

afterEach(() => cleanup());

function renderPopover(props: Partial<React.ComponentProps<typeof Popover.Root>> = {}) {
  return render(
    <Popover.Root {...props}>
      <Popover.Trigger>Open popover</Popover.Trigger>
      <Popover.Positioner>
        <Popover.Popup>
          <Popover.Title>Popover Title</Popover.Title>
          <Popover.Description>Some description</Popover.Description>
          <p>Popover content</p>
          <Popover.Close>Close</Popover.Close>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Root>,
  );
}

describe('Popover', () => {
  describe('slot attributes', () => {
    it('renders trigger with data-cl-slot', () => {
      renderPopover();
      const trigger = screen.getByRole('button', { name: 'Open popover' });
      expect(trigger).toHaveAttribute('data-cl-slot', 'popover-trigger');
    });

    it('renders all parts with correct slot attributes when open', () => {
      renderPopover({ defaultOpen: true });

      expect(document.querySelector('[data-cl-slot="popover-positioner"]')).toBeInTheDocument();
      expect(document.querySelector('[data-cl-slot="popover-popup"]')).toBeInTheDocument();
      expect(document.querySelector('[data-cl-slot="popover-title"]')).toBeInTheDocument();
      expect(document.querySelector('[data-cl-slot="popover-description"]')).toBeInTheDocument();
      expect(document.querySelector('[data-cl-slot="popover-close"]')).toBeInTheDocument();
    });
  });

  describe('open/close', () => {
    it('opens on trigger click', async () => {
      const user = userEvent.setup();
      renderPopover();

      const trigger = screen.getByRole('button', { name: 'Open popover' });
      await user.click(trigger);

      expect(trigger).toHaveAttribute('data-cl-open', '');
      expect(document.querySelector('[data-cl-slot="popover-popup"]')).toBeInTheDocument();
    });

    it('closes on trigger click when open', async () => {
      const user = userEvent.setup();
      renderPopover();

      const trigger = screen.getByRole('button', { name: 'Open popover' });
      await user.click(trigger);
      await user.click(trigger);

      expect(trigger).toHaveAttribute('data-cl-closed', '');
    });

    it('closes on Escape', async () => {
      const user = userEvent.setup();
      renderPopover({ defaultOpen: true });

      await user.keyboard('{Escape}');

      const trigger = screen.getByRole('button', { name: 'Open popover' });
      expect(trigger).toHaveAttribute('data-cl-closed', '');
    });

    it('closes via Close button', async () => {
      const user = userEvent.setup();
      renderPopover({ defaultOpen: true });

      const closeBtn = screen.getByRole('button', { name: 'Close' });
      await user.click(closeBtn);

      const trigger = screen.getByRole('button', { name: 'Open popover' });
      expect(trigger).toHaveAttribute('data-cl-closed', '');
    });

    it('calls onOpenChange when toggled', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      renderPopover({ onOpenChange });

      const trigger = screen.getByRole('button', { name: 'Open popover' });
      await user.click(trigger);

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('closes on outside click', async () => {
      const user = userEvent.setup();
      renderPopover({ defaultOpen: true });

      expect(document.querySelector('[data-cl-slot="popover-popup"]')).toBeInTheDocument();

      await user.click(document.body);

      expect(document.querySelector('[data-cl-slot="popover-popup"]')).not.toBeInTheDocument();
    });
  });

  describe('controlled open', () => {
    it('respects controlled open prop', () => {
      renderPopover({ open: true });

      expect(document.querySelector('[data-cl-slot="popover-positioner"]')).toBeInTheDocument();
    });

    it('does not open when controlled open is false', async () => {
      const user = userEvent.setup();
      renderPopover({ open: false });

      await user.click(screen.getByRole('button', { name: 'Open popover' }));

      expect(document.querySelector('[data-cl-slot="popover-positioner"]')).not.toBeInTheDocument();
    });
  });

  describe('ARIA attributes', () => {
    it('positioner has aria-labelledby linked to title', () => {
      renderPopover({ defaultOpen: true });

      const title = document.querySelector('[data-cl-slot="popover-title"]');
      const positioner = document.querySelector('[data-cl-slot="popover-positioner"]');

      expect(title).toHaveAttribute('id');
      expect(positioner).toHaveAttribute('aria-labelledby', title?.getAttribute('id'));
    });

    it('positioner has aria-describedby linked to description', () => {
      renderPopover({ defaultOpen: true });

      const desc = document.querySelector('[data-cl-slot="popover-description"]');
      const positioner = document.querySelector('[data-cl-slot="popover-positioner"]');

      expect(desc).toHaveAttribute('id');
      expect(positioner).toHaveAttribute('aria-describedby', desc?.getAttribute('id'));
    });

    it('trigger has role=button', () => {
      renderPopover();
      expect(screen.getByRole('button', { name: 'Open popover' })).toBeInTheDocument();
    });

    it('keeps positioner aria-labelledby/aria-describedby wired to the correct elements', () => {
      // The primitive owns the ids on Title and Description (id is omitted from
      // their public props) — the aria pairing must always resolve correctly.
      renderPopover({ defaultOpen: true });

      const title = document.querySelector('[data-cl-slot="popover-title"]');
      const desc = document.querySelector('[data-cl-slot="popover-description"]');
      const positioner = document.querySelector('[data-cl-slot="popover-positioner"]');

      expect(positioner).toHaveAttribute('aria-labelledby', title?.getAttribute('id'));
      expect(positioner).toHaveAttribute('aria-describedby', desc?.getAttribute('id'));
      expect(title).toHaveTextContent('Popover Title');
      expect(desc).toHaveTextContent('Some description');
    });
  });

  describe('animation lifecycle', () => {
    it('positioner is not rendered when closed', () => {
      renderPopover();
      expect(document.querySelector('[data-cl-slot="popover-positioner"]')).not.toBeInTheDocument();
    });

    it('applies data-cl-open on popup when open', async () => {
      const user = userEvent.setup();
      renderPopover();

      await user.click(screen.getByRole('button', { name: 'Open popover' }));

      const popup = document.querySelector('[data-cl-slot="popover-popup"]');
      expect(popup).toHaveAttribute('data-cl-open', '');
    });

    it('positioner has data-cl-side', async () => {
      const user = userEvent.setup();
      renderPopover();

      await user.click(screen.getByRole('button', { name: 'Open popover' }));

      const positioner = document.querySelector('[data-cl-slot="popover-positioner"]');
      expect(positioner).toHaveAttribute('data-cl-side');
    });
  });

  describe('content rendering', () => {
    it('renders children content when open', async () => {
      const user = userEvent.setup();
      renderPopover();

      await user.click(screen.getByRole('button', { name: 'Open popover' }));

      expect(screen.getByText('Popover content')).toBeInTheDocument();
      expect(screen.getByText('Popover Title')).toBeInTheDocument();
      expect(screen.getByText('Some description')).toBeInTheDocument();
    });
  });

  describe('placement', () => {
    it('accepts custom placement', () => {
      renderPopover({ defaultOpen: true, placement: 'top-start' });

      const positioner = document.querySelector('[data-cl-slot="popover-positioner"]');
      expect(positioner).toHaveAttribute('data-cl-side', 'top');
    });

    it('defaults to bottom placement', () => {
      renderPopover({ defaultOpen: true });

      const positioner = document.querySelector('[data-cl-slot="popover-positioner"]');
      expect(positioner).toHaveAttribute('data-cl-side', 'bottom');
    });
  });

  describe('focus management', () => {
    it('moves focus into popover on open', async () => {
      const user = userEvent.setup();
      renderPopover();

      await user.click(screen.getByRole('button', { name: 'Open popover' }));
      // FloatingFocusManager schedules focus via requestAnimationFrame
      await new Promise(r => requestAnimationFrame(r));

      const positioner = document.querySelector('[data-cl-slot="popover-positioner"]');
      expect(positioner?.contains(document.activeElement)).toBe(true);
    });

    it('returns focus to trigger on close via Escape', async () => {
      const user = userEvent.setup();
      renderPopover();

      const trigger = screen.getByRole('button', { name: 'Open popover' });
      await user.click(trigger);
      await user.keyboard('{Escape}');

      expect(document.activeElement).toBe(trigger);
    });

    it('returns focus to trigger on close via Close button', async () => {
      const user = userEvent.setup();
      renderPopover();

      const trigger = screen.getByRole('button', { name: 'Open popover' });
      await user.click(trigger);

      await user.click(screen.getByRole('button', { name: 'Close' }));

      expect(document.activeElement).toBe(trigger);
    });
  });

  describe('accessibility (axe)', () => {
    it('has no violations when closed', async () => {
      const { container } = renderPopover();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations when open', async () => {
      renderPopover({ defaultOpen: true });
      expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
    });
  });

  describe('consumer ref forwarding', () => {
    it('forwards a consumer ref on Trigger (host button shape)', () => {
      const ref = createRef<HTMLButtonElement>();
      render(
        <Popover.Root>
          <Popover.Trigger ref={ref}>Open popover</Popover.Trigger>
        </Popover.Root>,
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current).toHaveAttribute('data-cl-slot', 'popover-trigger');
    });

    it('forwards a consumer ref on Positioner (FloatingFocusManager wrapper shape)', () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <Popover.Root defaultOpen>
          <Popover.Trigger>Open popover</Popover.Trigger>
          <Popover.Positioner ref={ref}>
            <Popover.Popup>content</Popover.Popup>
          </Popover.Positioner>
        </Popover.Root>,
      );

      expect(ref.current).toHaveAttribute('data-cl-slot', 'popover-positioner');
    });
  });

  describe('Arrow ref', () => {
    it('merges a consumer ref with the internal arrow ref', () => {
      const ref = createRef<SVGSVGElement>();
      render(
        <Popover.Root defaultOpen>
          <Popover.Trigger>Open popover</Popover.Trigger>
          <Popover.Positioner>
            <Popover.Popup>
              <Popover.Arrow ref={ref} />
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Root>,
      );

      expect(ref.current).not.toBeNull();
      expect(ref.current).toHaveAttribute('data-cl-slot', 'popover-arrow');
    });
  });
});
