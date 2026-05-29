import { waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';
import { loadCountryCodeData } from '@/ui/elements/PhoneInput/countryCodeDataLoader';

import { SignUpVerifyPhone } from '../SignUpVerifyPhone';

const { createFixtures } = bindCreateFixtures('SignUp');

beforeAll(async () => {
  await loadCountryCodeData();
});

describe('SignUpVerifyPhone', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures();
    render(<SignUpVerifyPhone />, { wrapper });
    screen.getByText(/verify/i);
  });

  it('shows the phone number associated with the sign up', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withPhoneNumber({ required: true });
      f.startSignUpWithPhoneNumber({ phoneNumber: '+306911111111' });
    });
    fixtures.signUp.preparePhoneNumberVerification.mockRejectedValue(null);
    const { findByText } = render(<SignUpVerifyPhone />, { wrapper });
    await waitFor(async () => expect(await findByText('+30 691 1111111')).toBeInTheDocument());
  });

  it('shows the verify with code message', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withPhoneNumber({ required: true });
      f.startSignUpWithPhoneNumber();
    });
    fixtures.signUp.preparePhoneNumberVerification.mockRejectedValue(null);
    const { findByText } = render(<SignUpVerifyPhone />, { wrapper });
    await waitFor(async () => expect(await findByText(/Verify your phone/i)).toBeInTheDocument());
    await waitFor(async () =>
      expect(await findByText(/Enter the verification code sent to your phone/i)).toBeInTheDocument(),
    );
  });

  it('clicking on the edit icon navigates to the previous route', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withPhoneNumber({ required: true });
      f.startSignUpWithPhoneNumber();
    });
    fixtures.signUp.preparePhoneNumberVerification.mockRejectedValue(null);
    const { userEvent } = render(<SignUpVerifyPhone />, { wrapper });
    await userEvent.click(
      screen.getByRole('button', {
        name: /edit/i,
      }),
    );
    expect(fixtures.router.navigate).toHaveBeenCalledWith('../', { searchParams: new URLSearchParams() });
  });

  it('Resend code button exists', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withPhoneNumber({ required: true });
      f.startSignUpWithEmailAddress({ emailAddress: 'test@clerk.com' });
    });
    fixtures.signUp.preparePhoneNumberVerification.mockRejectedValue(null);
    const { findByText } = render(<SignUpVerifyPhone />, { wrapper });
    await waitFor(async () => expect((await findByText(/Resend/i)).tagName.toUpperCase()).toBe('BUTTON'));
  });

  it.todo('Resend code button is pressable after 30 seconds');
});
