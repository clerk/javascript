import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from '../../test-utils/axe';
import { Popover } from '../popover/popover';
import { Autocomplete } from './autocomplete';

afterEach(() => cleanup());

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
];

function FilteredAutocomplete(
  props: {
    onValueChange?: (value: string) => void;
    onInputValueChange?: (value: string) => void;
    defaultInputValue?: string;
  } = {},
) {
  const [inputValue, setInputValue] = useState(props.defaultInputValue ?? '');
  const filtered = fruits.filter(f => f.label.toLowerCase().startsWith(inputValue.toLowerCase()));

  return (
    <Autocomplete
      inputValue={inputValue}
      onInputValueChange={v => {
        setInputValue(v);
        props.onInputValueChange?.(v);
      }}
      onValueChange={props.onValueChange}
    >
      <Autocomplete.Input placeholder='Search fruits...' />
      <Autocomplete.Positioner>
        <Autocomplete.Popup>
          {filtered.map(f => (
            <Autocomplete.Option
              key={f.value}
              value={f.value}
              label={f.label}
            >
              {f.label}
            </Autocomplete.Option>
          ))}
        </Autocomplete.Popup>
      </Autocomplete.Positioner>
    </Autocomplete>
  );
}

function StaticAutocomplete(props: Partial<React.ComponentProps<typeof Autocomplete>> = {}) {
  return (
    <Autocomplete {...props}>
      <Autocomplete.Input placeholder='Search fruits...' />
      <Autocomplete.Positioner>
        <Autocomplete.Popup>
          {fruits.map(f => (
            <Autocomplete.Option
              key={f.value}
              value={f.value}
              label={f.label}
            >
              {f.label}
            </Autocomplete.Option>
          ))}
        </Autocomplete.Popup>
      </Autocomplete.Positioner>
    </Autocomplete>
  );
}

