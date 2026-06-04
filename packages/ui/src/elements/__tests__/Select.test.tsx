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
