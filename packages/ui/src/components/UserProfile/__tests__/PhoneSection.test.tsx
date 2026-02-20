import { act } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';
import { loadCountryCodeData } from '@/ui/elements/PhoneInput/countryCodeDataLoader';

import { PhoneSection } from '../PhoneSection';

const { createFixtures } = bindCreateFixtures('UserProfile');

beforeAll(async () => {
  await loadCountryCodeData();
});

const initConfig = createFixtures.config(f => {
  f.withPhoneNumber();
  f.withUser({ email_addresses: ['test@clerk.com'] });
});

const numbers = ['+30 691 1111111', '+30 692 2222222'];

const withNumberCofig = createFixtures.config(f => {
  f.withPhoneNumber();
  f.withUser({
    phone_numbers: numbers,
  });
});

const getMenuItemFromText = (element: HTMLElement) => {
  return element.parentElement?.parentElement?.parentElement?.children?.[1];
};

describe('PhoneSection', () => {
  it('renders the section', async () => {
    const numbers = ['+30 691 1111111', '+30 692 2222222'];
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withPhoneNumber();
      f.withUser({
        phone_numbers: numbers,
        first_name: 'George',
        last_name: 'Clerk',
      });
    });
    fixtures.clerk.user?.getSessions.mockReturnValue(Promise.resolve([]));

    const { getByText } = render(
      <CardStateProvider>
        <PhoneSection />
      </CardStateProvider>,
      { wrapper },
    );
    getByText(/Phone numbers/i);
    numbers.forEach(number => getByText(number));
  });

  describe('Add phone', () => {
    it('renders add phone screen', async () => {
      const { wrapper } = await createFixtures(initConfig);

      const { findByRole, getByRole, userEvent, getByLabelText, getByText } = render(<PhoneSection />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Add phone number' }));
      await findByRole('heading', { name: /Add phone number/i });

      getByLabelText(/phone number/i);
      getByText(/A text message containing a verification code will be sent to this phone number./i);
      getByText(/Message and data rates may apply./i);
    });

    it('create a new phone number', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      const { findByRole, getByRole, userEvent, getByLabelText } = render(<PhoneSection />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Add phone number' }));
      await findByRole('heading', { name: /Add phone number/i });

      fixtures.clerk.user?.createPhoneNumber.mockReturnValueOnce(Promise.resolve({} as any));

      await userEvent.type(getByLabelText(/phone number/i), '6911111111');
      await userEvent.click(getByRole('button', { name: /add$/i }));
      expect(fixtures.clerk.user?.createPhoneNumber).toHaveBeenCalledWith({ phoneNumber: '+16911111111' }); //default is +1
    });

    describe('Form buttons', () => {
      it('save button is disabled by default', async () => {
        const { wrapper } = await createFixtures(initConfig);
        const { findByRole, getByRole, userEvent } = render(<PhoneSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: 'Add phone number' }));
        await findByRole('heading', { name: /Add phone number/i });

        expect(screen.getByText(/add$/i, { exact: false }).closest('button')).toHaveAttribute('disabled');
      });

      it('hides screen when when pressing cancel', async () => {
        const { wrapper } = await createFixtures(initConfig);

        const { userEvent, findByRole, getByRole, queryByRole } = render(<PhoneSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: /Add phone number/i }));
        await findByRole('heading', { name: /Add phone number/i });
        expect(queryByRole('button', { name: /Add phone number/i })).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: /cancel$/i }));
        await findByRole('button', { name: /Add phone number/i });
      });
    });
  });

  describe('Remove phone', () => {
    it('Renders remove screen', async () => {
      const number = '+30 691 1111111';
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
        f.withUser({
          phone_numbers: [number],
          first_name: 'George',
          last_name: 'Clerk',
        });
      });

      const { findByRole, getByText, userEvent, getByRole } = render(
        <CardStateProvider>
          <PhoneSection />
        </CardStateProvider>,
        { wrapper },
      );

      const item = getByText(number);
      const menuButton = getMenuItemFromText(item);
      await act(async () => {
        await userEvent.click(menuButton!);
      });

      getByRole('menuitem', { name: /remove phone number/i });
      await userEvent.click(getByRole('menuitem', { name: /remove phone number/i }));
      await findByRole('heading', { name: /Remove phone number/i });
    });

    it('removes a phone number', async () => {
      const { wrapper, fixtures } = await createFixtures(withNumberCofig);
      const { findByRole, getByText, userEvent, getByRole } = render(
        <CardStateProvider>
          <PhoneSection />
        </CardStateProvider>,
        { wrapper },
      );

      fixtures.clerk.user?.phoneNumbers[0].destroy.mockResolvedValue();

      const item = getByText(numbers[0]);
      const menuButton = getMenuItemFromText(item);
      await act(async () => {
        await userEvent.click(menuButton!);
      });

      getByRole('menuitem', { name: /remove phone number/i });
      await userEvent.click(getByRole('menuitem', { name: /remove phone number/i }));
      await findByRole('heading', { name: /Remove phone number/i });

      await userEvent.click(getByRole('button', { name: /remove/i }));
      expect(fixtures.clerk.user?.phoneNumbers[0].destroy).toHaveBeenCalled();
    });

    describe('Form buttons', () => {
      it('save button is not disabled by default', async () => {
        const { wrapper } = await createFixtures(withNumberCofig);
        const { findByRole, getByRole, userEvent, getByText } = render(
          <CardStateProvider>
            <PhoneSection />
          </CardStateProvider>,
          { wrapper },
        );

        const item = getByText(numbers[0]);
        const menuButton = getMenuItemFromText(item);
        await act(async () => {
          await userEvent.click(menuButton!);
        });

        getByRole('menuitem', { name: /remove phone number/i });
        await userEvent.click(getByRole('menuitem', { name: /remove phone number/i }));
        await findByRole('heading', { name: /Remove phone number/i });
        expect(getByRole('button', { name: /remove$/i })).not.toHaveAttribute('disabled');
      });

      it('hides screen when when pressing cancel', async () => {
        const { wrapper } = await createFixtures(withNumberCofig);
        const { findByRole, findByText, getByRole, userEvent, getByText } = render(
          <CardStateProvider>
            <PhoneSection />
          </CardStateProvider>,
          { wrapper },
        );

        const item = getByText(numbers[0]);
        const menuButton = getMenuItemFromText(item);
        await act(async () => {
          await userEvent.click(menuButton!);
        });

        getByRole('menuitem', { name: /remove phone number/i });
        await userEvent.click(getByRole('menuitem', { name: /remove phone number/i }));
        await findByRole('heading', { name: /Remove phone number/i });
        await userEvent.click(screen.getByRole('button', { name: /cancel$/i }));
        await findByText(/Phone numbers/i);
      });
    });
  });

  describe('Handles opening/closing actions', () => {
    it('closes add phone number form when remove an phone number action is clicked', async () => {
      const { wrapper, fixtures } = await createFixtures(withNumberCofig);
      const { findByRole, getByText, userEvent, getByRole, queryByRole } = render(
        <CardStateProvider>
          <PhoneSection />
        </CardStateProvider>,
        { wrapper },
      );

      fixtures.clerk.user?.phoneNumbers[0].destroy.mockResolvedValue();

      await userEvent.click(getByRole('button', { name: /add phone number/i }));
      await findByRole('heading', { name: /add phone number/i });

      const item = getByText(numbers[0]);
      const menuButton = getMenuItemFromText(item);
      await act(async () => {
        await userEvent.click(menuButton!);
      });

      getByRole('menuitem', { name: /remove phone number/i });
      await userEvent.click(getByRole('menuitem', { name: /remove phone number/i }));
      await findByRole('heading', { name: /remove phone number/i });

      expect(queryByRole('heading', { name: /remove phone number/i })).toBeInTheDocument();
    });

    it('closes remove phone number form when add phone number action is clicked', async () => {
      const { wrapper, fixtures } = await createFixtures(withNumberCofig);
      const { findByRole, getByText, userEvent, getByRole, queryByRole } = render(
        <CardStateProvider>
          <PhoneSection />
        </CardStateProvider>,
        { wrapper },
      );

      fixtures.clerk.user?.phoneNumbers[0].destroy.mockResolvedValue();

      const item = getByText(numbers[0]);
      const menuButton = getMenuItemFromText(item);
      await act(async () => {
        await userEvent.click(menuButton!);
      });

      getByRole('menuitem', { name: /remove phone number/i });
      await userEvent.click(getByRole('menuitem', { name: /remove phone number/i }));
      await findByRole('heading', { name: /remove phone number/i });

      await userEvent.click(getByRole('button', { name: /add phone number/i }));
      await findByRole('heading', { name: /add phone number/i });

      expect(queryByRole('heading', { name: /add phone number/i })).toBeInTheDocument();
    });
  });

  it.todo('Test for verification of added phone number');
});
