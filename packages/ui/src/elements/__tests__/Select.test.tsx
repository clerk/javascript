import { ClerkInstanceContext } from '@clerk/shared/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PropsWithChildren, ReactElement } from 'react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { EnvironmentProvider } from '../../contexts';
import { AppearanceProvider } from '../../customizables';
import { InternalThemeProvider } from '../../styledSystem';
import { Select, SelectButton, SelectOptionList } from '../Select';

const options = [
  { value: 'one', label: 'One' },
  { value: 'two', label: 'Two' },
];

const TestProviders = ({ children }: PropsWithChildren) => (
  <ClerkInstanceContext.Provider value={{ value: { client: {}, user: {} } as any }}>
    <EnvironmentProvider value={{ displayConfig: { applicationName: 'TestApp' } } as any}>
      <AppearanceProvider>
        <InternalThemeProvider>{children}</InternalThemeProvider>
      </AppearanceProvider>
    </EnvironmentProvider>
  </ClerkInstanceContext.Provider>
);

const renderSelect = (ui: ReactElement) => {
  return render(ui, { wrapper: TestProviders });
};

describe('Select', () => {
  it('labels the listbox with the generated trigger id by default', async () => {
    const user = userEvent.setup();
    renderSelect(
      <Select
        options={options}
        value={null}
        onChange={vi.fn()}
      />,
    );

    const button = screen.getByRole('button', { name: 'Select an option' });

    await user.click(button);

    const listbox = await screen.findByRole('listbox');

    expect(button).toHaveAttribute('id');
    expect(listbox).toHaveAttribute('id');
    expect(listbox).toHaveAttribute('aria-labelledby', button.id);
    expect(button).toHaveAttribute('aria-controls', listbox.id);
  });

  it('labels the listbox with an explicit trigger id', async () => {
    const user = userEvent.setup();
    renderSelect(
      <Select
        options={options}
        value={null}
        onChange={vi.fn()}
      >
        <SelectButton id='expiration-field' />
        <SelectOptionList />
      </Select>,
    );

    const button = document.getElementById('expiration-field') as HTMLButtonElement;

    await user.click(button);

    const listbox = await screen.findByRole('listbox');

    expect(listbox).toHaveAttribute('aria-labelledby', 'expiration-field');
    expect(button).toHaveAttribute('aria-controls', listbox.id);
  });

  it('preserves an explicit listbox aria-label', async () => {
    const user = userEvent.setup();
    renderSelect(
      <Select
        options={options}
        value={null}
        onChange={vi.fn()}
      >
        <SelectButton />
        <SelectOptionList aria-label='Expiration options' />
      </Select>,
    );

    await user.click(screen.getByRole('button', { name: 'Select an option' }));

    const listbox = await screen.findByRole('listbox', { name: 'Expiration options' });

    expect(listbox).toHaveAttribute('aria-label', 'Expiration options');
    expect(listbox).not.toHaveAttribute('aria-labelledby');
  });

  it('opens the listbox when ArrowDown is pressed on the focused trigger', async () => {
    const user = userEvent.setup();
    renderSelect(
      <Select
        options={options}
        value={null}
        onChange={vi.fn()}
      />,
    );

    const button = screen.getByRole('button', { name: 'Select an option' });
    button.focus();
    await user.keyboard('{ArrowDown}');

    expect(await screen.findByRole('listbox')).toBeInTheDocument();
  });

  it('opens the listbox when ArrowUp is pressed on the focused trigger', async () => {
    const user = userEvent.setup();
    renderSelect(
      <Select
        options={options}
        value={null}
        onChange={vi.fn()}
      />,
    );

    const button = screen.getByRole('button', { name: 'Select an option' });
    button.focus();
    await user.keyboard('{ArrowUp}');

    expect(await screen.findByRole('listbox')).toBeInTheDocument();
  });

  it('navigates and selects an option with the keyboard', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSelect(
      <Select
        options={options}
        value={null}
        onChange={onChange}
      />,
    );

    const button = screen.getByRole('button', { name: 'Select an option' });
    button.focus();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    // Opening highlights the first option; ArrowDown advances to the second.
    await user.keyboard('{ArrowDown}{Enter}');

    expect(onChange).toHaveBeenCalledWith(options[1]);
  });

  it('exposes the active option through aria-activedescendant on the listbox (select mode)', async () => {
    const user = userEvent.setup();
    renderSelect(
      <Select
        options={options}
        value={null}
        onChange={vi.fn()}
      />,
    );

    const button = screen.getByRole('button', { name: 'Select an option' });
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');

    button.focus();
    await user.keyboard('{ArrowDown}');

    const listbox = await screen.findByRole('listbox');
    const activeId = listbox.getAttribute('aria-activedescendant');
    expect(activeId).toBeTruthy();

    const activeOption = activeId ? document.getElementById(activeId) : null;
    expect(activeOption).toHaveAttribute('role', 'option');
    // The searchbox combobox role only applies to the searchable variant.
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('marks the search input as a combobox controlling the listbox (combobox mode)', async () => {
    const user = userEvent.setup();
    renderSelect(
      <Select
        options={options}
        value={null}
        onChange={vi.fn()}
        searchPlaceholder='Search'
        comparator={(term, option) => (option.label ?? '').toLowerCase().includes(term.toLowerCase())}
      >
        <SelectButton />
        <SelectOptionList />
      </Select>,
    );

    await user.click(screen.getByRole('button', { name: 'Select an option' }));

    const listbox = await screen.findByRole('listbox');
    const combobox = screen.getByRole('combobox');

    expect(combobox).toHaveAttribute('aria-controls', listbox.id);
    expect(combobox).toHaveAttribute('aria-autocomplete', 'list');
    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    // In combobox mode the active descendant lives on the input, not the listbox.
    expect(listbox).not.toHaveAttribute('aria-activedescendant');

    combobox.focus();
    await user.keyboard('{ArrowDown}');

    const activeId = combobox.getAttribute('aria-activedescendant');
    expect(activeId).toBeTruthy();
    const activeOption = activeId ? document.getElementById(activeId) : null;
    expect(activeOption).toHaveAttribute('role', 'option');
  });

  it('preserves an explicit listbox aria-labelledby', async () => {
    const user = userEvent.setup();
    renderSelect(
      <Select
        options={options}
        value={null}
        onChange={vi.fn()}
      >
        <span id='external-label'>External options</span>
        <SelectButton />
        <SelectOptionList aria-labelledby='external-label' />
      </Select>,
    );

    const button = screen.getByRole('button', { name: 'Select an option' });

    await user.click(button);

    const listbox = await screen.findByRole('listbox', { name: 'External options' });

    expect(listbox).toHaveAttribute('aria-labelledby', 'external-label');
    expect(listbox).not.toHaveAttribute('aria-labelledby', button.id);
  });

  describe('multiple', () => {
    const fruits = [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry' },
    ];

    it('adds a clicked option to the selection and keeps the listbox open', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelect(
        <Select
          multiple
          options={fruits}
          value={['apple']}
          onChange={onChange}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Apple' }));
      await user.click(await screen.findByRole('option', { name: 'Cherry' }));

      expect(onChange).toHaveBeenCalledWith(['apple', 'cherry']);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('removes a clicked option that is already selected', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelect(
        <Select
          multiple
          options={fruits}
          value={['apple', 'banana']}
          onChange={onChange}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Apple, Banana' }));
      await user.click(await screen.findByRole('option', { name: 'Apple' }));

      expect(onChange).toHaveBeenCalledWith(['banana']);
    });

    it('toggles the active option with Enter and keeps the listbox open', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelect(
        <Select
          multiple
          options={fruits}
          value={[]}
          onChange={onChange}
        />,
      );

      const button = screen.getByRole('button', { name: 'Select an option' });
      button.focus();
      await user.keyboard('{ArrowDown}');
      await screen.findByRole('listbox');
      await user.keyboard('{ArrowDown}{Enter}');

      expect(onChange).toHaveBeenCalledWith(['banana']);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('marks the listbox multiselectable and every selected option as selected', async () => {
      const user = userEvent.setup();
      renderSelect(
        <Select
          multiple
          options={fruits}
          value={['apple', 'cherry']}
          onChange={vi.fn()}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Apple, Cherry' }));

      expect(await screen.findByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
      expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('aria-selected', 'true');
    });

    it('shows the selected labels in selection order, or the placeholder when none are selected', () => {
      const { rerender } = renderSelect(
        <Select
          multiple
          options={fruits}
          value={['cherry', 'apple']}
          onChange={vi.fn()}
        />,
      );

      expect(screen.getByRole('button', { name: 'Cherry, Apple' })).toBeInTheDocument();

      rerender(
        <Select
          multiple
          options={fruits}
          value={[]}
          onChange={vi.fn()}
        />,
      );

      expect(screen.getByRole('button', { name: 'Select an option' })).toBeInTheDocument();
    });

    it('passes the selected state of each option to renderOption', async () => {
      const user = userEvent.setup();
      renderSelect(
        <Select
          multiple
          options={fruits}
          value={['banana', 'cherry']}
          onChange={vi.fn()}
          renderOption={(option, _index, isSelected) => (
            <span>
              {option.label}
              {isSelected ? ' (checked)' : ''}
            </span>
          )}
        >
          <SelectButton>2 fruits</SelectButton>
          <SelectOptionList />
        </Select>,
      );

      await user.click(screen.getByRole('button', { name: '2 fruits' }));

      expect(await screen.findByRole('option', { name: 'Apple' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Banana (checked)' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Cherry (checked)' })).toBeInTheDocument();
    });

    it('keeps selected options that the search hides', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelect(
        <Select
          multiple
          options={fruits}
          value={['apple']}
          onChange={onChange}
          searchPlaceholder='Search'
          comparator={(term, option) => (option.label ?? '').toLowerCase().includes(term.toLowerCase())}
        >
          <SelectButton />
          <SelectOptionList />
        </Select>,
      );

      await user.click(screen.getByRole('button', { name: 'Apple' }));
      await user.type(screen.getByRole('combobox'), 'cher');
      expect(screen.queryByRole('option', { name: 'Apple' })).not.toBeInTheDocument();
      await user.click(screen.getByRole('option', { name: 'Cherry' }));

      expect(onChange).toHaveBeenCalledWith(['apple', 'cherry']);
    });

    it('highlights the first selected option when the listbox opens', async () => {
      const user = userEvent.setup();
      renderSelect(
        <Select
          multiple
          options={fruits}
          value={['cherry', 'banana']}
          onChange={vi.fn()}
        />,
      );

      const button = screen.getByRole('button', { name: 'Cherry, Banana' });
      button.focus();
      await user.keyboard('{ArrowDown}');

      const listbox = await screen.findByRole('listbox');
      const activeId = listbox.getAttribute('aria-activedescendant');
      expect(activeId ? document.getElementById(activeId) : null).toHaveAccessibleName('Banana');
    });
  });

  describe('disabled options', () => {
    const fruits = [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana', disabled: true },
      { value: 'cherry', label: 'Cherry' },
    ];

    it('marks a disabled option as aria-disabled and passes data-disabled to the rendered option', async () => {
      const user = userEvent.setup();
      renderSelect(
        <Select
          multiple
          options={fruits}
          value={[]}
          onChange={vi.fn()}
          renderOption={option => <span data-testid={`render-${option.value}`}>{option.label}</span>}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Select an option' }));

      expect(await screen.findByRole('option', { name: 'Banana' })).toHaveAttribute('aria-disabled', 'true');
      expect(screen.getByRole('option', { name: 'Apple' })).not.toHaveAttribute('aria-disabled');
      expect(screen.getByTestId('render-banana')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByTestId('render-apple')).not.toHaveAttribute('data-disabled', 'true');
    });

    it('ignores a click on a disabled option in multiple mode', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelect(
        <Select
          multiple
          options={fruits}
          value={['apple']}
          onChange={onChange}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Apple' }));
      await user.click(await screen.findByRole('option', { name: 'Banana' }));

      expect(onChange).not.toHaveBeenCalled();
    });

    it('ignores a click on a disabled option in single mode and keeps the listbox open', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelect(
        <Select
          options={fruits}
          value='apple'
          onChange={onChange}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Apple' }));
      await user.click(await screen.findByRole('option', { name: 'Banana' }));

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('skips disabled options with the arrow keys', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelect(
        <Select
          multiple
          options={fruits}
          value={[]}
          onChange={onChange}
        />,
      );

      screen.getByRole('button', { name: 'Select an option' }).focus();
      await user.keyboard('{ArrowDown}');
      await screen.findByRole('listbox');
      await user.keyboard('{ArrowDown}{Enter}');

      expect(onChange).toHaveBeenCalledWith(['cherry']);
    });

    it('does not highlight or select a disabled selected option with Enter', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelect(
        <Select
          multiple
          options={fruits}
          value={['banana']}
          onChange={onChange}
        />,
      );

      screen.getByRole('button', { name: 'Banana' }).focus();
      await user.keyboard('{ArrowDown}');
      const listbox = await screen.findByRole('listbox');
      const activeId = listbox.getAttribute('aria-activedescendant');
      expect(activeId ? document.getElementById(activeId) : null).not.toHaveAccessibleName('Banana');

      await user.keyboard('{Enter}');
      expect(onChange).not.toHaveBeenCalledWith([]);
    });

    it('still lets a selected option be removed when other options are disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelect(
        <Select
          multiple
          options={fruits}
          value={['apple', 'cherry']}
          onChange={onChange}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Apple, Cherry' }));
      await user.click(await screen.findByRole('option', { name: 'Cherry' }));

      expect(onChange).toHaveBeenCalledWith(['apple']);
    });
  });

  describe('search', () => {
    const fruits = [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana', disabled: true },
      { value: 'blueberry', label: 'Blueberry' },
      { value: 'cherry', label: 'Cherry' },
    ];
    const comparator = (term: string, option: { label?: string }) =>
      (option.label ?? '').toLowerCase().includes(term.toLowerCase());

    const ControlledMultiple = ({ onChange }: { onChange: (value: Array<string | null>) => void }) => {
      const [value, setValue] = useState<Array<string | null>>([]);
      return (
        <Select
          multiple
          options={fruits}
          value={value}
          onChange={next => {
            onChange(next);
            setValue(next);
          }}
          searchPlaceholder='Search'
          comparator={comparator}
        >
          <SelectButton />
          <SelectOptionList />
        </Select>
      );
    };

    it('toggles a filtered option off with a second Enter in multiple mode', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelect(<ControlledMultiple onChange={onChange} />);

      await user.click(screen.getByRole('button', { name: 'Select an option' }));
      await user.type(screen.getByRole('combobox'), 'cher');
      await user.keyboard('{Enter}');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenNthCalledWith(1, ['cherry']);
      expect(onChange).toHaveBeenNthCalledWith(2, []);
    });

    it('highlights the first enabled result when the filter changes', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelect(<ControlledMultiple onChange={onChange} />);

      await user.click(screen.getByRole('button', { name: 'Select an option' }));
      await user.type(screen.getByRole('combobox'), 'b');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith(['blueberry']);
    });
  });
});
