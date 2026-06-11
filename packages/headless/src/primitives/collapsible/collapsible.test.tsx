import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { axe } from '../../test-utils/axe';
import { Collapsible } from './index';

afterEach(() => cleanup());

function renderCollapsible(props: Partial<React.ComponentProps<typeof Collapsible.Root>> = {}) {
  return render(
    <Collapsible.Root {...props}>
      <Collapsible.Trigger>Toggle</Collapsible.Trigger>
      <Collapsible.Panel>Content</Collapsible.Panel>
    </Collapsible.Root>,
  );
}

describe('Collapsible', () => {
  describe('slot attributes', () => {
    it('renders root with data-cl-slot', () => {
      renderCollapsible();
      expect(document.querySelector('[data-cl-slot="collapsible-root"]')).toBeInTheDocument();
    });

    it('renders trigger with data-cl-slot', () => {
      renderCollapsible();
      expect(document.querySelector('[data-cl-slot="collapsible-trigger"]')).toBeInTheDocument();
    });

    it('renders panel with data-cl-slot when open', () => {
      renderCollapsible({ defaultOpen: true });
      expect(document.querySelector('[data-cl-slot="collapsible-panel"]')).toBeInTheDocument();
    });
  });

  describe('open/close', () => {
    it('opens panel on trigger click', async () => {
      const user = userEvent.setup();
      renderCollapsible();

      await user.click(screen.getByRole('button', { name: 'Toggle' }));

      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(document.querySelector('[data-cl-slot="collapsible-root"]')).toHaveAttribute('data-cl-open', '');
    });

    it('closes panel on second trigger click', async () => {
      const user = userEvent.setup();
      renderCollapsible({ defaultOpen: true });

      await user.click(screen.getByRole('button', { name: 'Toggle' }));

      expect(document.querySelector('[data-cl-slot="collapsible-root"]')).toHaveAttribute('data-cl-closed', '');
    });

    it('calls onOpenChange when toggled', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      renderCollapsible({ onOpenChange });

      await user.click(screen.getByRole('button', { name: 'Toggle' }));

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('starts closed by default', () => {
      renderCollapsible();
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
      expect(document.querySelector('[data-cl-slot="collapsible-root"]')).toHaveAttribute('data-cl-closed', '');
    });

    it('starts open with defaultOpen=true', () => {
      renderCollapsible({ defaultOpen: true });
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('controlled value', () => {
    it('respects controlled open prop', () => {
      renderCollapsible({ open: true });
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('does not change when controlled', async () => {
      const user = userEvent.setup();
      renderCollapsible({ open: false });

      await user.click(screen.getByRole('button', { name: 'Toggle' }));

      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });

  describe('ARIA attributes', () => {
    it('trigger has aria-expanded=false when closed', () => {
      renderCollapsible();
      expect(screen.getByRole('button', { name: 'Toggle' })).toHaveAttribute('aria-expanded', 'false');
    });

    it('trigger has aria-expanded=true when open', () => {
      renderCollapsible({ defaultOpen: true });
      expect(screen.getByRole('button', { name: 'Toggle' })).toHaveAttribute('aria-expanded', 'true');
    });

    it('trigger has aria-controls linked to panel id', () => {
      renderCollapsible({ defaultOpen: true });
      const trigger = screen.getByRole('button', { name: 'Toggle' });
      const panel = document.querySelector('[data-cl-slot="collapsible-panel"]');
      expect(trigger).toHaveAttribute('aria-controls', panel?.getAttribute('id'));
    });

    it('panel has aria-labelledby linked to trigger id', () => {
      renderCollapsible({ defaultOpen: true });
      const trigger = screen.getByRole('button', { name: 'Toggle' });
      const panel = document.querySelector('[data-cl-slot="collapsible-panel"]');
      expect(panel).toHaveAttribute('aria-labelledby', trigger.getAttribute('id'));
    });

    it('panel has role=region', () => {
      renderCollapsible({ defaultOpen: true });
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('keeps trigger/panel association intact when a custom id is passed to the trigger', () => {
      render(
        <Collapsible.Root defaultOpen>
          <Collapsible.Trigger id='consumer-trigger-id'>Toggle</Collapsible.Trigger>
          <Collapsible.Panel>Content</Collapsible.Panel>
        </Collapsible.Root>,
      );
      const trigger = screen.getByRole('button', { name: 'Toggle' });
      const panel = document.querySelector('[data-cl-slot="collapsible-panel"]');

      // The wired ids are owned by the primitive: a consumer-supplied id must
      // not silently break the aria pairing between trigger and panel.
      expect(panel).toHaveAttribute('aria-labelledby', trigger.getAttribute('id'));
      expect(trigger).toHaveAttribute('aria-controls', panel?.getAttribute('id'));
    });
  });

  describe('animation lifecycle', () => {
    it('panel is not in DOM when closed', () => {
      renderCollapsible();
      expect(document.querySelector('[data-cl-slot="collapsible-panel"]')).not.toBeInTheDocument();
    });

    it('applies data-cl-open on panel when open', () => {
      renderCollapsible({ defaultOpen: true });
      const panel = document.querySelector('[data-cl-slot="collapsible-panel"]');
      expect(panel).toHaveAttribute('data-cl-open', '');
    });

    it('does not apply starting-style on initially open panel', () => {
      renderCollapsible({ defaultOpen: true });
      const panel = document.querySelector('[data-cl-slot="collapsible-panel"]');
      expect(panel).not.toHaveAttribute('data-cl-starting-style');
    });

    it('sets --collapsible-panel-height CSS variable on panel', () => {
      renderCollapsible({ defaultOpen: true });
      const panel = document.querySelector('[data-cl-slot="collapsible-panel"]') as HTMLElement;
      expect(panel.getAttribute('style')).toContain('--collapsible-panel-height');
    });

    it('sets --collapsible-panel-width CSS variable on panel', () => {
      renderCollapsible({ defaultOpen: true });
      const panel = document.querySelector('[data-cl-slot="collapsible-panel"]') as HTMLElement;
      expect(panel.getAttribute('style')).toContain('--collapsible-panel-width');
    });
  });

  describe('disabled', () => {
    it('prevents toggle when disabled', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      renderCollapsible({ disabled: true, onOpenChange });

      await user.click(screen.getByRole('button', { name: 'Toggle' }));

      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('applies aria-disabled on trigger', () => {
      renderCollapsible({ disabled: true });
      expect(screen.getByRole('button', { name: 'Toggle' })).toHaveAttribute('aria-disabled', 'true');
    });

    it('applies data-cl-disabled on root and trigger', () => {
      renderCollapsible({ disabled: true });
      expect(document.querySelector('[data-cl-slot="collapsible-root"]')).toHaveAttribute('data-cl-disabled', '');
      expect(document.querySelector('[data-cl-slot="collapsible-trigger"]')).toHaveAttribute('data-cl-disabled', '');
    });
  });

  describe('accessibility (axe)', () => {
    it('has no violations when closed', async () => {
      const { container } = renderCollapsible();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations when open', async () => {
      const { container } = renderCollapsible({ defaultOpen: true });
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
