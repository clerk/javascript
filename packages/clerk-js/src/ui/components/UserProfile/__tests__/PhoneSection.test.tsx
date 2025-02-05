import { describe, it } from '@jest/globals';
import { act, waitFor } from '@testing-library/react';

import { render, screen } from '../../../../testUtils';
import { CardStateProvider } from '../../../elements';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { PhoneSection } from '../PhoneSection';

const { createFixtures } = bindCreateFixtures('UserProfile');

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

      const { getByRole, userEvent, getByLabelText, getByText } = render(<PhoneSection />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Add phone number' }));
      await waitFor(() => getByRole('heading', { name: /Add phone number/i }));

      getByLabelText(/phone number/i);
      getByText(/A text message containing a verification code will be sent to this phone number./i);
      getByText(/Message and data rates may apply./i);
    });

    it('create a new phone number', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      const { getByRole, userEvent, getByLabelText } = render(<PhoneSection />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Add phone number' }));
      await waitFor(() => getByRole('heading', { name: /Add phone number/i }));

      fixtures.clerk.user?.createPhoneNumber.mockReturnValueOnce(Promise.resolve({} as any));

      await userEvent.type(getByLabelText(/phone number/i), '6911111111');
      await userEvent.click(getByRole('button', { name: /add$/i }));
      expect(fixtures.clerk.user?.createPhoneNumber).toHaveBeenCalledWith({ phoneNumber: '+16911111111' }); //default is +1
    });

    describe('Form buttons', () => {
      it('save button is disabled by default', async () => {
        const { wrapper } = await createFixtures(initConfig);
        const { getByRole, userEvent } = render(<PhoneSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: 'Add phone number' }));
        await waitFor(() => getByRole('heading', { name: /Add phone number/i }));

        expect(screen.getByText(/add$/i, { exact: false }).closest('button')).toHaveAttribute('disabled');
      });

      it('hides screen when when pressing cancel', async () => {
        const { wrapper } = await createFixtures(initConfig);

        const { userEvent, getByRole, queryByRole } = render(<PhoneSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: /Add phone number/i }));
        await waitFor(() => getByRole('heading', { name: /Add phone number/i }));
        expect(queryByRole('button', { name: /Add phone number/i })).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: /cancel$/i }));
        await waitFor(() => getByRole('button', { name: /Add phone number/i }));
        expect(queryByRole('heading', { name: /Add phone number/i })).not.toBeInTheDocument();
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

      const { getByText, userEvent, getByRole } = render(
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
      await waitFor(() => getByRole('heading', { name: /Remove phone number/i }));
    });

    it('removes a phone number', async () => {
      const { wrapper, fixtures } = await createFixtures(withNumberCofig);
      const { getByText, userEvent, getByRole, queryByRole } = render(
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
      await waitFor(() => getByRole('heading', { name: /Remove phone number/i }));

      await userEvent.click(getByRole('button', { name: /remove/i }));
      expect(fixtures.clerk.user?.phoneNumbers[0].destroy).toHaveBeenCalled();

      await waitFor(() => expect(queryByRole('heading', { name: /Remove phone number/i })).not.toBeInTheDocument());
    });

    describe('Form buttons', () => {
      it('save button is not disabled by default', async () => {
        const { wrapper } = await createFixtures(withNumberCofig);
        const { getByRole, userEvent, getByText } = render(
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
        await waitFor(() => getByRole('heading', { name: /Remove phone number/i }));
        expect(getByRole('button', { name: /remove$/i })).not.toHaveAttribute('disabled');
      });

      it('hides screen when when pressing cancel', async () => {
        const { wrapper } = await createFixtures(withNumberCofig);
        const { getByRole, userEvent, getByText, queryByRole } = render(
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
        await waitFor(() => getByRole('heading', { name: /Remove phone number/i }));
        await userEvent.click(screen.getByRole('button', { name: /cancel$/i }));
        expect(queryByRole('heading', { name: /Remove phone number/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Handles opening/closing actions', () => {
    it('closes add phone number form when remove an phone number action is clicked', async () => {
      const { wrapper, fixtures } = await createFixtures(withNumberCofig);
      const { getByText, userEvent, getByRole, queryByRole } = render(
        <CardStateProvider>
          <PhoneSection />
        </CardStateProvider>,
        { wrapper },
      );

      fixtures.clerk.user?.phoneNumbers[0].destroy.mockResolvedValue();

      await userEvent.click(getByRole('button', { name: /add phone number/i }));
      await waitFor(() => getByRole('heading', { name: /add phone number/i }));

      const item = getByText(numbers[0]);
      const menuButton = getMenuItemFromText(item);
      await act(async () => {
        await userEvent.click(menuButton!);
      });

      getByRole('menuitem', { name: /remove phone number/i });
      await userEvent.click(getByRole('menuitem', { name: /remove phone number/i }));
      await waitFor(() => getByRole('heading', { name: /remove phone number/i }));

      await waitFor(() => expect(queryByRole('heading', { name: /remove phone number/i })).toBeInTheDocument());
      await waitFor(() => expect(queryByRole('heading', { name: /add phone number/i })).not.toBeInTheDocument());
    });

    it('closes remove phone number form when add phone number action is clicked', async () => {
      const { wrapper, fixtures } = await createFixtures(withNumberCofig);
      const { getByText, userEvent, getByRole, queryByRole } = render(
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
      await waitFor(() => getByRole('heading', { name: /remove phone number/i }));

      await userEvent.click(getByRole('button', { name: /add phone number/i }));
      await waitFor(() => getByRole('heading', { name: /add phone number/i }));

      await waitFor(() => expect(queryByRole('heading', { name: /remove phone number/i })).not.toBeInTheDocument());
      await waitFor(() => expect(queryByRole('heading', { name: /add phone number/i })).toBeInTheDocument());
    });
  });

  it.todo('Test for verification of added phone number');
});
