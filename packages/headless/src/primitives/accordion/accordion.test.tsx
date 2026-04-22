import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from '../../test-utils/axe';
import { Accordion } from './accordion';

afterEach(() => cleanup());

function renderAccordion(props: Partial<React.ComponentProps<typeof Accordion>> = {}) {
  return render(
    <Accordion {...props}>
      <Accordion.Item value='item1'>
        <Accordion.Header>
          <Accordion.Trigger>Section 1</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Content 1</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='item2'>
        <Accordion.Header>
          <Accordion.Trigger>Section 2</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Content 2</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='item3'>
        <Accordion.Header>
          <Accordion.Trigger>Section 3</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Content 3</Accordion.Panel>
      </Accordion.Item>
    </Accordion>,
  );
}

describe('Accordion', () => {
  describe('slot attributes', () => {
    it('renders root with data-cl-slot', () => {
      renderAccordion();
      expect(document.querySelector('[data-cl-slot="accordion-root"]')).toBeInTheDocument();
    });

    it('renders items with data-cl-slot', () => {
      renderAccordion();
      const items = document.querySelectorAll('[data-cl-slot="accordion-item"]');
      expect(items).toHaveLength(3);
    });

    it('renders headers with data-cl-slot', () => {
      renderAccordion();
      const headers = document.querySelectorAll('[data-cl-slot="accordion-header"]');
      expect(headers).toHaveLength(3);
    });

    it('renders triggers with data-cl-slot', () => {
      renderAccordion();
      const triggers = document.querySelectorAll('[data-cl-slot="accordion-trigger"]');
      expect(triggers).toHaveLength(3);
    });

    it('renders panels with data-cl-slot when open', () => {
      renderAccordion({ defaultValue: ['item1'] });
      expect(document.querySelector('[data-cl-slot="accordion-panel"]')).toBeInTheDocument();
    });
  });

  describe('expand/collapse', () => {
    it('opens an item on trigger click', async () => {
      const user = userEvent.setup();
      renderAccordion();

      await user.click(screen.getByRole('button', { name: 'Section 1' }));

      const item = document.querySelectorAll('[data-cl-slot="accordion-item"]')[0];
      expect(item).toHaveAttribute('data-cl-open', '');
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('closes an open item on trigger click', async () => {
      const user = userEvent.setup();
      renderAccordion({ defaultValue: ['item1'] });

      await user.click(screen.getByRole('button', { name: 'Section 1' }));

      const item = document.querySelectorAll('[data-cl-slot="accordion-item"]')[0];
      expect(item).toHaveAttribute('data-cl-closed', '');
    });

    it('calls onValueChange when toggled', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      renderAccordion({ onValueChange });

      await user.click(screen.getByRole('button', { name: 'Section 1' }));

      expect(onValueChange).toHaveBeenCalledWith(['item1']);
    });

    it('allows multiple items open in multiple mode', async () => {
      const user = userEvent.setup();
      renderAccordion({ type: 'multiple' });

      await user.click(screen.getByRole('button', { name: 'Section 1' }));
      await user.click(screen.getByRole('button', { name: 'Section 2' }));

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('allows only one item open in single mode', async () => {
      const user = userEvent.setup();
      renderAccordion({ type: 'single' });

      await user.click(screen.getByRole('button', { name: 'Section 1' }));
      await user.click(screen.getByRole('button', { name: 'Section 2' }));

      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  describe('controlled value', () => {
    it('respects controlled value prop', () => {
      renderAccordion({ value: ['item2'] });

      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('does not change when controlled', async () => {
      const user = userEvent.setup();
      renderAccordion({ value: [] });

      await user.click(screen.getByRole('button', { name: 'Section 1' }));

      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });
  });

  describe('ARIA attributes', () => {
    it('trigger has aria-expanded=false when closed', () => {
      renderAccordion();
      const trigger = screen.getByRole('button', { name: 'Section 1' });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('trigger has aria-expanded=true when open', () => {
      renderAccordion({ defaultValue: ['item1'] });
      const trigger = screen.getByRole('button', { name: 'Section 1' });
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('trigger has aria-controls linked to panel id', () => {
      renderAccordion({ defaultValue: ['item1'] });
      const trigger = screen.getByRole('button', { name: 'Section 1' });
      const panel = document.querySelector('[data-cl-slot="accordion-panel"]');

      expect(trigger).toHaveAttribute('aria-controls', panel?.getAttribute('id'));
    });

    it('panel has aria-labelledby linked to trigger id', () => {
      renderAccordion({ defaultValue: ['item1'] });
      const trigger = screen.getByRole('button', { name: 'Section 1' });
      const panel = document.querySelector('[data-cl-slot="accordion-panel"]');

      expect(panel).toHaveAttribute('aria-labelledby', trigger.getAttribute('id'));
    });

    it('panel has role=region', () => {
      renderAccordion({ defaultValue: ['item1'] });
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  describe('animation lifecycle', () => {
    it('panel is not in DOM when closed', () => {
      renderAccordion();
      expect(document.querySelector('[data-cl-slot="accordion-panel"]')).not.toBeInTheDocument();
    });

    it('applies data-cl-open on panel when open', () => {
      renderAccordion({ defaultValue: ['item1'] });
      const panel = document.querySelector('[data-cl-slot="accordion-panel"]');
      expect(panel).toHaveAttribute('data-cl-open', '');
    });

    it('does not apply starting-style on initially open panels', () => {
      renderAccordion({ defaultValue: ['item1'] });
      const panel = document.querySelector('[data-cl-slot="accordion-panel"]');
      expect(panel).not.toHaveAttribute('data-cl-starting-style');
    });

    it('sets --accordion-panel-height CSS variable on panel', () => {
      renderAccordion({ defaultValue: ['item1'] });
      const panel = document.querySelector('[data-cl-slot="accordion-panel"]') as HTMLElement;
      // Verify the CSS variable is present in the style attribute
      expect(panel.getAttribute('style')).toContain('--accordion-panel-height');
    });
  });

  describe('disabled', () => {
    it('disables all items when disabled on root', () => {
      renderAccordion({ disabled: true });
      const triggers = screen.getAllByRole('button');
      triggers.forEach(trigger => {
        expect(trigger).toHaveAttribute('aria-disabled', 'true');
      });
    });

    it('prevents toggle when disabled', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      renderAccordion({ disabled: true, onValueChange });

      await user.click(screen.getByRole('button', { name: 'Section 1' }));

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('disables individual item', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      render(
        <Accordion onValueChange={onValueChange}>
          <Accordion.Item
            value='item1'
            disabled
          >
            <Accordion.Header>
              <Accordion.Trigger>Disabled</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel>Content</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value='item2'>
            <Accordion.Header>
              <Accordion.Trigger>Enabled</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel>Content 2</Accordion.Panel>
          </Accordion.Item>
        </Accordion>,
      );

      await user.click(screen.getByRole('button', { name: 'Disabled' }));
      expect(onValueChange).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: 'Enabled' }));
      expect(onValueChange).toHaveBeenCalledWith(['item2']);
    });

    it('applies data-cl-disabled on item and trigger', () => {
      render(
        <Accordion>
          <Accordion.Item
            value='item1'
            disabled
          >
            <Accordion.Header>
              <Accordion.Trigger>Disabled</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel>Content</Accordion.Panel>
          </Accordion.Item>
        </Accordion>,
      );

      const item = document.querySelector('[data-cl-slot="accordion-item"]');
      const trigger = document.querySelector('[data-cl-slot="accordion-trigger"]');
      expect(item).toHaveAttribute('data-cl-disabled', '');
      expect(trigger).toHaveAttribute('data-cl-disabled', '');
    });
  });

  describe('keyboard navigation', () => {
    it('moves focus down with ArrowDown', async () => {
      const user = userEvent.setup();
      renderAccordion();

      const triggers = screen.getAllByRole('button');
      triggers[0].focus();
      await user.keyboard('{ArrowDown}');

      expect(triggers[1]).toHaveFocus();
    });

    it('moves focus up with ArrowUp', async () => {
      const user = userEvent.setup();
      renderAccordion();

      const triggers = screen.getAllByRole('button');
      triggers[1].focus();
      await user.keyboard('{ArrowUp}');

      expect(triggers[0]).toHaveFocus();
    });

    it('toggles item with Enter', async () => {
      const user = userEvent.setup();
      renderAccordion();

      const trigger = screen.getByRole('button', { name: 'Section 1' });
      trigger.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('toggles item with Space', async () => {
      const user = userEvent.setup();
      renderAccordion();

      const trigger = screen.getByRole('button', { name: 'Section 1' });
      trigger.focus();
      await user.keyboard(' ');

      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('moves focus to first trigger with Home', async () => {
      const user = userEvent.setup();
      renderAccordion();

      const triggers = screen.getAllByRole('button');
      triggers[2].focus();
      await user.keyboard('{Home}');

      expect(triggers[0]).toHaveFocus();
    });

    it('moves focus to last trigger with End', async () => {
      const user = userEvent.setup();
      renderAccordion();

      const triggers = screen.getAllByRole('button');
      triggers[0].focus();
      await user.keyboard('{End}');

      expect(triggers[2]).toHaveFocus();
    });

    it('Home skips disabled triggers', async () => {
      const user = userEvent.setup();
      render(
        <Accordion>
          <Accordion.Item
            value='item1'
            disabled
          >
            <Accordion.Header>
              <Accordion.Trigger>Section 1</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel>Content 1</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value='item2'>
            <Accordion.Header>
              <Accordion.Trigger>Section 2</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel>Content 2</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value='item3'>
            <Accordion.Header>
              <Accordion.Trigger>Section 3</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel>Content 3</Accordion.Panel>
          </Accordion.Item>
        </Accordion>,
      );

      const section3 = screen.getByRole('button', { name: 'Section 3' });
      section3.focus();
      await user.keyboard('{Home}');

      expect(screen.getByRole('button', { name: 'Section 2' })).toHaveFocus();
    });

    it('End skips disabled triggers', async () => {
      const user = userEvent.setup();
      render(
        <Accordion>
          <Accordion.Item value='item1'>
            <Accordion.Header>
              <Accordion.Trigger>Section 1</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel>Content 1</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value='item2'>
            <Accordion.Header>
              <Accordion.Trigger>Section 2</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel>Content 2</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item
            value='item3'
            disabled
          >
            <Accordion.Header>
              <Accordion.Trigger>Section 3</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel>Content 3</Accordion.Panel>
          </Accordion.Item>
        </Accordion>,
      );

      const section1 = screen.getByRole('button', { name: 'Section 1' });
      section1.focus();
      await user.keyboard('{End}');

      expect(screen.getByRole('button', { name: 'Section 2' })).toHaveFocus();
    });
  });

  describe('accessibility (axe)', () => {
    it('has no violations when collapsed', async () => {
      const { container } = renderAccordion();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations when expanded', async () => {
      const { container } = renderAccordion({ defaultValue: ['item1'] });
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
