import { ClerkInstanceContext } from '@clerk/shared/react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { EnvironmentProvider } from '../../contexts';
import { AppearanceProvider } from '../../customizables';
import { InternalThemeProvider } from '../../styledSystem';
import { Drawer } from '../Drawer';
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

describe('Drawer', () => {
  it('does not close the Drawer when Escape dismisses an open nested Select', async () => {
    const user = userEvent.setup({ delay: null });
    const onOpenChange = vi.fn();

    render(
      <Drawer.Root
        open
        onOpenChange={onOpenChange}
      >
        <Drawer.Content>
          <Select
            options={options}
            value={null}
            onChange={vi.fn()}
            portal
          >
            <SelectButton />
            <SelectOptionList />
          </Select>
        </Drawer.Content>
      </Drawer.Root>,
      { wrapper: TestProviders },
    );

    await user.click(screen.getByRole('button', { name: 'Select an option' }));
    const listbox = await screen.findByRole('listbox');

    // A real browser moves focus into the open Select; jsdom does not, so focus
    // it explicitly before dispatching Escape from within it.
    listbox.focus();
    fireEvent.keyDown(listbox, { key: 'Escape', code: 'Escape' });

    // Escape closes the nested Select but must not bubble up to dismiss the
    // Drawer itself.
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
