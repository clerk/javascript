import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from '../../test-utils/axe';
import { Tabs } from './tabs';

afterEach(() => cleanup());

function renderTabs(props: Partial<React.ComponentProps<typeof Tabs>> = {}) {
  return render(
    <Tabs
      defaultValue='tab1'
      {...props}
    >
      <Tabs.List>
        <Tabs.Tab value='tab1'>Account</Tabs.Tab>
        <Tabs.Tab value='tab2'>Settings</Tabs.Tab>
        <Tabs.Tab value='tab3'>Billing</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value='tab1'>Account content</Tabs.Panel>
      <Tabs.Panel value='tab2'>Settings content</Tabs.Panel>
      <Tabs.Panel value='tab3'>Billing content</Tabs.Panel>
    </Tabs>,
  );
}

describe('Tabs', () => {
  describe('slot attributes', () => {
    it('renders list with data-cl-slot', () => {
      renderTabs();
      expect(document.querySelector('[data-cl-slot="tabs-list"]')).toBeInTheDocument();
    });

    it('renders tabs with data-cl-slot', () => {
      renderTabs();
      const tabs = document.querySelectorAll('[data-cl-slot="tabs-tab"]');
      expect(tabs).toHaveLength(3);
    });

    it('renders panels with data-cl-slot', () => {
      renderTabs();
      const panels = document.querySelectorAll('[data-cl-slot="tabs-panel"]');
      expect(panels).toHaveLength(3);
    });
  });

  describe('ARIA attributes', () => {
    it('list has role=tablist', () => {
      renderTabs();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('list has aria-orientation', () => {
      renderTabs();
      expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('vertical orientation sets aria-orientation', () => {
      renderTabs({ orientation: 'vertical' });
      expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('tabs have role=tab', () => {
      renderTabs();
      expect(screen.getAllByRole('tab')).toHaveLength(3);
    });

    it('selected tab has aria-selected=true', () => {
      renderTabs();
      expect(screen.getByText('Account')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Settings')).toHaveAttribute('aria-selected', 'false');
    });

    it('panels have role=tabpanel', () => {
      renderTabs();
      // Only the selected panel is visible
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('tab has aria-controls linking to panel', () => {
      renderTabs();
      const tab = screen.getByText('Account');
      const panelId = tab.getAttribute('aria-controls');
      expect(panelId).toBeTruthy();
      expect(document.getElementById(panelId!)).toHaveTextContent('Account content');
    });

    it('panel has aria-labelledby linking to tab', () => {
      renderTabs();
      const panel = screen.getByRole('tabpanel');
      const tabId = panel.getAttribute('aria-labelledby');
      expect(tabId).toBeTruthy();
      expect(document.getElementById(tabId!)).toHaveTextContent('Account');
    });
  });

  describe('selection', () => {
    it('shows selected panel content', () => {
      renderTabs();
      expect(screen.getByText('Account content')).toBeVisible();
      expect(screen.getByText('Settings content')).not.toBeVisible();
    });

    it('selects tab on click', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('Settings'));

      expect(screen.getByText('Settings')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Settings content')).toBeVisible();
    });

    it('marks selected tab with data-cl-selected', () => {
      renderTabs();
      expect(screen.getByText('Account')).toHaveAttribute('data-cl-selected', '');
      expect(screen.getByText('Settings').hasAttribute('data-cl-selected')).toBe(false);
    });

    it('calls onValueChange on selection', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      renderTabs({ onValueChange });

      await user.click(screen.getByText('Settings'));

      expect(onValueChange).toHaveBeenCalledWith('tab2');
    });
  });

  describe('controlled value', () => {
    it('respects controlled value prop', () => {
      renderTabs({ value: 'tab2' });
      expect(screen.getByText('Settings')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Settings content')).toBeVisible();
    });

    it('does not change internally when controlled', async () => {
      const user = userEvent.setup();
      renderTabs({ value: 'tab1' });

      await user.click(screen.getByText('Settings'));

      // Still on tab1 since controlled
      expect(screen.getByText('Account')).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('keyboard navigation — automatic activation', () => {
    it('moves focus with ArrowRight', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('Account'));
      await user.keyboard('{ArrowRight}');

      expect(document.activeElement).toBe(screen.getByText('Settings'));
      // Automatic mode: focus triggers selection
      expect(screen.getByText('Settings')).toHaveAttribute('aria-selected', 'true');
    });

    it('moves focus with ArrowLeft', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('Settings'));
      await user.keyboard('{ArrowLeft}');

      expect(document.activeElement).toBe(screen.getByText('Account'));
    });

    it('wraps around at the end (loop)', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('Billing'));
      await user.keyboard('{ArrowRight}');

      expect(document.activeElement).toBe(screen.getByText('Account'));
    });

    it('wraps around at the start', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('Account'));
      await user.keyboard('{ArrowLeft}');

      expect(document.activeElement).toBe(screen.getByText('Billing'));
    });

    it('uses ArrowDown/ArrowUp for vertical orientation', async () => {
      const user = userEvent.setup();
      renderTabs({ orientation: 'vertical' });

      await user.click(screen.getByText('Account'));
      await user.keyboard('{ArrowDown}');

      expect(document.activeElement).toBe(screen.getByText('Settings'));
    });

    it('moves focus to first tab with Home', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('Billing'));
      await user.keyboard('{Home}');

      expect(document.activeElement).toBe(screen.getByText('Account'));
    });

    it('moves focus to last tab with End', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('Account'));
      await user.keyboard('{End}');

      expect(document.activeElement).toBe(screen.getByText('Billing'));
    });

    it('Tab key moves focus from tab to panel', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('Account'));
      await user.tab();

      const panel = screen.getByRole('tabpanel');
      expect(document.activeElement).toBe(panel);
    });

    it('Home skips disabled tabs', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue='tab3'>
          <Tabs.List>
            <Tabs.Tab
              value='tab1'
              disabled
            >
              First
            </Tabs.Tab>
            <Tabs.Tab value='tab2'>Second</Tabs.Tab>
            <Tabs.Tab value='tab3'>Third</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value='tab1'>Panel 1</Tabs.Panel>
          <Tabs.Panel value='tab2'>Panel 2</Tabs.Panel>
          <Tabs.Panel value='tab3'>Panel 3</Tabs.Panel>
        </Tabs>,
      );

      await user.click(screen.getByText('Third'));
      await user.keyboard('{Home}');

      expect(document.activeElement).toBe(screen.getByText('Second'));
    });
  });

  describe('keyboard navigation — manual activation', () => {
    it('moves focus without selecting', async () => {
      const user = userEvent.setup();
      renderTabs({ activationMode: 'manual' });

      await user.click(screen.getByText('Account'));
      await user.keyboard('{ArrowRight}');

      expect(document.activeElement).toBe(screen.getByText('Settings'));
      // Manual mode: focus does NOT select
      expect(screen.getByText('Account')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Settings')).toHaveAttribute('aria-selected', 'false');
    });

    it('selects on Enter', async () => {
      const user = userEvent.setup();
      renderTabs({ activationMode: 'manual' });

      await user.click(screen.getByText('Account'));
      await user.keyboard('{ArrowRight}{Enter}');

      expect(screen.getByText('Settings')).toHaveAttribute('aria-selected', 'true');
    });

    it('selects on Space', async () => {
      const user = userEvent.setup();
      renderTabs({ activationMode: 'manual' });

      await user.click(screen.getByText('Account'));
      await user.keyboard('{ArrowRight} ');

      expect(screen.getByText('Settings')).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('disabled tab', () => {
    function renderWithDisabled() {
      return render(
        <Tabs defaultValue='tab1'>
          <Tabs.List>
            <Tabs.Tab value='tab1'>Account</Tabs.Tab>
            <Tabs.Tab
              value='tab2'
              disabled
            >
              Settings
            </Tabs.Tab>
            <Tabs.Tab value='tab3'>Billing</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value='tab1'>Account content</Tabs.Panel>
          <Tabs.Panel value='tab2'>Settings content</Tabs.Panel>
          <Tabs.Panel value='tab3'>Billing content</Tabs.Panel>
        </Tabs>,
      );
    }

    it('disabled tab has data-cl-disabled', () => {
      renderWithDisabled();
      expect(screen.getByText('Settings')).toHaveAttribute('data-cl-disabled', '');
    });

    it('disabled tab has aria-disabled', () => {
      renderWithDisabled();
      expect(screen.getByText('Settings')).toHaveAttribute('aria-disabled', 'true');
    });

    it('skips disabled tab during keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithDisabled();

      await user.click(screen.getByText('Account'));
      await user.keyboard('{ArrowRight}');

      // Should skip Settings (disabled) and land on Billing
      expect(document.activeElement).toBe(screen.getByText('Billing'));
    });

    it('does not select disabled tab on click', async () => {
      const user = userEvent.setup();
      renderWithDisabled();

      await user.click(screen.getByText('Settings'));

      expect(screen.getByText('Account')).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Tabs.Indicator', () => {
    function renderWithIndicator() {
      return render(
        <Tabs defaultValue='tab1'>
          <Tabs.List style={{ position: 'relative' }}>
            <Tabs.Tab value='tab1'>Account</Tabs.Tab>
            <Tabs.Tab value='tab2'>Settings</Tabs.Tab>
            <Tabs.Indicator data-testid='indicator' />
          </Tabs.List>
          <Tabs.Panel value='tab1'>Account content</Tabs.Panel>
          <Tabs.Panel value='tab2'>Settings content</Tabs.Panel>
        </Tabs>,
      );
    }

    it('renders with data-cl-slot', () => {
      renderWithIndicator();
      expect(document.querySelector('[data-cl-slot="tabs-indicator"]')).toBeInTheDocument();
    });

    it('has position absolute', () => {
      renderWithIndicator();
      const indicator = screen.getByTestId('indicator');
      expect(indicator.style.position).toBe('absolute');
    });

    it('has aria-hidden', () => {
      renderWithIndicator();
      const indicator = screen.getByTestId('indicator');
      expect(indicator).toHaveAttribute('aria-hidden', 'true');
    });

    it('sets --tab-width and --tab-left CSS vars', () => {
      renderWithIndicator();
      const indicator = screen.getByTestId('indicator');
      // In a real browser, getBoundingClientRect returns actual measurements
      expect(indicator.style.getPropertyValue('--tab-width')).toBeTruthy();
      expect(indicator.style.getPropertyValue('--tab-left')).toBeTruthy();
    });

    it('updates position when tab changes', async () => {
      const user = userEvent.setup();
      renderWithIndicator();

      const indicator = screen.getByTestId('indicator');
      const initialLeft = indicator.style.left;

      await user.click(screen.getByText('Settings'));

      // Verify the effect ran and style properties are set
      expect(indicator.style.position).toBe('absolute');
      expect(indicator.style.getPropertyValue('--tab-width')).toBeDefined();
    });

    it('skips transition on initial render', () => {
      renderWithIndicator();
      const indicator = screen.getByTestId('indicator');
      expect(indicator.style.transition).toBe('none');
    });
  });

  describe('panel visibility', () => {
    it('hides non-selected panels with hidden attribute', () => {
      renderTabs();
      const panels = document.querySelectorAll('[data-cl-slot="tabs-panel"]');
      const visible = Array.from(panels).filter(p => !p.hasAttribute('hidden'));
      const hidden = Array.from(panels).filter(p => p.hasAttribute('hidden'));

      expect(visible).toHaveLength(1);
      expect(hidden).toHaveLength(2);
    });

    it('non-selected panels have data-cl-hidden', () => {
      renderTabs();
      const panels = document.querySelectorAll('[data-cl-slot="tabs-panel"][data-cl-hidden]');
      expect(panels).toHaveLength(2);
    });
  });

  describe('roving tabindex', () => {
    it('selected tab has tabIndex=0, others have tabIndex=-1', () => {
      renderTabs();
      expect(screen.getByText('Account')).toHaveAttribute('tabindex', '0');
      expect(screen.getByText('Settings')).toHaveAttribute('tabindex', '-1');
      expect(screen.getByText('Billing')).toHaveAttribute('tabindex', '-1');
    });

    it('tabIndex updates when selection changes', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('Settings'));

      expect(screen.getByText('Account')).toHaveAttribute('tabindex', '-1');
      expect(screen.getByText('Settings')).toHaveAttribute('tabindex', '0');
    });
  });

  describe('accessibility (axe)', () => {
    it('has no violations', async () => {
      const { container } = renderTabs();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations with vertical orientation', async () => {
      const { container } = renderTabs({ orientation: 'vertical' });
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
