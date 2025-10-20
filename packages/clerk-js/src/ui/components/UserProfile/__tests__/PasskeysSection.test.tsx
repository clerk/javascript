import type { PasskeyJSON, PasskeyResource } from '@clerk/shared/types';
import { act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import { PasskeySection } from '../PasskeySection';

const { createFixtures } = bindCreateFixtures('UserProfile');

const passkeys = [
  {
    object: 'passkey',
    id: '1234',
    name: 'Chrome on Mac',
    created_at: Date.now(),
    last_used_at: Date.now(),
    verification: null,
    updated_at: Date.now(),
  },
] satisfies PasskeyJSON[];

const withPasskeys = createFixtures.config(f => {
  f.withPasskey();
  f.withUser({
    passkeys,
  });
});

const getMenuItemFromText = (element: HTMLElement) => {
  return element.parentElement?.parentElement?.parentElement?.children[1];
};

describe('PasskeySection', () => {
  it('renders the section', async () => {
    const { wrapper, fixtures } = await createFixtures(withPasskeys);

    fixtures.clerk.user!.getSessions.mockReturnValue(Promise.resolve([]));

    const { getByText } = render(
      <CardStateProvider>
        <PasskeySection />
      </CardStateProvider>,
      { wrapper },
    );
    getByText(/Passkeys/i);
    passkeys.forEach(passkey => getByText(passkey.name));
  });

  describe('Add passkey', () => {
    it('renders add passkey button', async () => {
      const { wrapper } = await createFixtures(withPasskeys);

      const { getByRole } = render(
        <CardStateProvider>
          <PasskeySection />
        </CardStateProvider>,
        { wrapper },
      );
      getByRole('button', { name: 'Add a passkey' });
    });

    it('create a new passkey', async () => {
      const { wrapper, fixtures } = await createFixtures(withPasskeys);

      fixtures.clerk.user?.createPasskey.mockReturnValueOnce(Promise.resolve({} as any));
      const { getByRole, userEvent } = render(
        <CardStateProvider>
          <PasskeySection />
        </CardStateProvider>,
        { wrapper },
      );

      await userEvent.click(getByRole('button', { name: 'Add a passkey' }));
      expect(fixtures.clerk.user?.createPasskey).toHaveBeenCalled();
    });
  });

  describe('Update a passkey', () => {
    it('Renders the update screen', async () => {
      const { wrapper } = await createFixtures(withPasskeys);

      const { getByText, userEvent, getByRole } = render(
        <CardStateProvider>
          <PasskeySection />
        </CardStateProvider>,
        { wrapper },
      );

      const item = getByText(passkeys[0].name);
      const menuButton = getMenuItemFromText(item);
      await act(async () => {
        await userEvent.click(menuButton!);
      });

      await userEvent.click(getByRole('menuitem', { name: /rename/i }));
      await waitFor(() => getByRole('heading', { name: /Rename passkey/i }));
      getByText('You can change the passkey name to make it easier to find.');
    });

    it('update the name of a new passkey', async () => {
      const { wrapper, fixtures } = await createFixtures(withPasskeys);

      fixtures.clerk.user?.passkeys[0].update.mockResolvedValue({} as PasskeyResource);
      const { getByRole, userEvent, getByText, getByLabelText } = render(
        <CardStateProvider>
          <PasskeySection />
        </CardStateProvider>,
        { wrapper },
      );

      const item = getByText(passkeys[0].name);
      const menuButton = getMenuItemFromText(item);
      await act(async () => {
        await userEvent.click(menuButton!);
      });

      await userEvent.click(getByRole('menuitem', { name: /rename/i }));
      await waitFor(() => getByLabelText(/Name of Passkey/i));
      expect(getByRole('button', { name: /save$/i })).toHaveAttribute('disabled');
      await userEvent.type(getByLabelText(/Name of Passkey/i), 'os');
      expect(getByRole('button', { name: /save$/i })).not.toHaveAttribute('disabled');
      await userEvent.click(getByRole('button', { name: /save$/i }));
      expect(fixtures.clerk.user?.passkeys[0].update).toHaveBeenCalledWith({ name: 'Chrome on Macos' });
    });
  });

  describe('Remove passkey', () => {
    it('Renders remove screen', async () => {
      const { wrapper } = await createFixtures(withPasskeys);

      const { getByText, userEvent, getByRole } = render(
        <CardStateProvider>
          <PasskeySection />
        </CardStateProvider>,
        { wrapper },
      );

      const item = getByText(passkeys[0].name);
      const menuButton = getMenuItemFromText(item);
      await act(async () => {
        await userEvent.click(menuButton!);
      });

      getByRole('menuitem', { name: /remove/i });
      await userEvent.click(getByRole('menuitem', { name: /remove/i }));
      await waitFor(() => getByRole('heading', { name: /remove passkey/i }));
      getByText(`${passkeys[0].name} will be removed from this account.`);
    });

    it('removes a passkey', async () => {
      const { wrapper, fixtures } = await createFixtures(withPasskeys);
      const { getByText, userEvent, getByRole } = render(
        <CardStateProvider>
          <PasskeySection />
        </CardStateProvider>,
        { wrapper },
      );

      const deleteMock = fixtures.clerk.user?.passkeys?.[0]?.delete;
      if (deleteMock) {
        vi.mocked(deleteMock).mockResolvedValue({
          object: 'passkey',
          deleted: true,
        });
      }

      const item = getByText(passkeys[0].name);
      const menuButton = getMenuItemFromText(item);
      await act(async () => {
        await userEvent.click(menuButton!);
      });

      getByRole('menuitem', { name: /remove/i });
      await userEvent.click(getByRole('menuitem', { name: /remove/i }));
      await waitFor(() => getByRole('heading', { name: /remove passkey/i }));

      await userEvent.click(getByRole('button', { name: /remove/i }));
      expect(fixtures.clerk.user?.passkeys[0].delete).toHaveBeenCalled();
    });

    describe('Form buttons', () => {
      it('hides screen when when pressing cancel', async () => {
        const { wrapper } = await createFixtures(withPasskeys);
        const { getByRole, userEvent, getByText } = render(
          <CardStateProvider>
            <PasskeySection />
          </CardStateProvider>,
          { wrapper },
        );

        const item = getByText(passkeys[0].name);
        const menuButton = getMenuItemFromText(item);
        await act(async () => {
          await userEvent.click(menuButton!);
        });

        getByRole('menuitem', { name: /remove/i });
        await userEvent.click(getByRole('menuitem', { name: /remove/i }));
        await waitFor(() => getByRole('heading', { name: /remove passkey/i }));

        await userEvent.click(getByRole('button', { name: /cancel$/i }));
        // The form should close when cancel is clicked
        await waitFor(() => {
          expect(getByRole('button', { name: /add a passkey/i })).toBeInTheDocument();
        });
      });
    });
  });

  describe('Handles opening/closing actions', () => {
    it('closes remove passkey form when add a passkey action is clicked', async () => {
      const { wrapper } = await createFixtures(withPasskeys);
      const { getByRole, userEvent, getByText } = render(
        <CardStateProvider>
          <PasskeySection />
        </CardStateProvider>,
        { wrapper },
      );

      const item = getByText(passkeys[0].name);
      const menuButton = getMenuItemFromText(item);
      await act(async () => {
        await userEvent.click(menuButton!);
      });

      getByRole('menuitem', { name: /remove/i });
      await userEvent.click(getByRole('menuitem', { name: /remove/i }));
      await waitFor(() => getByRole('heading', { name: /remove passkey/i }));

      await userEvent.click(getByRole('button', { name: /add a passkey/i }));

      // The form should close when add passkey is clicked
      await waitFor(() => {
        expect(getByRole('button', { name: /add a passkey/i })).toBeInTheDocument();
      });
    });
  });
});
