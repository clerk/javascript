import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { axe } from '../test-utils/axe';
import { Tabs } from './index';

afterEach(() => cleanup());

function renderTabs(props: Partial<React.ComponentProps<typeof Tabs.Root>> = {}) {
  return render(
    <Tabs.Root
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
    </Tabs.Root>,
  );
}

describe('Tabs', () => {
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

    it('keeps tab/panel association intact when a custom id is passed to the tab', () => {
      render(
        <Tabs.Root defaultValue='tab1'>
          <Tabs.List>
            <Tabs.Tab
              value='tab1'
              id='consumer-custom-id'
            >
              Account
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value='tab1'>Account content</Tabs.Panel>
        </Tabs.Root>,
      );
      const tab = screen.getByRole('tab', { name: 'Account' });
      const panel = screen.getByRole('tabpanel');

      // The wired ids are owned by the primitive: a consumer-supplied id must
      // not silently break the aria pairing between tab and panel.
      expect(tab).toHaveAttribute('aria-controls', panel.getAttribute('id'));
      expect(panel).toHaveAttribute('aria-labelledby', tab.getAttribute('id'));
    });
  });

  describe('selection', () => {
    it('shows selected panel content', () => {
      renderTabs();
      expect(screen.getByText('Account content')).toBeVisible();
      expect(screen.queryByText('Settings content')).not.toBeInTheDocument();
    });

    it('selects tab on click', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('Settings'));

      expect(screen.getByText('Settings')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Settings content')).toBeVisible();
    });

    it('marks selected tab with data-selected', () => {
      renderTabs();
      expect(screen.getByText('Account')).toHaveAttribute('data-selected', '');
      expect(screen.getByText('Settings').hasAttribute('data-selected')).toBe(false);
    });

    it('calls onValueChange on selection', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      renderTabs({ onValueChange });

      await user.click(screen.getByText('Settings'));

      expect(onValueChange).toHaveBeenCalledWith('tab2');
    });

    it('does not call onValueChange when the selected tab is chosen again', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      renderTabs({ onValueChange });

      await user.click(screen.getByText('Account'));

      expect(onValueChange).not.toHaveBeenCalled();
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

    it('follows the visual order of arrow keys in RTL', async () => {
      const user = userEvent.setup();
      render(
        <div dir='rtl'>
          <Tabs.Root defaultValue='tab2'>
            <Tabs.List>
              <Tabs.Tab value='tab1'>Account</Tabs.Tab>
              <Tabs.Tab value='tab2'>Settings</Tabs.Tab>
              <Tabs.Tab value='tab3'>Billing</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value='tab1'>Account content</Tabs.Panel>
            <Tabs.Panel value='tab2'>Settings content</Tabs.Panel>
            <Tabs.Panel value='tab3'>Billing content</Tabs.Panel>
          </Tabs.Root>
        </div>,
      );

      await user.click(screen.getByText('Settings'));
      await user.keyboard('{ArrowLeft}');
      expect(document.activeElement).toBe(screen.getByText('Billing'));

      await user.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(screen.getByText('Settings'));
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
        <Tabs.Root defaultValue='tab3'>
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
        </Tabs.Root>,
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
        <Tabs.Root defaultValue='tab1'>
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
        </Tabs.Root>,
      );
    }

    it('disabled tab has data-disabled', () => {
      renderWithDisabled();
      expect(screen.getByText('Settings')).toHaveAttribute('data-disabled', '');
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
    function Indicated(props: Partial<React.ComponentProps<typeof Tabs.Root>>) {
      return (
        <Tabs.Root
          defaultValue='tab1'
          {...props}
        >
          <Tabs.List>
            <Tabs.Tab value='tab1'>Account</Tabs.Tab>
            <Tabs.Tab value='tab2'>Settings</Tabs.Tab>
            <Tabs.Tab value='tab3'>Billing</Tabs.Tab>
            <Tabs.Indicator data-testid='indicator' />
          </Tabs.List>
          <Tabs.Panel value='tab1'>Account content</Tabs.Panel>
          <Tabs.Panel value='tab2'>Settings content</Tabs.Panel>
          <Tabs.Panel value='tab3'>Billing content</Tabs.Panel>
        </Tabs.Root>
      );
    }

    it('has aria-hidden', () => {
      render(<Indicated />);
      expect(screen.getByTestId('indicator')).toHaveAttribute('aria-hidden', 'true');
    });

    it('marks the direction the selection traveled', async () => {
      const user = userEvent.setup();
      render(<Indicated />);
      const indicator = screen.getByTestId('indicator');

      expect(indicator).toHaveAttribute('data-direction', 'forward');

      await user.click(screen.getByText('Billing'));
      expect(indicator).toHaveAttribute('data-direction', 'forward');

      await user.click(screen.getByText('Settings'));
      expect(indicator).toHaveAttribute('data-direction', 'backward');
    });

    it('marks the direction when a controlled value changes', () => {
      const { rerender } = render(<Indicated value='tab3' />);
      rerender(<Indicated value='tab1' />);

      expect(screen.getByTestId('indicator')).toHaveAttribute('data-direction', 'backward');
    });

    it('marks the direction when a controlled parent follows onValueChange', async () => {
      const user = userEvent.setup();
      function Controlled() {
        const [value, setValue] = useState('tab3');
        return (
          <Indicated
            value={value}
            onValueChange={setValue}
          />
        );
      }
      render(<Controlled />);

      await user.click(screen.getByText('Account'));

      expect(screen.getByText('Account')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('indicator')).toHaveAttribute('data-direction', 'backward');
    });

    it('follows vertical tabs the same way', async () => {
      const user = userEvent.setup();
      render(
        <Indicated
          orientation='vertical'
          defaultValue='tab3'
        />,
      );

      await user.click(screen.getByText('Billing'));
      await user.keyboard('{ArrowUp}');

      expect(screen.getByText('Settings')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('indicator')).toHaveAttribute('data-direction', 'backward');
    });
  });

  describe('panel visibility', () => {
    it('hides non-selected panels with hidden attribute', () => {
      renderTabs();
      const panels = screen.queryAllByRole('tabpanel', { hidden: true });
      const visible = Array.from(panels).filter(p => !p.hasAttribute('hidden'));
      const hidden = Array.from(panels).filter(p => p.hasAttribute('hidden'));

      expect(visible).toHaveLength(1);
      expect(hidden).toHaveLength(2);
    });

    it('non-selected panels have data-hidden', () => {
      renderTabs();
      const panels = screen.queryAllByRole('tabpanel', { hidden: true }).filter(p => p.hasAttribute('data-hidden'));
      expect(panels).toHaveLength(2);
    });

    it('non-selected panels have inert attribute, selected panel does not', () => {
      renderTabs();
      const panels = screen.queryAllByRole('tabpanel', { hidden: true });
      const inert = Array.from(panels).filter(p => p.hasAttribute('inert'));
      const notInert = Array.from(panels).filter(p => !p.hasAttribute('inert'));
      // Presence check only — `inertProps` emits the value each React major reflects
      // (string '' on 18, boolean true on 19), both of which serialize to inert="".
      expect(inert).toHaveLength(2);
      expect(notInert).toHaveLength(1);
    });

    it('inert updates when selection changes', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByText('Settings'));

      const panels = screen.queryAllByRole('tabpanel', { hidden: true });
      const [account, settings, billing] = Array.from(panels);
      expect(account).toHaveAttribute('inert');
      expect(settings).not.toHaveAttribute('inert');
      expect(billing).toHaveAttribute('inert');
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

  // React writes changed attributes in key order, and Chrome flushes style when `tabindex` changes on
  // the focused element. A state marker that lands after that write is absent from the flush, which
  // is how a CSS anchor on `[data-selected]` loses its transition. So the marker leads the tab's props.
  describe('attribute order', () => {
    it('emits data-selected ahead of the roving tabindex', () => {
      renderTabs();
      const names = Array.from(screen.getByRole('tab', { name: 'Account' }).attributes).map(a => a.name);
      expect(names.indexOf('data-selected')).toBeGreaterThanOrEqual(0);
      expect(names.indexOf('data-selected')).toBeLessThan(names.indexOf('tabindex'));
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

  describe('consumer ref forwarding', () => {
    it('forwards a consumer ref on Tab (CompositeItem shape)', () => {
      const ref = createRef<HTMLButtonElement>();
      render(
        <Tabs.Root defaultValue='tab1'>
          <Tabs.List>
            <Tabs.Tab
              value='tab1'
              ref={ref}
            >
              One
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value='tab1'>content</Tabs.Panel>
        </Tabs.Root>,
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current).toHaveAttribute('role', 'tab');
    });
  });

  describe('inert state', () => {
    it('marks deselected panels inert and leaves the selected panel interactive', () => {
      renderTabs({ defaultValue: 'tab1' });

      const [selected, deselected] = screen.getAllByRole('tabpanel', { hidden: true });

      expect(selected).not.toHaveAttribute('inert');
      expect(deselected).toHaveAttribute('inert');
    });
  });

  describe('panel children', () => {
    function mockAnimations() {
      let finish = () => {};
      const finished = new Promise<void>(resolve => {
        finish = resolve;
      });
      const original = (Element.prototype as { getAnimations?: unknown }).getAnimations;
      (Element.prototype as { getAnimations?: unknown }).getAnimations = () => [{ finished }];
      return {
        finish: () =>
          act(async () => {
            finish();
            await finished;
          }),
        restore: () => {
          if (original) {
            (Element.prototype as { getAnimations?: unknown }).getAnimations = original;
          } else {
            delete (Element.prototype as { getAnimations?: unknown }).getAnimations;
          }
        },
      };
    }

    it('renders every panel element but only the selected panel children', () => {
      renderTabs();

      expect(screen.getAllByRole('tabpanel', { hidden: true })).toHaveLength(3);
      expect(screen.getByText('Account content')).toBeVisible();
      expect(screen.queryByText('Settings content')).not.toBeInTheDocument();
      expect(screen.queryByText('Billing content')).not.toBeInTheDocument();
    });

    it('swaps children when the selection changes', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.click(screen.getByRole('tab', { name: 'Settings' }));

      expect(screen.getByText('Settings content')).toBeVisible();
      expect(screen.queryByText('Account content')).not.toBeInTheDocument();
      expect(screen.getAllByRole('tabpanel', { hidden: true })[0]).toHaveAttribute('hidden');
    });

    it('keeps the leaving panel visible with its children until its exit animation finishes', async () => {
      const user = userEvent.setup();
      renderTabs();
      const [leaving] = screen.getAllByRole('tabpanel', { hidden: true });
      const animations = mockAnimations();
      try {
        await user.click(screen.getByRole('tab', { name: 'Settings' }));

        expect(leaving).toHaveAttribute('data-ending-style');
        expect(leaving).toHaveAttribute('inert');
        expect(leaving).not.toHaveAttribute('hidden');
        expect(screen.getByText('Account content')).toBeInTheDocument();

        await animations.finish();

        expect(leaving).toHaveAttribute('hidden');
        expect(screen.queryByText('Account content')).not.toBeInTheDocument();
      } finally {
        animations.restore();
      }
    });

    it('marks a newly selected panel with data-starting-style, but not the initial one', () => {
      function Controlled({ value }: { value: string }) {
        return (
          <Tabs.Root value={value}>
            <Tabs.List>
              <Tabs.Tab value='tab1'>Account</Tabs.Tab>
              <Tabs.Tab value='tab2'>Settings</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value='tab1'>Account content</Tabs.Panel>
            <Tabs.Panel value='tab2'>Settings content</Tabs.Panel>
          </Tabs.Root>
        );
      }
      const view = render(<Controlled value='tab1' />);
      const [first, second] = screen.getAllByRole('tabpanel', { hidden: true });
      expect(first).not.toHaveAttribute('data-starting-style');

      view.rerender(<Controlled value='tab2' />);

      expect(second).toHaveAttribute('data-starting-style');
      expect(second.style.getPropertyValue('--cl-tab-transition-direction')).toBe('1');
    });

    it('renders children before selection with keepMounted', () => {
      render(
        <Tabs.Root defaultValue='tab1'>
          <Tabs.List>
            <Tabs.Tab value='tab1'>Account</Tabs.Tab>
            <Tabs.Tab value='tab2'>Settings</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value='tab1'>Account content</Tabs.Panel>
          <Tabs.Panel
            value='tab2'
            keepMounted
          >
            Settings content
          </Tabs.Panel>
        </Tabs.Root>,
      );

      expect(screen.getByText('Settings content')).not.toBeVisible();
    });

    it('holds the leaving panel content while its exit animation runs', async () => {
      function Controlled() {
        const [value, setValue] = useState('tab1');
        return (
          <Tabs.Root
            value={value}
            onValueChange={setValue}
          >
            <Tabs.List>
              <Tabs.Tab value='tab1'>Account</Tabs.Tab>
              <Tabs.Tab value='tab2'>Settings</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value='tab1'>Account for {value}</Tabs.Panel>
            <Tabs.Panel value='tab2'>Settings content</Tabs.Panel>
          </Tabs.Root>
        );
      }
      const user = userEvent.setup();
      render(<Controlled />);
      const animations = mockAnimations();
      try {
        await user.click(screen.getByRole('tab', { name: 'Settings' }));

        expect(screen.getByText('Account for tab1')).toBeInTheDocument();
        expect(screen.queryByText('Account for tab2')).not.toBeInTheDocument();

        await animations.finish();
      } finally {
        animations.restore();
      }
    });

    it('server-renders only the selected panel children', () => {
      const html = renderToString(
        <Tabs.Root defaultValue='tab1'>
          <Tabs.List>
            <Tabs.Tab value='tab1'>Account</Tabs.Tab>
            <Tabs.Tab value='tab2'>Settings</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value='tab1'>Account content</Tabs.Panel>
          <Tabs.Panel value='tab2'>Settings content</Tabs.Panel>
        </Tabs.Root>,
      );

      expect(html).toContain('Account content');
      expect(html).not.toContain('Settings content');
    });
  });

  describe('transition direction', () => {
    function renderTwoTabs() {
      return render(
        <Tabs.Root
          defaultValue='tab1'
          activationMode='manual'
        >
          <Tabs.List>
            <Tabs.Tab value='tab1'>One</Tabs.Tab>
            <Tabs.Tab value='tab2'>Two</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value='tab1'>One content</Tabs.Panel>
          <Tabs.Panel value='tab2'>Two content</Tabs.Panel>
        </Tabs.Root>,
      );
    }

    it('does not flip direction backward when re-selecting the active tab', async () => {
      const user = userEvent.setup();
      renderTwoTabs();

      const panel = screen.getAllByRole('tabpanel', { hidden: true })[1];

      // Moving forward to tab2 sets direction = 1.
      await user.click(screen.getByRole('tab', { name: 'Two' }));
      expect(panel.style.getPropertyValue('--cl-tab-transition-direction')).toBe('1');

      // Re-selecting the already-active tab must not flip direction to -1.
      await user.click(screen.getByRole('tab', { name: 'Two' }));
      expect(panel.style.getPropertyValue('--cl-tab-transition-direction')).toBe('1');
    });
  });
});
