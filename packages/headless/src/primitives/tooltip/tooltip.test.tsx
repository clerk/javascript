import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from '../../test-utils/axe';
import { Tooltip } from './tooltip';

afterEach(() => cleanup());

function renderTooltip(props: Partial<React.ComponentProps<typeof Tooltip>> = {}) {
  return render(
    <Tooltip
      delay={0}
      {...props}
    >
      <Tooltip.Trigger>Hover me</Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Popup>Tooltip content</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip>,
  );
}

describe('Tooltip', () => {
  describe('slot attributes', () => {
    it('renders trigger with data-cl-slot', () => {
      renderTooltip();
      const trigger = screen.getByRole('button', { name: 'Hover me' });
      expect(trigger).toHaveAttribute('data-cl-slot', 'tooltip-trigger');
    });

    it('renders all parts with correct slot attributes when open', () => {
      renderTooltip({ defaultOpen: true });

      expect(document.querySelector('[data-cl-slot="tooltip-positioner"]')).toBeInTheDocument();
      expect(document.querySelector('[data-cl-slot="tooltip-popup"]')).toBeInTheDocument();
    });
  });

  describe('open/close', () => {
    it('opens on hover', async () => {
      const user = userEvent.setup();
      renderTooltip();

      const trigger = screen.getByRole('button', { name: 'Hover me' });
      await user.hover(trigger);

      expect(document.querySelector('[data-cl-slot="tooltip-popup"]')).toBeInTheDocument();
    });

    it('closes on unhover', async () => {
      const user = userEvent.setup();
      renderTooltip();

      const trigger = screen.getByRole('button', { name: 'Hover me' });
      await user.hover(trigger);

      expect(document.querySelector('[data-cl-slot="tooltip-popup"]')).toBeInTheDocument();

      await user.unhover(trigger);

      const triggerEl = screen.getByRole('button', { name: 'Hover me' });
      expect(triggerEl).toHaveAttribute('data-cl-closed', '');
    });

    it('opens on focus', async () => {
      const user = userEvent.setup();
      renderTooltip();

      const trigger = screen.getByRole('button', { name: 'Hover me' });
      await act(async () => {
        trigger.focus();
      });

      expect(document.querySelector('[data-cl-slot="tooltip-popup"]')).toBeInTheDocument();
    });

    it('closes on Escape', async () => {
      const user = userEvent.setup();
      renderTooltip({ defaultOpen: true });

      await user.keyboard('{Escape}');

      const trigger = screen.getByRole('button', { name: 'Hover me' });
      expect(trigger).toHaveAttribute('data-cl-closed', '');
    });

    it('calls onOpenChange when toggled', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      renderTooltip({ onOpenChange });

      const trigger = screen.getByRole('button', { name: 'Hover me' });
      await user.hover(trigger);

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('controlled open', () => {
    it('respects controlled open prop', () => {
      renderTooltip({ open: true });

      expect(document.querySelector('[data-cl-slot="tooltip-positioner"]')).toBeInTheDocument();
    });

    it('does not open when controlled open is false', async () => {
      const user = userEvent.setup();
      renderTooltip({ open: false });

      await user.hover(screen.getByRole('button', { name: 'Hover me' }));

      expect(document.querySelector('[data-cl-slot="tooltip-positioner"]')).not.toBeInTheDocument();
    });
  });

  describe('ARIA attributes', () => {
    it('trigger has tooltip role association', async () => {
      const user = userEvent.setup();
      renderTooltip();

      const trigger = screen.getByRole('button', { name: 'Hover me' });
      await user.hover(trigger);

      // aria-describedby must reference the tooltip positioner's id
      const positioner = document.querySelector('[data-cl-slot="tooltip-positioner"]');
      expect(positioner).toBeInTheDocument();
      const positionerId = positioner!.getAttribute('id');
      expect(positionerId).toBeTruthy();
      expect(trigger.getAttribute('aria-describedby')).toBe(positionerId);
    });

    it('tooltip content has role=tooltip', async () => {
      const user = userEvent.setup();
      renderTooltip();

      await user.hover(screen.getByRole('button', { name: 'Hover me' }));

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('focus stays on trigger when tooltip is open', async () => {
      const user = userEvent.setup();
      renderTooltip();

      const trigger = screen.getByRole('button', { name: 'Hover me' });
      await user.hover(trigger);

      expect(document.querySelector('[data-cl-slot="tooltip-popup"]')).toBeInTheDocument();
      // Tooltip must not steal focus — active element should not be inside the tooltip
      const popup = document.querySelector('[data-cl-slot="tooltip-popup"]');
      expect(popup).not.toContainElement(document.activeElement as HTMLElement);
    });
  });

  describe('animation lifecycle', () => {
    it('positioner is not rendered when closed', () => {
      renderTooltip();
      expect(document.querySelector('[data-cl-slot="tooltip-positioner"]')).not.toBeInTheDocument();
    });

    it('applies data-cl-open on popup when open', async () => {
      const user = userEvent.setup();
      renderTooltip();

      await user.hover(screen.getByRole('button', { name: 'Hover me' }));

      const popup = document.querySelector('[data-cl-slot="tooltip-popup"]');
      expect(popup).toHaveAttribute('data-cl-open', '');
    });

    it('positioner has data-cl-side', async () => {
      const user = userEvent.setup();
      renderTooltip();

      await user.hover(screen.getByRole('button', { name: 'Hover me' }));

      const positioner = document.querySelector('[data-cl-slot="tooltip-positioner"]');
      expect(positioner).toHaveAttribute('data-cl-side');
    });
  });

  describe('placement', () => {
    it('accepts custom placement', () => {
      renderTooltip({ defaultOpen: true, placement: 'bottom-end' });

      const positioner = document.querySelector('[data-cl-slot="tooltip-positioner"]');
      expect(positioner).toHaveAttribute('data-cl-side', 'bottom');
    });

    it('defaults to top placement', () => {
      renderTooltip({ defaultOpen: true });

      const positioner = document.querySelector('[data-cl-slot="tooltip-positioner"]');
      expect(positioner).toHaveAttribute('data-cl-side', 'top');
    });
  });

  describe('trigger state attributes', () => {
    it('trigger has data-cl-open when tooltip is visible', async () => {
      const user = userEvent.setup();
      renderTooltip();

      const trigger = screen.getByRole('button', { name: 'Hover me' });
      await user.hover(trigger);

      expect(trigger).toHaveAttribute('data-cl-open', '');
    });

    it('trigger has data-cl-closed when tooltip is hidden', () => {
      renderTooltip();

      const trigger = screen.getByRole('button', { name: 'Hover me' });
      expect(trigger).toHaveAttribute('data-cl-closed', '');
    });
  });

  describe('content rendering', () => {
    it('renders children content when open', async () => {
      const user = userEvent.setup();
      renderTooltip();

      await user.hover(screen.getByRole('button', { name: 'Hover me' }));

      expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });

    it('does not render content when closed', () => {
      renderTooltip();
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    });
  });

  describe('accessibility (axe)', () => {
    it('has no violations when closed', async () => {
      const { container } = renderTooltip();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations when open', async () => {
      renderTooltip({ defaultOpen: true });
      expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
    });
  });

  describe('Tooltip.Group', () => {
    function renderTooltipGroup() {
      return render(
        <Tooltip.Group delay={{ open: 0, close: 0 }}>
          <Tooltip delay={0}>
            <Tooltip.Trigger>Button A</Tooltip.Trigger>
            <Tooltip.Positioner>
              <Tooltip.Popup>Tooltip A</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip>
          <Tooltip delay={0}>
            <Tooltip.Trigger>Button B</Tooltip.Trigger>
            <Tooltip.Positioner>
              <Tooltip.Popup>Tooltip B</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip>
        </Tooltip.Group>,
      );
    }

    it('renders grouped tooltips', async () => {
      renderTooltipGroup();

      expect(screen.getByRole('button', { name: 'Button A' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Button B' })).toBeInTheDocument();
    });

    it('opens tooltip within a group on hover', async () => {
      const user = userEvent.setup();
      renderTooltipGroup();

      const triggerA = screen.getByRole('button', { name: 'Button A' });
      await user.hover(triggerA);

      await waitFor(() => {
        expect(screen.getByText('Tooltip A')).toBeInTheDocument();
      });
    });

    it('switches between grouped tooltips without full delay', async () => {
      const user = userEvent.setup();
      renderTooltipGroup();

      const triggerA = screen.getByRole('button', { name: 'Button A' });
      const triggerB = screen.getByRole('button', { name: 'Button B' });

      // Open first tooltip (wait for it to appear)
      await user.hover(triggerA);
      await waitFor(() => {
        expect(screen.getByText('Tooltip A')).toBeInTheDocument();
      });

      // Move to second tooltip — group instant phase should show it quickly
      await user.unhover(triggerA);
      await user.hover(triggerB);

      await waitFor(() => {
        expect(screen.getByText('Tooltip B')).toBeInTheDocument();
      });

      // First tooltip should no longer be visible
      expect(screen.queryByText('Tooltip A')).not.toBeInTheDocument();
    });
  });
});