describe('Autocomplete', () => {
  describe('slot attributes', () => {
    it('renders input with data-cl-slot', () => {
      render(<StaticAutocomplete />);
      const input = screen.getByPlaceholderText('Search fruits...');
      expect(input).toHaveAttribute('data-cl-slot', 'autocomplete-input');
    });

    it('renders all parts with correct slot attributes when open', () => {
      render(<StaticAutocomplete defaultOpen />);

      expect(document.querySelector('[data-cl-slot="autocomplete-positioner"]')).toBeInTheDocument();
      expect(document.querySelector('[data-cl-slot="autocomplete-popup"]')).toBeInTheDocument();
      expect(document.querySelectorAll('[data-cl-slot="autocomplete-option"]')).toHaveLength(4);
    });
  });

  describe('open/close', () => {
    it('opens when user types', async () => {
      const user = userEvent.setup();
      render(<FilteredAutocomplete />);

      const input = screen.getByPlaceholderText('Search fruits...');
      await user.type(input, 'a');

      expect(document.querySelector('[data-cl-slot="autocomplete-popup"]')).toBeInTheDocument();
    });

    it('closes when input is cleared', async () => {
      const user = userEvent.setup();
      render(<FilteredAutocomplete />);

      const input = screen.getByPlaceholderText('Search fruits...');
      await user.type(input, 'a');

      expect(document.querySelector('[data-cl-slot="autocomplete-popup"]')).toBeInTheDocument();

      await user.clear(input);

      expect(input).toHaveAttribute('data-cl-closed', '');
    });

    it('closes on Escape', async () => {
      const user = userEvent.setup();
      render(<FilteredAutocomplete />);

      const input = screen.getByPlaceholderText('Search fruits...');
      await user.type(input, 'a');
      await user.keyboard('{Escape}');

      expect(input).toHaveAttribute('data-cl-closed', '');
    });

    it('calls onOpenChange when toggled', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      render(<StaticAutocomplete onOpenChange={onOpenChange} />);

      const input = screen.getByPlaceholderText('Search fruits...');
      await user.type(input, 'a');

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('filtering', () => {
    it('filters options based on input', async () => {
      const user = userEvent.setup();
      render(<FilteredAutocomplete />);

      const input = screen.getByPlaceholderText('Search fruits...');
      await user.type(input, 'ch');

      const options = document.querySelectorAll('[data-cl-slot="autocomplete-option"]');
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent('Cherry');
    });

    it('shows all matching options', async () => {
      const user = userEvent.setup();
      render(<FilteredAutocomplete />);

      const input = screen.getByPlaceholderText('Search fruits...');
      await user.type(input, 'a');

      const options = document.querySelectorAll('[data-cl-slot="autocomplete-option"]');
      expect(options).toHaveLength(1); // Only "Apple" starts with "a"
    });
  });

  describe('selection', () => {
    it('selects option on click', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      render(<FilteredAutocomplete onValueChange={onValueChange} />);

      const input = screen.getByPlaceholderText('Search fruits...');
      await user.type(input, 'b');
      await user.click(screen.getByText('Banana'));

      expect(onValueChange).toHaveBeenCalledWith('banana');
    });

    it('updates input value to label on selection', async () => {
      const user = userEvent.setup();
      render(<FilteredAutocomplete />);

      const input = screen.getByPlaceholderText('Search fruits...') as HTMLInputElement;
      await user.type(input, 'b');
      await user.click(screen.getByText('Banana'));

      expect(input.value).toBe('Banana');
    });

    it('closes after selection', async () => {
      const user = userEvent.setup();
      render(<FilteredAutocomplete />);

      const input = screen.getByPlaceholderText('Search fruits...');
      await user.type(input, 'b');
      await user.click(screen.getByText('Banana'));

      expect(input).toHaveAttribute('data-cl-closed', '');
    });

    it('returns focus to input after click selection', async () => {
      const user = userEvent.setup();
      render(<FilteredAutocomplete />);

      const input = screen.getByPlaceholderText('Search fruits...');
      await user.type(input, 'b');
      await user.click(screen.getByText('Banana'));

      expect(document.activeElement).toBe(input);
    });
  });

  describe('keyboard navigation', () => {
    it('navigates options with arrow keys', async () => {
      const user = userEvent.setup();
      render(<FilteredAutocomplete />);

      const input = screen.getByPlaceholderText('Search fruits...');
      await user.type(input, 'a');
      await user.keyboard('{ArrowDown}');

      const activeOption = document.querySelector('[data-cl-slot="autocomplete-option"][data-cl-active]');
      expect(activeOption).toBeInTheDocument();
    });

    it('selects option on Enter', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      render(<FilteredAutocomplete onValueChange={onValueChange} />);

      const input = screen.getByPlaceholderText('Search fruits...');
      await user.type(input, 'b');
      // activeIndex starts at 0 when typing opens the list
      await user.keyboard('{Enter}');

      expect(onValueChange).toHaveBeenCalledWith('banana');
    });

    it('updates input value on Enter selection', async () => {
      const user = userEvent.setup();
      render(<FilteredAutocomplete />);

      const input = screen.getByPlaceholderText('Search fruits...') as HTMLInputElement;
      await user.type(input, 'b');
      await user.keyboard('{Enter}');

      expect(input.value).toBe('Banana');
    });

    it('focus stays on input during arrow navigation', async () => {
      const user = userEvent.setup();
      render(<FilteredAutocomplete />);

      const input = screen.getByPlaceholderText('Search fruits...');
      await user.type(input, 'a');
      await user.keyboard('{ArrowDown}');

      expect(document.activeElement).toBe(input);
    });
  });

  describe('option state attributes', () => {
    it('marks active option with data-cl-active', async () => {
      const user = userEvent.setup();
      render(<FilteredAutocomplete />);

      await user.type(screen.getByPlaceholderText('Search fruits...'), 'a');

      // First option is active by default (activeIndex starts at 0)
      const options = document.querySelectorAll('[data-cl-slot="autocomplete-option"]');
      expect(options[0]).toHaveAttribute('data-cl-active', '');
    });

    it('marks selected option with data-cl-selected', async () => {
      const user = userEvent.setup();
      render(
        <StaticAutocomplete
          defaultValue='banana'
          defaultOpen
        />,
      );

      const options = document.querySelectorAll('[data-cl-slot="autocomplete-option"]');
      expect(options[1]).toHaveAttribute('data-cl-selected', '');
    });
  });

  describe('ARIA attributes', () => {
    it('input has role=combobox', () => {
      render(<StaticAutocomplete />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('input has aria-autocomplete=list', () => {
      render(<StaticAutocomplete />);
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('options have role=option', () => {
      render(<StaticAutocomplete defaultOpen />);
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(4);
    });

    it('active option has aria-selected=true', async () => {
      const user = userEvent.setup();
      render(<FilteredAutocomplete />);

      await user.type(screen.getByPlaceholderText('Search fruits...'), 'a');

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('animation lifecycle', () => {
    it('positioner is not rendered when closed', () => {
      render(<StaticAutocomplete />);
      expect(document.querySelector('[data-cl-slot="autocomplete-positioner"]')).not.toBeInTheDocument();
    });

    it('applies data-cl-open on popup when open', async () => {
      const user = userEvent.setup();
      render(<FilteredAutocomplete />);

      await user.type(screen.getByPlaceholderText('Search fruits...'), 'a');

      const popup = document.querySelector('[data-cl-slot="autocomplete-popup"]');
      expect(popup).toHaveAttribute('data-cl-open', '');
    });

    it('positioner has data-cl-side', async () => {
      const user = userEvent.setup();
      render(<FilteredAutocomplete />);

      await user.type(screen.getByPlaceholderText('Search fruits...'), 'a');

      const positioner = document.querySelector('[data-cl-slot="autocomplete-positioner"]');
      expect(positioner).toHaveAttribute('data-cl-side');
    });
  });

  describe('disabled option', () => {
    it('renders disabled option with data-cl-disabled', async () => {
      const user = userEvent.setup();
      render(
        <Autocomplete defaultOpen>
          <Autocomplete.Input placeholder='Search...' />
          <Autocomplete.Positioner>
            <Autocomplete.Popup>
              <Autocomplete.Option
                value='apple'
                label='Apple'
              >
                Apple
              </Autocomplete.Option>
              <Autocomplete.Option
                value='banana'
                label='Banana'
                disabled
              >
                Banana
              </Autocomplete.Option>
            </Autocomplete.Popup>
          </Autocomplete.Positioner>
        </Autocomplete>,
      );

      const disabledOption = screen.getByText('Banana').closest('[data-cl-slot="autocomplete-option"]');
      expect(disabledOption).toHaveAttribute('data-cl-disabled', '');
      expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not select disabled option on click', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      render(
        <Autocomplete
          onValueChange={onValueChange}
          defaultOpen
        >
          <Autocomplete.Input placeholder='Search...' />
          <Autocomplete.Positioner>
            <Autocomplete.Popup>
              <Autocomplete.Option
                value='apple'
                label='Apple'
              >
                Apple
              </Autocomplete.Option>
              <Autocomplete.Option
                value='banana'
                label='Banana'
                disabled
              >
                Banana
              </Autocomplete.Option>
            </Autocomplete.Popup>
          </Autocomplete.Positioner>
        </Autocomplete>,
      );

      await user.click(screen.getByText('Banana'));

      expect(onValueChange).not.toHaveBeenCalledWith('banana');
    });
  });

  describe('Autocomplete.List (inline mode)', () => {
    function InlineAutocomplete(props: { value?: string; onValueChange?: (value: string) => void } = {}) {
      const [inputValue, setInputValue] = useState('');
      const filtered = fruits.filter(f => f.label.toLowerCase().startsWith(inputValue.toLowerCase()));

      return (
        <Autocomplete
          open
          value={props.value}
          inputValue={inputValue}
          onInputValueChange={setInputValue}
          onValueChange={props.onValueChange}
        >
          <Autocomplete.Input placeholder='Search fruits...' />
          <Autocomplete.List data-testid='list'>
            {filtered.map(f => (
              <Autocomplete.Option
                key={f.value}
                value={f.value}
                label={f.label}
              >
                {f.label}
              </Autocomplete.Option>
            ))}
          </Autocomplete.List>
        </Autocomplete>
      );
    }

    it('renders options with data-cl-slot', () => {
      render(<InlineAutocomplete />);
      const options = document.querySelectorAll('[data-cl-slot="autocomplete-option"]');
      expect(options).toHaveLength(4);
    });

    it('renders list with data-cl-slot', () => {
      render(<InlineAutocomplete />);
      expect(document.querySelector('[data-cl-slot="autocomplete-list"]')).toBeInTheDocument();
    });

    it('marks selected option with data-cl-selected via controlled value', () => {
      render(<InlineAutocomplete value='banana' />);
      const options = document.querySelectorAll('[data-cl-slot="autocomplete-option"]');
      expect(options[1]).toHaveAttribute('data-cl-selected', '');
    });

    it('selects option on click', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      render(<InlineAutocomplete onValueChange={onValueChange} />);

      await user.click(screen.getByText('Banana'));

      expect(onValueChange).toHaveBeenCalledWith('banana');
    });

    it('navigates options with arrow keys', async () => {
      const user = userEvent.setup();
      render(<InlineAutocomplete />);

      const input = screen.getByPlaceholderText('Search fruits...');
      await user.click(input);
      await user.keyboard('{ArrowDown}');

      const activeOption = document.querySelector('[data-cl-slot="autocomplete-option"][data-cl-active]');
      expect(activeOption).toBeInTheDocument();
    });

    it('links the input to the inline listbox with aria-controls', () => {
      render(<InlineAutocomplete />);

      const input = screen.getByRole('combobox');
      const list = document.querySelector('[data-cl-slot="autocomplete-list"]');

      expect(list).toHaveAttribute('id');
      expect(input).toHaveAttribute('aria-controls', list?.getAttribute('id'));
    });

    it('updates aria-activedescendant during keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<InlineAutocomplete />);

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.keyboard('{ArrowDown}');

      const activeOption = document.querySelector('[data-cl-slot="autocomplete-option"][data-cl-active]');
      expect(activeOption).toHaveAttribute('id');
      expect(input).toHaveAttribute('aria-activedescendant', activeOption?.getAttribute('id'));
    });

    it('selects option on Enter after arrow navigation', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      render(<InlineAutocomplete onValueChange={onValueChange} />);

      const input = screen.getByPlaceholderText('Search fruits...');
      await user.click(input);
      await user.keyboard('{ArrowDown}{Enter}');

      expect(onValueChange).toHaveBeenCalled();
    });

    it('filters options based on input', async () => {
      const user = userEvent.setup();
      render(<InlineAutocomplete />);

      const input = screen.getByPlaceholderText('Search fruits...');
      await user.type(input, 'ch');

      const options = document.querySelectorAll('[data-cl-slot="autocomplete-option"]');
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent('Cherry');
    });

    it('preserves selected state after unmount and remount', () => {
      const { unmount } = render(<InlineAutocomplete value='cherry' />);

      let options = document.querySelectorAll('[data-cl-slot="autocomplete-option"]');
      expect(options[2]).toHaveAttribute('data-cl-selected', '');

      unmount();

      render(<InlineAutocomplete value='cherry' />);

      options = document.querySelectorAll('[data-cl-slot="autocomplete-option"]');
      expect(options[2]).toHaveAttribute('data-cl-selected', '');
    });

    it('shows selected state after selecting then remounting', async () => {
      function TestHarness() {
        const [mounted, setMounted] = useState(true);
        const [value, setValue] = useState<string | undefined>();

        return (
          <>
            <button
              type='button'
              data-testid='toggle'
              onClick={() => setMounted(m => !m)}
            />
            {mounted && (
              <InlineAutocomplete
                value={value}
                onValueChange={setValue}
              />
            )}
          </>
        );
      }

      const user = userEvent.setup();
      render(<TestHarness />);

      // Select banana
      await user.click(screen.getByText('Banana'));

      // Unmount (simulates popover close)
      await user.click(screen.getByTestId('toggle'));
      expect(document.querySelector('[data-cl-slot="autocomplete-option"]')).not.toBeInTheDocument();

      // Remount (simulates popover reopen)
      await user.click(screen.getByTestId('toggle'));

      const options = document.querySelectorAll('[data-cl-slot="autocomplete-option"]');
      expect(options[1]).toHaveAttribute('data-cl-selected', '');
    });
  });

  describe('Autocomplete.List inside Popover', () => {
    function AutocompleteInPopover() {
      const [popoverOpen, setPopoverOpen] = useState(false);
      const [selectedValue, setSelectedValue] = useState<string | undefined>();
      const [inputValue, setInputValue] = useState('');
      const selectedLabel = fruits.find(f => f.value === selectedValue)?.label;
      const filtered = fruits.filter(f => f.label.toLowerCase().startsWith(inputValue.toLowerCase()));

      return (
        <Popover
          open={popoverOpen}
          onOpenChange={open => {
            setPopoverOpen(open);
            if (open) setInputValue('');
          }}
        >
          <Popover.Trigger>{selectedLabel || 'Pick a fruit...'}</Popover.Trigger>
          <Popover.Positioner>
            <Popover.Popup>
              <Autocomplete
                open={popoverOpen}
                value={selectedValue}
                inputValue={inputValue}
                onInputValueChange={setInputValue}
                onValueChange={value => {
                  setSelectedValue(value);
                  setPopoverOpen(false);
                }}
              >
                <Autocomplete.Input
                  placeholder='Search...'
                  autoFocus
                />
                <Autocomplete.List>
                  {filtered.map(f => (
                    <Autocomplete.Option
                      key={f.value}
                      value={f.value}
                      label={f.label}
                    >
                      {f.label}
                    </Autocomplete.Option>
                  ))}
                </Autocomplete.List>
              </Autocomplete>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover>
      );
    }

    it('renders options when popover is open', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopover />);

      await user.click(screen.getByText('Pick a fruit...'));

      const options = document.querySelectorAll('[data-cl-slot="autocomplete-option"]');
      expect(options).toHaveLength(4);
    });

    it('wires the popover autocomplete input to the inline listbox', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopover />);

      await user.click(screen.getByText('Pick a fruit...'));

      const input = screen.getByRole('combobox');
      const list = document.querySelector('[data-cl-slot="autocomplete-list"]');

      expect(list).toHaveAttribute('id');
      expect(input).toHaveAttribute('aria-controls', list?.getAttribute('id'));
    });

    it('navigates options with arrow keys inside popover', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopover />);

      await user.click(screen.getByText('Pick a fruit...'));

      // Verify options rendered and input has focus
      const options = document.querySelectorAll('[data-cl-slot="autocomplete-option"]');
      expect(options.length).toBeGreaterThan(0);

      const input = screen.getByPlaceholderText('Search...');
      expect(document.activeElement).toBe(input);

      await user.keyboard('{ArrowDown}');

      const activeOption = document.querySelector('[data-cl-slot="autocomplete-option"][data-cl-active]');
      expect(activeOption).toBeInTheDocument();
    });

    it('selects option on click and updates trigger', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopover />);

      await user.click(screen.getByText('Pick a fruit...'));
      await user.click(screen.getByText('Banana'));

      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Banana').closest('[data-cl-slot="popover-trigger"]')).toBeInTheDocument();
    });

    it('shows data-cl-selected on previously selected option after reopen', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopover />);

      // Open and select
      await user.click(screen.getByText('Pick a fruit...'));
      await user.click(screen.getByText('Cherry'));

      // Reopen
      await user.click(screen.getByText('Cherry'));

      const options = document.querySelectorAll('[data-cl-slot="autocomplete-option"]');
      const cherryOption = Array.from(options).find(o => o.textContent === 'Cherry');
      expect(cherryOption).toHaveAttribute('data-cl-selected', '');
    });

    it('selects option with Enter after arrow navigation inside popover', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopover />);

      await user.click(screen.getByText('Pick a fruit...'));
      await user.keyboard('{ArrowDown}{Enter}');

      // Should have selected the first option
      expect(screen.getByText('Apple').closest('[data-cl-slot="popover-trigger"]')).toBeInTheDocument();
    });
  });

  describe('scrolling', () => {
    const manyFruits = [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry' },
      { value: 'date', label: 'Date' },
      { value: 'elderberry', label: 'Elderberry' },
      { value: 'fig', label: 'Fig' },
      { value: 'grape', label: 'Grape' },
      { value: 'honeydew', label: 'Honeydew' },
    ];

    function ScrollableAutocomplete({ defaultValue }: { defaultValue?: string }) {
      const [popoverOpen, setPopoverOpen] = useState(false);
      const [selectedValue, setSelectedValue] = useState<string | undefined>(defaultValue);
      const [inputValue, setInputValue] = useState('');
      const selectedLabel = manyFruits.find(f => f.value === selectedValue)?.label;
      const filtered = manyFruits.filter(f => f.label.toLowerCase().startsWith(inputValue.toLowerCase()));

      return (
        <Popover
          open={popoverOpen}
          onOpenChange={open => {
            setPopoverOpen(open);
            if (open) setInputValue('');
          }}
        >
          <Popover.Trigger>{selectedLabel || 'Pick a fruit...'}</Popover.Trigger>
          <Popover.Positioner>
            <Popover.Popup>
              <Autocomplete
                open={popoverOpen}
                value={selectedValue}
                inputValue={inputValue}
                onInputValueChange={setInputValue}
                onValueChange={value => {
                  setSelectedValue(value);
                  setPopoverOpen(false);
                }}
              >
                <Autocomplete.Input
                  placeholder='Search...'
                  autoFocus
                />
                <Autocomplete.List style={{ maxHeight: 80, overflowY: 'auto' }}>
                  {filtered.map(f => (
                    <Autocomplete.Option
                      key={f.value}
                      value={f.value}
                      label={f.label}
                    >
                      {f.label}
                    </Autocomplete.Option>
                  ))}
                </Autocomplete.List>
              </Autocomplete>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover>
      );
    }

    it('sets active index on arrow key navigation', async () => {
      const user = userEvent.setup();
      render(<ScrollableAutocomplete />);

      await user.click(screen.getByText('Pick a fruit...'));
      await user.keyboard('{ArrowDown}');

      const activeOption = document.querySelector('[data-cl-slot="autocomplete-option"][data-cl-active]');
      expect(activeOption).toBeInTheDocument();
    });

    it('selected item has data-cl-active on reopen', async () => {
      const user = userEvent.setup();
      render(<ScrollableAutocomplete />);

      // Open and select "Grape" (6th item)
      await user.click(screen.getByText('Pick a fruit...'));
      await user.click(screen.getByText('Grape'));

      // Reopen — trigger now shows "Grape"
      await user.click(screen.getByText('Grape').closest('[data-cl-slot="popover-trigger"]')!);

      // The selected option should be active
      const options = document.querySelectorAll('[data-cl-slot="autocomplete-option"]');
      const grapeOption = Array.from(options).find(o => o.textContent === 'Grape');
      expect(grapeOption).toHaveAttribute('data-cl-active', '');
    });

    it('selected item is active on open when defaultValue is set', async () => {
      const user = userEvent.setup();
      render(<ScrollableAutocomplete defaultValue='grape' />);

      await user.click(screen.getByText('Grape'));

      const options = document.querySelectorAll('[data-cl-slot="autocomplete-option"]');
      const grapeOption = Array.from(options).find(o => o.textContent === 'Grape');
      expect(grapeOption).toHaveAttribute('data-cl-active', '');
    });
  });

  describe('Autocomplete.List inside Popover — edge cases', () => {
    function AutocompleteInPopoverFull() {
      const [popoverOpen, setPopoverOpen] = useState(false);
      const [selectedValue, setSelectedValue] = useState<string | undefined>();
      const [inputValue, setInputValue] = useState('');
      const selectedLabel = fruits.find(f => f.value === selectedValue)?.label;
      const filtered = fruits.filter(f => f.label.toLowerCase().startsWith(inputValue.toLowerCase()));

      return (
        <Popover
          open={popoverOpen}
          onOpenChange={open => {
            setPopoverOpen(open);
            if (open) setInputValue('');
          }}
        >
          <Popover.Trigger>{selectedLabel || 'Pick a fruit...'}</Popover.Trigger>
          <Popover.Positioner>
            <Popover.Popup>
              <Autocomplete
                open={popoverOpen}
                value={selectedValue}
                inputValue={inputValue}
                onInputValueChange={setInputValue}
                onValueChange={value => {
                  setSelectedValue(value);
                  setPopoverOpen(false);
                }}
              >
                <Autocomplete.Input
                  placeholder='Search...'
                  autoFocus
                />
                <Autocomplete.List>
                  {filtered.map(f => (
                    <Autocomplete.Option
                      key={f.value}
                      value={f.value}
                      label={f.label}
                    >
                      {f.label}
                    </Autocomplete.Option>
                  ))}
                </Autocomplete.List>
              </Autocomplete>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover>
      );
    }

    it('closes popover on Escape key', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopoverFull />);

      const trigger = screen.getByText('Pick a fruit...');
      await user.click(trigger);
      expect(document.querySelectorAll('[data-cl-slot="autocomplete-option"]').length).toBeGreaterThan(0);

      await user.keyboard('{Escape}');

      // Popover should close — no options visible
      expect(document.querySelector('[data-cl-slot="autocomplete-option"]')).not.toBeInTheDocument();
      expect(document.activeElement).toBe(trigger);
    });

    it('focuses the input on open with an empty value', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopoverFull />);

      await user.click(screen.getByText('Pick a fruit...'));

      const input = screen.getByPlaceholderText('Search...') as HTMLInputElement;
      expect(document.activeElement).toBe(input);
      expect(input.value).toBe('');
    });

    it('keeps the input empty on open even when a selected item exists', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopoverFull />);

      await user.click(screen.getByText('Pick a fruit...'));
      await user.click(screen.getByText('Cherry'));

      await user.click(screen.getByText('Cherry'));

      const input = screen.getByPlaceholderText('Search...') as HTMLInputElement;
      expect(document.activeElement).toBe(input);
      expect(input.value).toBe('');
    });

    it('marks the previously selected item as active on reopen while focus stays on the input', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopoverFull />);

      await user.click(screen.getByText('Pick a fruit...'));
      await user.click(screen.getByText('Banana'));

      await user.click(screen.getByText('Banana'));

      const input = screen.getByPlaceholderText('Search...');
      const active = document.querySelector('[data-cl-slot="autocomplete-option"][data-cl-active]');

      expect(document.activeElement).toBe(input);
      expect(active).toHaveTextContent('Banana');
      expect(input).toHaveAttribute('aria-activedescendant', active?.getAttribute('id'));
    });

    it('clears input on reopen after Escape', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopoverFull />);

      await user.click(screen.getByText('Pick a fruit...'));
      const input = screen.getByPlaceholderText('Search...');
      await user.type(input, 'ch');

      // Should be filtered to Cherry only
      expect(document.querySelectorAll('[data-cl-slot="autocomplete-option"]')).toHaveLength(1);

      await user.keyboard('{Escape}');

      // Reopen
      await user.click(screen.getByText('Pick a fruit...'));

      // Input should be cleared, all options visible
      const newInput = screen.getByPlaceholderText('Search...');
      expect((newInput as HTMLInputElement).value).toBe('');
      expect(document.querySelectorAll('[data-cl-slot="autocomplete-option"]')).toHaveLength(4);
    });

    it('navigates all options with repeated ArrowDown', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopoverFull />);

      await user.click(screen.getByText('Pick a fruit...'));

      await user.keyboard('{ArrowDown}');
      let active = document.querySelector('[data-cl-slot="autocomplete-option"][data-cl-active]');
      expect(active).toHaveTextContent('Apple');

      await user.keyboard('{ArrowDown}');
      active = document.querySelector('[data-cl-slot="autocomplete-option"][data-cl-active]');
      expect(active).toHaveTextContent('Banana');

      await user.keyboard('{ArrowDown}');
      active = document.querySelector('[data-cl-slot="autocomplete-option"][data-cl-active]');
      expect(active).toHaveTextContent('Cherry');

      await user.keyboard('{ArrowDown}');
      active = document.querySelector('[data-cl-slot="autocomplete-option"][data-cl-active]');
      expect(active).toHaveTextContent('Date');
    });

    it('loops navigation with ArrowDown past last option', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopoverFull />);

      await user.click(screen.getByText('Pick a fruit...'));

      // Navigate past all 4 options to loop back
      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}');
      const active = document.querySelector('[data-cl-slot="autocomplete-option"][data-cl-active]');
      expect(active).toHaveTextContent('Apple');
    });

    it('navigates with ArrowUp', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopoverFull />);

      await user.click(screen.getByText('Pick a fruit...'));

      // ArrowUp from no active item should go to last item (loop)
      await user.keyboard('{ArrowUp}');
      const active = document.querySelector('[data-cl-slot="autocomplete-option"][data-cl-active]');
      expect(active).toHaveTextContent('Date');
    });

    it('selects with Enter after filtering and navigating', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopoverFull />);

      await user.click(screen.getByText('Pick a fruit...'));

      const input = screen.getByPlaceholderText('Search...');
      await user.type(input, 'b');

      // Only Banana should be shown, activeIndex should be 0
      expect(document.querySelectorAll('[data-cl-slot="autocomplete-option"]')).toHaveLength(1);

      await user.keyboard('{Enter}');

      // Popover should close and trigger should show Banana
      expect(screen.getByText('Banana').closest('[data-cl-slot="popover-trigger"]')).toBeInTheDocument();
    });

    it('selects the highlighted item with Enter, closes the popover, and returns focus to the trigger', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopoverFull />);

      const trigger = screen.getByText('Pick a fruit...');
      await user.click(trigger);
      await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

      const updatedTrigger = screen.getByText('Banana');
      expect(updatedTrigger.closest('[data-cl-slot="popover-trigger"]')).toBeInTheDocument();
      expect(document.querySelector('[data-cl-slot="autocomplete-option"]')).not.toBeInTheDocument();
      expect(document.activeElement).toBe(updatedTrigger);
    });

    it('keeps focus on input during keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopoverFull />);

      await user.click(screen.getByText('Pick a fruit...'));
      const input = screen.getByPlaceholderText('Search...');

      await user.keyboard('{ArrowDown}{ArrowDown}');

      expect(document.activeElement).toBe(input);
    });

    it('can type to filter after arrow navigation', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopoverFull />);

      await user.click(screen.getByText('Pick a fruit...'));

      // Navigate first
      await user.keyboard('{ArrowDown}{ArrowDown}');

      // Then type to filter
      const input = screen.getByPlaceholderText('Search...');
      await user.type(input, 'd');

      const options = document.querySelectorAll('[data-cl-slot="autocomplete-option"]');
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent('Date');
    });

    it('reopen after selection shows all options with empty input', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopoverFull />);

      // Select Cherry
      await user.click(screen.getByText('Pick a fruit...'));
      await user.click(screen.getByText('Cherry'));

      // Reopen
      await user.click(screen.getByText('Cherry'));

      // Input should be empty, all options should show
      const input = screen.getByPlaceholderText('Search...');
      expect((input as HTMLInputElement).value).toBe('');
      expect(document.querySelectorAll('[data-cl-slot="autocomplete-option"]')).toHaveLength(4);
    });

    it('selected option retains data-cl-selected on reopen', async () => {
      const user = userEvent.setup();
      render(<AutocompleteInPopoverFull />);

      await user.click(screen.getByText('Pick a fruit...'));
      await user.click(screen.getByText('Banana'));

      // Reopen
      await user.click(screen.getByText('Banana'));

      const options = document.querySelectorAll('[data-cl-slot="autocomplete-option"]');
      const bananaOption = Array.from(options).find(o => o.textContent === 'Banana');
      expect(bananaOption).toHaveAttribute('data-cl-selected', '');
    });
  });

  describe('input state attributes', () => {
    it('input has data-cl-open when list is visible', async () => {
      const user = userEvent.setup();
      render(<FilteredAutocomplete />);

      const input = screen.getByPlaceholderText('Search fruits...');
      await user.type(input, 'a');

      expect(input).toHaveAttribute('data-cl-open', '');
    });

    it('input has data-cl-closed when list is hidden', () => {
      render(<FilteredAutocomplete />);

      const input = screen.getByPlaceholderText('Search fruits...');
      expect(input).toHaveAttribute('data-cl-closed', '');
    });
  });

  describe('accessibility (axe)', () => {
    it('has no violations when closed', async () => {
      const { container } = render(<FilteredAutocomplete />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations when open', async () => {
      const user = userEvent.setup();
      render(<FilteredAutocomplete />);

      await user.click(screen.getByPlaceholderText('Search fruits...'));
      await user.keyboard('a');

      expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
    });

    it('has no violations for the inline listbox inside a popover', async () => {
      const user = userEvent.setup();
      render(
        <Popover defaultOpen>
          <Popover.Trigger>Pick a fruit...</Popover.Trigger>
          <Popover.Positioner>
            <Popover.Popup>
              <Popover.Title>Fruit picker</Popover.Title>
              <Autocomplete open>
                <Autocomplete.Input
                  placeholder='Search...'
                  autoFocus
                />
                <Autocomplete.List>
                  {fruits.map(f => (
                    <Autocomplete.Option
                      key={f.value}
                      value={f.value}
                      label={f.label}
                    >
                      {f.label}
                    </Autocomplete.Option>
                  ))}
                </Autocomplete.List>
              </Autocomplete>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover>,
      );

      await user.click(screen.getByRole('combobox'));

      expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
    });
  });
});
