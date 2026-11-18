import { ClerkInstanceContext } from '@clerk/shared/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PropsWithChildren, ReactElement } from 'react';
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
});
