import React from 'react';

import { bindCreateFixtures, render, screen } from '../../../../testUtils';
import { SignUpVerifyEmail } from '../SignUpVerifyEmail';

const { createFixtures } = bindCreateFixtures('SignUp');

describe('SignUpVerifyEmail', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures();
    render(<SignUpVerifyEmail />, { wrapper });
    screen.getByText(/verify/i);
  });

  it('shows the email associated with the sign up', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
      f.startSignUpWithEmailAddress({ emailAddress: 'test@clerk.dev' });
    });
    render(<SignUpVerifyEmail />, { wrapper });
    screen.getByText('test@clerk.dev');
  });
});
