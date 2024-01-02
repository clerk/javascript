import React from 'react';

import { bindCreateFixtures, render, screen } from '../../../../testUtils';
import { SignUpVerifyPhone } from '../SignUpVerifyPhone';

const { createFixtures } = bindCreateFixtures('SignUp');

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
    render(<SignUpVerifyPhone />, { wrapper });
    screen.getByText('+30 691 1111111');
  });

  it('shows the verify with code message', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withPhoneNumber({ required: true });
      f.startSignUpWithPhoneNumber();
    });
    fixtures.signUp.preparePhoneNumberVerification.mockRejectedValue(null);
    render(<SignUpVerifyPhone />, { wrapper });
    screen.getAllByText(/Verification Code/i);
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
    ),
      expect(fixtures.router.navigate).toHaveBeenCalledWith('../');
  });

  it('Resend code button exists', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withPhoneNumber({ required: true });
      f.startSignUpWithEmailAddress({ emailAddress: 'test@clerk.dev' });
    });
    fixtures.signUp.preparePhoneNumberVerification.mockRejectedValue(null);
    render(<SignUpVerifyPhone />, { wrapper });
    const resendButton = screen.getByText(/Resend/i);
    expect(resendButton.tagName.toUpperCase()).toBe('BUTTON');
  });

  it.todo('Resend code button is pressable after 30 seconds');
});
