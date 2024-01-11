import { describe, it } from '@jest/globals';
import { waitFor } from '@testing-library/react';

import { render, screen } from '../../../../testUtils';
import { CardStateProvider } from '../../../elements';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { PhoneSection } from '../PhoneSection';

const { createFixtures } = bindCreateFixtures('UserProfile');

const initConfig = createFixtures.config(f => {
  f.withPhoneNumber();
  f.withUser({ email_addresses: ['test@clerk.com'] });
});

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
      await userEvent.click(getByRole('button', { name: 'Add a phone number' }));
      await waitFor(() => getByRole('heading', { name: /Add phone number/i }));

      getByLabelText(/phone number/i);
      getByText(/A text message containing a verification link will be sent to this phone number./i);
      getByText(/Message and data rates may apply./i);
    });

    it('create a new phone number', async () => {
      const { wrapper, fixtures } = await createFixtures(initConfig);

      const { getByRole, userEvent, getByLabelText } = render(<PhoneSection />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Add a phone number' }));
      await waitFor(() => getByRole('heading', { name: /Add phone number/i }));

      fixtures.clerk.user?.createPhoneNumber.mockReturnValueOnce(Promise.resolve({} as any));

      await userEvent.type(getByLabelText(/phone number/i), '6911111111');
      await userEvent.click(getByRole('button', { name: /save$/i }));
      expect(fixtures.clerk.user?.createPhoneNumber).toHaveBeenCalledWith({ phoneNumber: '+16911111111' }); //default is +1
    });

    describe('Form buttons', () => {
      it('save button is disabled by default', async () => {
        const { wrapper } = await createFixtures(initConfig);
        const { getByRole, userEvent } = render(<PhoneSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: 'Add a phone number' }));
        await waitFor(() => getByRole('heading', { name: /Add phone number/i }));

        expect(screen.getByText(/save$/i, { exact: false }).closest('button')).toHaveAttribute('disabled');
      });

      it('hides screen when when pressing cancel', async () => {
        const { wrapper } = await createFixtures(initConfig);

        const { userEvent, getByRole, queryByRole } = render(<PhoneSection />, { wrapper });
        await userEvent.click(getByRole('button', { name: /Add a phone number/i }));
        await waitFor(() => getByRole('heading', { name: /Add phone number/i }));
        expect(queryByRole('button', { name: /Add a phone number/i })).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: /cancel$/i }));
        await waitFor(() => getByRole('button', { name: /Add a phone number/i }));
        expect(queryByRole('heading', { name: /Add phone number/i })).not.toBeInTheDocument();
      });
    });
  });

  // TODO-RETHEME: Test Removal
  describe('Remove phone', () => {});

  it.todo('Test for verification of added phone number');
});
